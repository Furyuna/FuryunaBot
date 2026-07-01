const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('../../utils/database.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('xp-ver')
        .setDescription('Bir kullanıcıya XP ve Para verir (Sadece Yetkililer).')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addUserOption(opt => opt.setName('kullanici').setDescription('Kullanıcı').setRequired(true))
        .addIntegerOption(opt => opt.setName('miktar').setDescription('XP Miktarı').setRequired(true))
        .addIntegerOption(opt => opt.setName('para').setDescription('Para Miktarı (Opsiyonel)').setRequired(false)),

    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return interaction.reply({ content: '⛔ Bu komutu kullanmak için **Yönetici** yetkisine sahip olmalısın.', ephemeral: false });
        }

        const userId = interaction.options.getUser('kullanici').id;
        db.getUser(userId); // Satır yoksa oluştur (aksi halde UPDATE sessizce başarısız olur)

        const xpAmount = interaction.options.getInteger('miktar');
        const moneyAmount = interaction.options.getInteger('para') || 0;

        db.addXp(userId, xpAmount);
        if (moneyAmount > 0) db.addMoney(userId, moneyAmount);

        await interaction.reply({
            content: `✅ <@${userId}> kullanıcısına **${xpAmount} XP** ve **${moneyAmount} FCoin** verildi!\n(Not: Seviye atlama işlemi bir sonraki mesajında gerçekleşir).`
        });
    }
};
