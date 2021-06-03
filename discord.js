// Packages
const Discord = require('discord.js');
const { Signale } = require('signale');
const pool = require('./pool');

// Config
const config = require('./config.json');

// Variables
const intents = new Discord.Intents();
if (config.discord['privileged-intents']) intents.add('GUILD_MEMBERS', 'DIRECT_MESSAGES');
const client = new Discord.Client({ ws: { intents: intents } });
const logger = new Signale({ scope: 'Discord' });

// Function to start the Discord bot
function main() {
    logger.info('Logging in...');
    client.login(config.discord.token).catch(() => {
        logger.fatal('Failed to login!');
        process.exit(0);
    }).then(() => {
        logger.success('Logged in!');
    });
}

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
    } catch () {
        logger.error(`Failed to add role to user ${userID}!`);
    }
}

module.exports = {
    run: main,
    addRole
};
