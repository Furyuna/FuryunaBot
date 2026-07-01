const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('../../utils/database.js');
const { syncRankRole } = require('../../utils/rankUtils.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('puan-ver')
        .setDescription('Bir kullanıcıya Rütbe/Aktiflik Puanı verir (Sadece Yetkililer).')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addUserOption(opt => opt.setName('kullanici').setDescription('Kullanıcı').setRequired(true))
        .addIntegerOption(opt => opt.setName('miktar').setDescription('Puan Miktarı').setRequired(true)),

    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return interaction.reply({ content: '⛔ Bu komutu kullanmak için **Yönetici** yetkisine sahip olmalısın.', ephemeral: false });
        }

        const userId = interaction.options.getUser('kullanici').id;
        const amount = interaction.options.getInteger('miktar');
        if (amount <= 0) return interaction.reply({ content: '❌ Pozitif bir miktar girin.', ephemeral: false });

        db.addActivityPoints(userId, amount);

        // Rol senkronizasyonu
        const member = await interaction.guild.members.fetch(userId).catch(() => null);
        if (member) await syncRankRole(member);

        await interaction.reply({
            content: `📈 <@${userId}> kullanıcısına **${amount} Aktiflik Puanı** verildi ve rolleri güncellendi!`
        });
    }
};
