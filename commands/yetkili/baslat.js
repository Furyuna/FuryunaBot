const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const revivalHandler = require('../../handlers/events/revivalHandler');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('baslat')
        .setDescription('Manuel olarak bir etkinlik başlatır.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption(option =>
            option.setName('etkinlik')
                .setDescription('Başlatılacak etkinlik türü (Boş bırakılırsa sıradaki başlar)')
                .setRequired(false)
                .addChoices(
                    { name: '🧠 Bilgi Yarışması (Quiz)', value: 'quiz' },
                    { name: '➕ Matematik Sorusu', value: 'math' },
                    { name: '💸 Kelime Kapmaca (Drop)', value: 'drop' }
                )),
    async execute(interaction) {
        const type = interaction.options.getString('etkinlik');

        const eventName = type ? type.toUpperCase() : 'SIRADAKİ';
        await interaction.reply({ content: `⏳ **${eventName}** etkinliği başlatılıyor...`, ephemeral: true });

        // Handler'ı tetikle
        const success = await revivalHandler.forceEvent(interaction.client, type);

        if (success) {
            await interaction.followUp({ content: `✅ **${eventName}** başarıyla başlatıldı!`, ephemeral: true });
        } else {
            await interaction.followUp({ content: `❌ Hata: Etkinlik kanalı bulunamadı veya bir sorun var.`, ephemeral: true });
        }
    }
};
