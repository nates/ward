
const { SlashCommandBuilder } = require("discord.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("ping")
		.setDescription(
			"Test to see if bot is online."
		),

	async execute(interaction) {
        interaction.reply("Pong!");
	},
};