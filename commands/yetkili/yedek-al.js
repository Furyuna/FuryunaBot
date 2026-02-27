const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('yedek-al')
        .setDescription('Veritabanının anlık yedeğini alır (Sadece Yönetici).')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return interaction.reply({ content: '⛔ Bu komutu kullanmak için **Yönetici** yetkisine sahip olmalısın.', ephemeral: true });
        }

        await interaction.deferReply();

        try {
            // Client üzerinden backup sistemine eriş
            const backupSystem = interaction.client.backupSystem;

            if (!backupSystem) {
                return interaction.editReply('❌ Yedekleme sistemi başlatılamamış. Lütfen geliştiriciye bildirin.');
            }

            const backupPath = await backupSystem.createBackup();

            if (backupPath) {
                const fileName = backupPath.split('/').pop();
                return interaction.editReply(`✅ **Yedekleme Başarılı!**\n📂 Dosya Adı: \`${fileName}\`\n🕒 Konum: \`/backups/\``);
            } else {
                return interaction.editReply('❌ Yedekleme sırasında bir hata oluştu. Konsolu kontrol edin.');
            }

        } catch (error) {
            console.error(error);
            return interaction.editReply('❌ Beklenmedik bir hata oluştu.');
        }
    }
};
