
const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require("discord.js");
const config = require("../../../config.js");
const pool = require("../../../pool.js")

module.exports = {
	data: new SlashCommandBuilder()
		.setName("verify")
		.setDescription(
			"Verify yourself in the server!"
		),

	async execute(interaction) {
        const domain = config.server.domain === 'localhost' ? `${config.server.domain}:${config.server.httpPort}` : `${config.server.domain}`; 

        if(interaction.member.roles.cache.some(r => r.id === config.Discord.verifiedRole)) {
            await interaction.reply("Whoops, you are already verified!");
            return;
        }

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

        if(config.Discord.rulesEnabled) {
            await interaction.reply('Please check your DMS!')

            const linkID = pool.createLink(interaction.user.id);

            const captchaEmbed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('reCAPTCHA Verification')
            .setDescription(`To gain access to this server you must solve a captcha. The link will expire in 15 minutes.\n${config.server.https ? 'https://' : 'http://'}${domain}/verify/${linkID}`)

            await interaction.user.createDM().then(async (dm) => {
                await dm.send({ embeds: [captchaEmbed] }).catch(() => {
                    logger.error(`Failed to send captcha to user! (Maybe they have DMs turned off?)`);
                });
            });

        } else {
            await interaction.reply('Please check your DMS!')

            const linkID = pool.createLink(interaction.user.id);

            const captchaEmbed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('reCAPTCHA Verification')
            .setDescription(`To gain access to this server you must solve a captcha. The link will expire in 15 minutes.\n${config.server.https ? 'https://' : 'http://'}${domain}/verify/${linkID}`)

            await interaction.user.createDM().then(async (dm) => {
                await dm.send({ embeds: [captchaEmbed] }).catch(() => {
                    logger.error(`Failed to send captcha to user! (Maybe they have DMs turned off?)`);
                })

            });
        }
    },
};