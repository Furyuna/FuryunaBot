const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../../utils/database.js');

const config = require('./config.js').levelSystem;

module.exports = {
    data: new SlashCommandBuilder()
        .setName(config.commands.leaderboard || 'sıralama')
        .setDescription('En yüksek seviyeye sahip üyeleri gösterir.'),

    async execute(interaction) {
        const leaderboard = db.getLeaderboard(10); // İlk 10
        const activityLeaderboard = db.getActivityLeaderboard(10); // Aktiflik sıralaması

        // 0'dan büyük olanları filtrele
        const filteredLevel = leaderboard.filter(u => u.xp > 0);
        const filteredActivity = activityLeaderboard.filter(u => (u.activity_points || 0) > 0);

        if (filteredLevel.length === 0 && filteredActivity.length === 0) {
            return interaction.reply('Henüz sıralamada kimse yok. Sohbet etmeye başlayın!');
        }

        // Seviye Sıralaması
        const levelRanking = filteredLevel.length > 0
            ? filteredLevel.map((u, index) => {
                let medal = '';
                if (index === 0) medal = '🥇';
                else if (index === 1) medal = '🥈';
                else if (index === 2) medal = '🥉';
                else medal = `**${index + 1}.**`;

                return `${medal} <@${u.user_id}> - **Lvl ${u.level}** (${u.xp} XP)`;
            }).join('\n')
            : '*Henüz veri yok*';

        // Aktiflik Sıralaması (Rütbe)
        const activityRanking = filteredActivity.length > 0
            ? filteredActivity.map((u, index) => {
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
