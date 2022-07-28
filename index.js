
// —— Requiring the packages the we need.
const fs = require("fs");
const { Client, Collection, Partials } = require("discord.js");
const { Signale } = require('signale');
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const express = require('express');
const path = require('path');
const axios = require('axios');
const https = require('https');
const pool = require('./pool');
const config = require("./config.js");
const logger = new Signale({ scope: 'Discord' });

// —— Initializing the client.
const client = new Client({ 
    intents: [ 131071 ], // Basically for (most?) of the intents.
    partials: [
        Partials.Channel
    ] 
});

// —— All event files of the event handler.
 const eventFiles = fs
 .readdirSync("./events")
 .filter((file) => file.endsWith(".js"));

for (const file of eventFiles) {
 const event = require(`./events/${file}`);
 if (event.once) {
     client.once(event.name, (...args) => event.execute(...args, client));
 } else {
     client.on(event.name, async (...args) => await event.execute(...args, client));
 }
}

client.slashCommands = new Collection();

// —— Registration of Slash-Command Interactions.
const slashCommands = fs.readdirSync("./public/slash");

for (const module of slashCommands) {
	const commandFiles = fs
		.readdirSync(`./public/slash/${module}`)
		.filter((file) => file.endsWith(".js"));

	for (const commandFile of commandFiles) {
		const command = require(`./public/slash/${module}/${commandFile}`);
		client.slashCommands.set(command.data.name, command);
	}
}

// —— Registration of Slash-Commands in Discord API
const rest = new REST({ version: "9" }).setToken(config.Discord.token);

const commandJsonData = [
	...Array.from(client.slashCommands.values()).map((c) => c.data.toJSON()),
];

(async () => {
	try {
		logger.success("Started refreshing application (/) commands.");
		await rest.put(Routes.applicationGuildCommands(config.Discord.botId, config.Discord.guildId), { body: commandJsonData });
		logger.success("Successfully reloaded application (/) commands.");
	} catch (error) {
		console.error(error);
	}
})();

async function addRole(userID) {
    try {
		const guild = await client.guilds.fetch(config.Discord.guildId),
        	 role = await guild.roles.fetch(config.Discord.verifiedRole),
          	 member = await guild.members.fetch(userID);

        member.roles.add(role)
			.catch(() => {
				logger.error(`Failed to add role to user ${member.user.tag}! (Maybe verified role is above bot role?)`);
				return;
        	})
			.then(() => {
				logger.info(`Added verified role to user ${member.user.tag}.`);
			})
    } catch (e) {
		console.log(e)
        logger.error(`Failed to add role to user ${userID}!`);
    }
}

async function removeRole(userID) {
    const removeRole = config.Discord.removeRole

	if(removeRole) {
		try {
			const guild = await client.guilds.fetch(config.Discord.guildId),
				 removeRoleId = await guild.roles.fetch(config.Discord.removeRoleId),
				 member = await guild.members.fetch(userID);

			member.roles.remove(removeRoleId)
				.catch(() => {
					logger.error(`Failed to remove role from user ${member.user.tag}! (Maybe role is above bot role?)`);
					return;
				})
				.then(() => {
					logger.info(`Removed role from user ${member.user.tag}.`);
				})
			
		} catch(e) {
			logger.error(`Failed to remove role from user ${userID}!`);
		}
	} else {
		logger.info(`Remove role is set to false, step skipped.`)
	}  
}

// —— Login into your client application with bot's token.
client.login(config.Discord.token)
	.catch(() => {
		logger.fatal('Failed to login! Is your intents enabled?');
		process.exit(0);
	})

// —— And another thingy.
const app = express(),
     port = config.server.https ? 443 : config.server.httpPort;

// —— Define render engine and assets path
app.engine('html', require('ejs').renderFile);
app.use(express.static(path.join(__dirname, '/assets')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// GET /verify/id
app.get('/verify/:verifyId?', (req, res) => {
    if (!req.params.verifyId) return res.sendFile(path.join(__dirname, '/html/invalidLink.html'));
    if (!pool.isValidLink(req.params.verifyId)) return res.sendFile(path.join(__dirname, '/html/invalidLink.html'));
    res.render(path.join(__dirname, '/html/verify.html'), { publicKey: config.reCAPTCHA.publicKey });
});

// POST /verify/id
app.post('/verify/:verifyId?', async (req, res) => {
    if (!req.body || !req.body['g-recaptcha-response']) return res.sendFile(path.join(__dirname, '/html/invalidLink.html'));

    const response = await axios({
        method: 'post',
        url: `https://www.google.com/recaptcha/api/siteverify?secret=${config.reCAPTCHA.secretKey}&response=${req.body['g-recaptcha-response']}`,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    });

    if (!response.data.success) return res.sendFile(path.join(__dirname, '/html/invalidCaptcha.html'));
    if (!pool.isValidLink(req.params.verifyId)) return res.sendFile(path.join(__dirname, '/html/invalidLink.html'));
    await addRole(pool.getDiscordId(req.params.verifyId));
    await removeRole(pool.getDiscordId(req.params.verifyId));
    pool.removeLink(req.params.verifyId);
    res.sendFile(path.join(__dirname, '/html/valid.html'));
});

const start = () => {
	if (config.https) {
		https.createServer({
			key: fs.readFileSync('private.pem'),
			cert: fs.readFileSync('certificate.pem')
		}, app).listen(port, () => logger.info(`Listening on port ${port}.`));
	} else {
		app.listen(port, () => logger.info(`Listening on port ${port}.`));
	}
}

// —— Start the server
start();
