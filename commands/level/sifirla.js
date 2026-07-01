const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('../../utils/database.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('sifirla')
        .setDescription('Bir kullanıcının TÜM verilerini (XP, Level, Para, Aktiflik) sıfırlar (Sadece Yetkililer).')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addUserOption(opt => opt.setName('kullanici').setDescription('Kullanıcı').setRequired(true)),

    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return interaction.reply({ content: '⛔ Bu komutu kullanmak için **Yönetici** yetkisine sahip olmalısın.', ephemeral: false });
        }

        const userId = interaction.options.getUser('kullanici').id;

        try {
            db._db.prepare('UPDATE users SET xp = 0, level = 0, money = 0, activity_points = 0 WHERE user_id = ?').run(userId);
            await interaction.reply({
                content: `♻️ <@${userId}> kullanıcısının tüm verileri sıfırlandı!`
            });
        } catch (e) {
            console.error(e);
            await interaction.reply({ content: '❌ Sıfırlama sırasında bir hata oluştu.' });
        }
    }
};
