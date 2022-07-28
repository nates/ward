
const { EmbedBuilder } = require('discord.js');
const pool = require('../pool.js');

module.exports = {
	name: "interactionCreate",

	async execute(interaction) {
	
        if(!interaction.isButton()) return;
            if(interaction.customId === 'rules') {
                logger.info('User agreed to the rules!');
                interaction.user.createDM().then(dm => {
                    dm.send("You have sucessfully agreed to rules.").catch(console.error);
                    const linkID = pool.createLink(interaction.user.id);

                    const captchaEmbed = new EmbedBuilder()
                        .setColor('#0099ff')
                        .setTitle('reCAPTCHA Verification')
                        .setDescription(`To gain access to this server you must solve a captcha. The link will expire in 15 minutes.\n${config.https ? 'https://' : 'http://'}${config.domain}/verify/${linkID}`)
                
                    dm.send({ embeds: [captchaEmbed] }).catch(() => {
                        logger.error(`Failed to send captcha to user! (Maybe they have DMs turned off?)`);
                    });
                })
            }
	},
};