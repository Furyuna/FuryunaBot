const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../../utils/database.js');

const config = require('./config.js').levelSystem;

module.exports = {
    data: new SlashCommandBuilder()
        .setName(config.commands.profile || 'profil')
        .setDescription('Kendinizin veya başka bir kullanıcının seviye ve parasını gösterir.')
        .addUserOption(option => option.setName('kullanici').setDescription('Görüntülenecek kullanıcı').setRequired(false)),

    async execute(interaction) {
        try {
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

            // % Hesaplaması (XP)
            const xpPercentage = Math.floor((currentLevelXp / xpPerLevel) * 100);

            // % Hesaplaması (Rank)
            let rankPercentage = 0;
            let rankProgressText = "Maksimum Seviye";

            if (nextRankThreshold !== "MAX") {
                rankPercentage = Math.floor((user.activity_points / nextRankThreshold) * 100);
                if (rankPercentage > 100) rankPercentage = 100;
                rankProgressText = `${user.activity_points} / ${nextRankThreshold}`;
            } else {
                rankPercentage = 100;
                rankProgressText = `${user.activity_points} (Max)`;
            }

            // Helper function for custom progress bars
            const createProgressBar = (percent, filledChar = '🟩', emptyChar = '⬛') => {
                const barSize = 10;
                const progress = Math.round((percent / 100) * barSize);
                const empty = barSize - progress;
                return filledChar.repeat(progress) + emptyChar.repeat(empty);
            };

            const levelBar = createProgressBar(xpPercentage, '🟩', '⬛');
            const rankBar = createProgressBar(rankPercentage, '🟨', '⬛');

            // "Yok Üye" yerine daha düzgün bir tabir veya rütbe varsa onu göster
            const displayRank = (rankName === "Yok" || rankName === "N/A") ? "Rütbesiz" : rankName;

            const embed = new EmbedBuilder()
                .setColor(rankColor) // Rengi rütbeye göre ayarla
                .setAuthor({ name: `${targetUser.username}`, iconURL: targetUser.displayAvatarURL() })
                .setDescription(`**${displayRank} • Seviye ${user.level}**`)
                .addFields(
                    {
                        name: '🏆 Seviye İlerlemesi',
                        value: `${levelBar} %${xpPercentage}\nXP: ${currentLevelXp} / ${xpPerLevel}`,
                        inline: false
                    },
                    {
                        name: '🎖️ Rütbe İlerlemesi',
                        value: `${rankBar} %${rankPercentage}\nPuan: ${rankProgressText}\nSonraki: ${nextRankName}`,
                        inline: false
                    },
                    {
                        name: '👜 Cüzdan',
                        value: `💸 ${user.money} Furyuna Coin`,
                        inline: false
                    }
                )
                .setThumbnail(targetUser.displayAvatarURL({ dynamic: true, size: 256 }))
                .setFooter({ text: 'FuryunaBot • Aktiflik Ödül Sistemi', iconURL: interaction.client.user.displayAvatarURL() });

            await interaction.reply({ embeds: [embed] });

        } catch (error) {
            console.error(error);
            if (!interaction.replied) {
                await interaction.reply({ content: '❌ Bir hata oluştu.', ephemeral: true });
            }
        }
    }
};

