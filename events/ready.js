const { Events } = require('discord.js');

module.exports = {
	name: Events.ClientReady,
	once: true,
	execute(client) {
		console.log(`✅ Bot Çevrimiçi: ${client.user.tag}`);

		// Bump Sistemi Başlatma (State Restoration)
		const bumpHandler = require('../handlers/events/bumpHandler.js');
		bumpHandler.initialize(client);
	},
};

