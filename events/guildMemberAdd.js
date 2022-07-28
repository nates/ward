
// —— dot. 
const { Signale } = require('signale');
const { EmbedBuilder } = require('discord.js');
const logger = new Signale({ scope: 'Discord' });
const config = require('../config.js');
const pool = require('../pool.js');

module.exports = {
	name: "guildMemberAdd",

	async execute(member) {
        const domain = config.server.domain === 'localhost' ? `${config.server.domain}:${config.server.httpPort}` : `${config.server.domain}`; 
        if(config.Discord.rulesEnabled) {
            const button = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId("rules")
                        .setLabel('Agree')
                        .setEmoji('✅')
                        .setStyle(1)
                    )

            const embed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle('Rules')
                .setDescription(config.Discord.rules);
                
        } else {
            const linkID = pool.createLink(member.id);
            const captchaEmbed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle('reCAPTCHA Verification')
                .setDescription(`To gain access to this server you must solve a captcha. The link will expire in 15 minutes.\n${config.server.https ? 'https://' : 'http://'}${domain}/verify/${linkID}`)

            member.send({ embeds: [captchaEmbed] }).catch(() => {
                logger.error(`Failed to send captcha to user! (Maybe they have DMs turned off?)`);
            });    
        }
        
	},
};