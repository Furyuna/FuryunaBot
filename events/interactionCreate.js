const { Events } = require('discord.js');

module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {
		if (!interaction.isChatInputCommand() && !interaction.isContextMenuCommand()) return;

		let commandKey = interaction.commandName;

		// Eğer Context Menu ise (Sağ Tık), key'i ona göre oluştur (İsim_Type)
		if (interaction.isContextMenuCommand()) {
			commandKey = `${interaction.commandName}_${interaction.commandType}`;
		}

		const command = interaction.client.commands.get(commandKey);

		if (!command) {
			console.error(`${interaction.commandName} komutu bulunamadı.`);
			return;
		}

		try {
			await command.execute(interaction);
		} catch (error) {
			console.error(error);
			if (interaction.replied || interaction.deferred) {
				await interaction.followUp({ content: 'Bu komutu çalıştırırken bir hata oluştu!', ephemeral: true });
			} else {
				await interaction.reply({ content: 'Bu komutu çalıştırırken bir hata oluştu!', ephemeral: true });
			}
		}
	},
};
