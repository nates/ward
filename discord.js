const Discord = require('discord.js');
const pool = require('./pool');
const client = new Discord.Client();
const {
    discord_guild_id,
    discord_bot_token,
    discord_verified_role,
    domain
} = require('./variables')

client.on('ready', () => {
    console.log('[Discord] Bot started.')
})

client.on('guildMemberAdd', member => {
    const linkId = pool.createLink(member.id);
    const embed = new Discord.MessageEmbed()
        .setTitle('reCAPTCHA Verification')
        .setDescription(`To gain access to this server you must solve a captcha. The link will expire in 15 minutes.\nhttp://${domain == '' ? 'localhost:8080' : domain}/verify/${linkId}`)
        .setColor('BLUE')
    member.send(embed)
})

function main() {
    client.login(discord_bot_token).catch(e => {
        console.log('[Discord] Invalid bot token!');
        process.exit(0)
    })
}

async function addRole(discordId) {
    try {
        var guild = await client.guilds.fetch(discord_guild_id);
        var member = await guild.members.fetch(discordId);
        var role = await guild.roles.cache.find(r => r.name === discord_verified_role);
        member.roles.add(role)
        console.log(`Added roles to user ${discordId}.`)
    } catch (e) {
        console.log(`Error adding role to user ${discordId}.`);
    }
}

module.exports = {
    run: main,
    addRole
};
