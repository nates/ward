// Packages
const { Client, Intents, Discord } = require('discord.js');
const { Signale } = require('signale');
const pool = require('./pool');
const { MessageEmbed } = require('discord.js');

// Config
const config = require('./config.json');

// Variables
const myIntents = new Intents();
myIntents.add(Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.DIRECT_MESSAGES);
const client = new Client({ intents: myIntents });
const logger = new Signale({ scope: 'Discord' });

// Function to start the Discord bot
function main() {
    logger.info('Logging in...');
    client.login(config.discord.token).catch(() => {
        logger.fatal('Failed to login! Is your intents enabled?');
        process.exit(0);
    }).then(() => {
        logger.success('Logged in!');
    });
}

// New Status
client.on('ready', () => {
    const status = config.discord['status'];
client.user.setActivity(status, {type: 'PLAYING'});
    logger.success('Status Set!');
});

// Commands
const prefix = config.discord['prefix'];
client.on("messageCreate", (message) => {
  // Exit and stop if the prefix is not there or if user is a bot
  if (!message.content.startsWith(prefix) || message.author.bot) return;
    if(message.content.startsWith(`${prefix}ping`)){
    	message.channel.send('Pong!');
    }
    if(message.content.startsWith(`${prefix}verify`)){
    if (message.member.roles.cache.has(config.discord['verified-role-id'])) {
        message.channel.send('Whoops, your already verified!')
        return;
    }
        message.channel.send('Please check your DMS!')
    	    const linkID = pool.createLink(message.author.id);
    const embed2 = new MessageEmbed()
        .setTitle('reCAPTCHA Verification')
        .setDescription(`To gain access to this server you must solve a captcha. The link will expire in 15 minutes.\n${config.https ? 'https://' : 'http://'}${config.domain}/verify/${linkID}`)
        .setColor('BLUE');
    message.author.send({ embeds: [embed2] }).catch(() => {
        logger.error(`Failed to send captcha to user! (Maybe they have DMs turned off?)`);
    });
    }
});

// Events
// Send user the captcha when they join the server
client.on('guildMemberAdd', member => {
    const linkID = pool.createLink(member.id);
    const embed = new Discord.MessageEmbed()
        .setTitle('reCAPTCHA Verification')
        .setDescription(`To gain access to this server you must solve a captcha. The link will expire in 15 minutes.\n${config.https ? 'https://' : 'http://'}${config.domain}/verify/${linkID}`)
        .setColor('BLUE');
    member.send(embed).catch(() => {
        logger.error(`Failed to send captcha to ${member.user.tag}! (Maybe they have DMs turned off?)`);
    });
});

// Add verified role to user
async function addRole(userID) {
    try {
        const guild = await client.guilds.fetch(config.discord['guild-id']);
        const role = await guild.roles.fetch(config.discord['verified-role-id']);
        const member = await guild.members.fetch(userID);
        member.roles.add(role).catch(() => {
            logger.error(`Failed to add role to user ${member.user.tag}! (Maybe verified role is above bot role?)`);
            return;
        });
        logger.info(`Added verified role to user ${member.user.tag}.`);
    } catch (e) {
        logger.error(`Failed to add role to user ${userID}!`);
    }
}

// Remove another role from user.
async function removeRole(userID) {
    const ifremrole = config.discord['remove-role'];
    if (ifremrole == true) {
    try {
        const guild = await client.guilds.fetch(config.discord['guild-id']);
        const remrole = await guild.roles.fetch(config.discord['remove-role-id']);
        const member = await guild.members.fetch(userID);

        member.roles.remove(remrole).catch(() => {
            logger.error(`Failed to remove role to user ${member.user.tag}! (Maybe role is above bot role?)`);
            return;
        });
        logger.info(`Removed role to user ${member.user.tag}.`);
    } catch (e) {
        logger.error(`Failed to add role to user ${userID}!`);
    }
   } else {
         logger.info(`Remove role is set to false, step skipped.`)
}
}

module.exports = {
    run: main,
    addRole,
    removeRole
};
