const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('../../utils/database.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('level-ayarla')
        .setDescription('Bir kullanıcının seviyesini doğrudan ayarlar (Sadece Yetkililer).')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addUserOption(opt => opt.setName('kullanici').setDescription('Kullanıcı').setRequired(true))
        .addIntegerOption(opt => opt.setName('seviye').setDescription('Yeni Seviye').setRequired(true)),

    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return interaction.reply({ content: '⛔ Bu komutu kullanmak için **Yönetici** yetkisine sahip olmalısın.', ephemeral: false });
        }

        const userId = interaction.options.getUser('kullanici').id;
        db.getUser(userId); // Satır yoksa oluştur

        const newLevel = interaction.options.getInteger('seviye');
        db.setLevel(userId, newLevel);

        await interaction.reply({
            content: `🛠️ <@${userId}> kullanıcısının seviyesi **${newLevel}** olarak ayarlandı.`
        });
    }
};
