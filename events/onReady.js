
// —— dot. 
const { Signale } = require('signale');
const config = require('../config.js');
const logger = new Signale({ scope: 'Discord' });

module.exports = {
	name: "ready",
	once: true,

	async execute(client) {
        logger.success('Bot online!');
        client.user.setPresence({ activities: [{ type: config.Discord.statusType, name: `${config.Discord.statusMsg}` }], status: 'idle' })
        logger.success('Status Set!');
	},
};