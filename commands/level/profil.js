const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../../utils/database.js');

const config = require('./config.js').levelSystem;

module.exports = {
    data: new SlashCommandBuilder()
        .setName(config.commands.profile || 'profil')
        .setDescription('Kendinizin veya başka bir kullanıcının seviye ve parasını gösterir.')
        .addUserOption(option => option.setName('kullanici').setDescription('Görüntülenecek kullanıcı').setRequired(false)),

    async execute(interaction) {
        const targetUser = interaction.options.getUser('kullanici') || interaction.user;
        const targetMember = await interaction.guild.members.fetch(targetUser.id).catch(() => null);

        // Veritabanından çek
        const user = db.getUser(targetUser.id);


        const { levelRewards, rankSystem } = require('./config.js').levelSystem;

        // Rütbe (Rank) Belirleme (YENİ SİSTEM)
        let rankName = "N/A";
        let rankColor = "#ffd700";
        let nextRankName = "Maksimum Rütbe! 👑";
        let nextRankThreshold = "MAX";

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
            // var nextRankName = "Maksimum Rütbe! 👑"; // Moved initialization up
            // var nextRankThreshold = 0; // Moved initialization up
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

        // XP Hesabı ve İlerleme Çubuğu
        const xpPerLevel = config.xpNeededPerLevel || 2000;

        // Bu seviyede ne kadar XP kasmış? (Örn: Lvl 3 ise, 6000 XP taban. 6017 XP varsa -> 17 XP kasmış)
        let currentLevelXp = user.xp - (user.level * xpPerLevel);
        if (currentLevelXp < 0) currentLevelXp = 0; // Hata önleyici

        const percentage = Math.floor((currentLevelXp / xpPerLevel) * 100);

        // Helper function for progress bar (re-created based on old logic)
        const createProgressBar = (percent) => {
            const barSize = 10;
            const progress = Math.round((percent / 100) * barSize);
            const empty = barSize - progress;
            return '🟦'.repeat(progress) + '⬜'.repeat(empty);
        };

        const progressBar = createProgressBar(percentage);

        const embed = new EmbedBuilder()
            .setColor('#FFD700')
            .setAuthor({ name: `${targetUser.username} Profili`, iconURL: targetUser.displayAvatarURL() })
            .addFields(
                { name: 'Rütbe', value: rankName, inline: false },
                { name: 'Aktiflik', value: `${user.activity_points || 0} / ${nextRankThreshold} Puan\n**Sonraki Hedef:** ${nextRankName}`, inline: false },
                { name: '\u200B', value: `${progressBar} (Level İlerlemesi)`, inline: false },
                { name: '🏆 Seviye', value: `${user.level}`, inline: true },
                { name: '🔥 Aktiflik Puanı', value: `${user.activity_points || 0}`, inline: true },
                { name: '✨ Level XP', value: `${currentLevelXp} / ${xpPerLevel}`, inline: true },
                { name: '💸 Furyuna Coin', value: `${user.money}`, inline: true }
            )
            .setFooter({ text: 'FuryunaBot Level & Rank Sistemi' });

        await interaction.reply({ embeds: [embed] });
    }
};

