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

        const { levelRewards, rankSystem } = require('./config.js').levelSystem;

        // Rütbe (Rank) Belirleme (YENİ SİSTEM)
        let rankName = "N/A";
        let rankColor = "#ffd700";

        if (rankSystem && rankSystem.enabled) {
            const currentActivity = user.activity_points || 0;
            const sortedThresholds = Object.keys(rankSystem.thresholds).map(Number).sort((a, b) => a - b);

            // En yüksek rütbeyi bul
            for (let i = sortedThresholds.length - 1; i >= 0; i--) {
                const threshold = sortedThresholds[i];
                if (currentActivity >= threshold) {
                    const roleId = rankSystem.thresholds[threshold];
                    const role = interaction.guild.roles.cache.get(roleId);
                    if (role) {
                        rankName = role.name;
                        rankColor = role.hexColor;
                    }
                    break;
                }
            }

            if (rankName === "N/A") rankName = "Yok";

            // Sonraki Rütbe
            var nextRankName = "Maksimum Rütbe! 👑";
            var nextRankThreshold = 0;
            for (const threshold of sortedThresholds) {
                if (threshold > currentActivity) {
                    const roleId = rankSystem.thresholds[threshold];
                    const role = interaction.guild.roles.cache.get(roleId);
                    nextRankName = role ? role.name : `+${threshold} Puan Rütbesi`;
                    nextRankThreshold = threshold;
                    break;
                }
            }
        } else {
            // Eski sistem (Fallback)
            rankName = "Devre Dışı";
        }

        const embed = new EmbedBuilder()
            .setColor(rankColor)
            .setAuthor({ name: `${targetUser.username} Profili`, iconURL: targetUser.displayAvatarURL() })
            .setDescription(`**Rütbe:** ${rankName}\n**Aktiflik:** ${user.activity_points || 0} / ${nextRankThreshold || 'Max'} Puan\n**Sonraki Hedef:** ${nextRankName}\n\n${progressBar} **(Level İlerlemesi)**`)
            .addFields(
                { name: '🏆 Seviye', value: `**${user.level}**`, inline: true },
                { name: '🔥 Aktiflik Puanı', value: `**${user.activity_points || 0}**`, inline: true },
                { name: '✨ Level XP', value: `${user.xp} / ${nextLevelXp}`, inline: true },
                { name: '💸 Furyuna Coin', value: `**${user.money}**`, inline: true }
            )
            .setFooter({ text: 'FuryunaBot Level & Rank Sistemi' });

        await interaction.reply({ embeds: [embed] });
    }
};
