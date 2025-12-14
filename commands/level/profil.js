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

        // Yüzdelik ve Progress Bar
        const percentage = Math.floor((user.xp / nextLevelXp) * 100);
        const barSize = 10; // Çubuk uzunluğu
        const progress = Math.round((percentage / 100) * barSize);
        const empty = barSize - progress;

        const progressBar = '🟦'.repeat(progress) + '⬜'.repeat(empty); // [🟦🟦⬜⬜...]

        const embed = new EmbedBuilder()
            .setColor('#ffd700') // Gold sürümü
            .setAuthor({ name: `${targetUser.username} Profili`, iconURL: targetUser.displayAvatarURL() })
            .setDescription(`**İlerleme:**\n${progressBar} **%${percentage}**`)
            .addFields(
                { name: '🏆 Seviye', value: `**${user.level}**`, inline: true },
                { name: '✨ XP', value: `${user.xp} / ${nextLevelXp}`, inline: true },
                { name: '💸 Furyuna Coin', value: `**${user.money}**`, inline: true }
            )
            .setFooter({ text: 'FuryunaBot Level Sistemi' });

        await interaction.reply({ embeds: [embed] });
    }
};
