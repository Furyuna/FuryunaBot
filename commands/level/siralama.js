const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../../utils/database.js');

const config = require('./config.js').levelSystem;

module.exports = {
    data: new SlashCommandBuilder()
        .setName(config.commands.leaderboard || 'sıralama')
        .setDescription('En yüksek seviyeye sahip üyeleri gösterir.'),

    async execute(interaction) {
        // Doğrudan veritabanından çek (Filtre Yok)
        const leaderboard = db.getLeaderboard(10);
        const activityLeaderboard = db.getActivityLeaderboard(10);

        if (leaderboard.length === 0 && activityLeaderboard.length === 0) {
            return interaction.reply('Henüz sıralamada kimse yok.');
        }

        // Seviye Sıralaması
        const levelRanking = leaderboard.length > 0
            ? leaderboard.map((u, index) => {
                let medal = '';
                if (index === 0) medal = '🥇';
                else if (index === 1) medal = '🥈';
                else if (index === 2) medal = '🥉';
                else medal = `**${index + 1}.**`;

                return `${medal} <@${u.user_id}> - **Lvl ${u.level}** (${u.xp} XP)`;
            }).join('\n')
            : '*Henüz veri yok*';

        // Aktiflik Sıralaması (Rütbe)
        const activityRanking = activityLeaderboard.length > 0
            ? activityLeaderboard.map((u, index) => {
                let medal = '';
                if (index === 0) medal = '🥇';
                else if (index === 1) medal = '🥈';
                else if (index === 2) medal = '🥉';
                else medal = `**${index + 1}.**`;

                return `${medal} <@${u.user_id}> - **${u.activity_points}** Puan`;
            }).join('\n')
            : '*Henüz veri yok*';

        // Tek embed, iki field
        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('🏆 Furyuna Liderlik Tablosu')
            .addFields(
                { name: '📊 Seviye Sıralaması', value: levelRanking, inline: false },
                { name: '⚡ Aktiflik Sıralaması (Rütbe)', value: activityRanking, inline: false }
            )
            .setFooter({ text: 'FuryunaBot • En Aktif Üyeler', iconURL: interaction.client.user.displayAvatarURL() });

        await interaction.reply({ embeds: [embed] });
    }
};
