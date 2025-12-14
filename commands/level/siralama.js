const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../../utils/database.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('sıralama')
        .setDescription('En yüksek seviyeye sahip üyeleri gösterir.'),

    async execute(interaction) {
        const leaderboard = db.getLeaderboard(10); // İlk 10

        if (leaderboard.length === 0) {
            return interaction.reply('Henüz sıralamada kimse yok. Sohbet etmeye başlayın!');
        }

        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('🏆 Furyuna Liderlik Tablosu')
            .setDescription(
                leaderboard.map((u, index) => {
                    let medal = '';
                    if (index === 0) medal = '🥇';
                    else if (index === 1) medal = '🥈';
                    else if (index === 2) medal = '🥉';
                    else medal = `**${index + 1}.**`;

                    return `${medal} <@${u.user_id}> - **Lvl ${u.level}** (${u.xp} XP)`;
                }).join('\n')
            )
            .setFooter({ text: 'En çok konuşanlar' });

        await interaction.reply({ embeds: [embed] });
    }
};
