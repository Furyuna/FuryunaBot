const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../../utils/database.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('profil')
        .setDescription('Kendinizin veya başka bir kullanıcının seviye ve parasını gösterir.')
        .addUserOption(option => option.setName('kullanici').setDescription('Görüntülenecek kullanıcı').setRequired(false)),

    async execute(interaction) {
        const targetUser = interaction.options.getUser('kullanici') || interaction.user;
        const targetMember = await interaction.guild.members.fetch(targetUser.id).catch(() => null);

        // Veritabanından çek
        const user = db.getUser(targetUser.id);

        // Formül: Sonraki seviye XP'si
        const currentLevel = user.level;
        const nextLevelXp = 5 * Math.pow(currentLevel, 2) + (50 * currentLevel) + 100;

        const embed = new EmbedBuilder()
            .setColor('#ffd700') // Gold rengi
            .setAuthor({ name: `${targetUser.username} Profili`, iconURL: targetUser.displayAvatarURL() })
            .addFields(
                { name: '🏆 Seviye', value: `${user.level}`, inline: true },
                { name: '✨ XP', value: `${user.xp} / ${nextLevelXp}`, inline: true },
                { name: '💸 Furyuna Coin', value: `${user.money}`, inline: true }
            )
            .setFooter({ text: 'FuryunaBot Level Sistemi' });

        await interaction.reply({ embeds: [embed] });
    }
};
