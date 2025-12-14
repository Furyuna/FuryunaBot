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

        const { levelRewards } = require('./config.js').levelSystem;

        // Rütbe (Rank) Belirleme
        let rankName = "N/A"; // Varsayılan
        let rankColor = "#ffd700"; // Varsayılan renk

        // Config'deki ödülleri kontrol et
        const sortedLevels = Object.keys(levelRewards).map(Number).sort((a, b) => a - b); // Küçükten büyüğe sırala

        // 1. Mevcut Rütbeyi Bul (En yüksek hak edilen)
        for (let i = sortedLevels.length - 1; i >= 0; i--) {
            const lvl = sortedLevels[i];
            if (user.level >= lvl) {
                const roleId = levelRewards[lvl];
                const role = interaction.guild.roles.cache.get(roleId);
                if (role) {
                    rankName = role.name;
                    rankColor = role.hexColor;
                }
                break;
            }
        }

        // Kural: Rütbe yoksa "Yok" yazsın
        if (rankName === "N/A") rankName = "Yok";

        // 2. Bir Sonraki Rütbeyi Bul (Hedef)
        let nextRankName = "Maksimum Seviye! 👑";
        for (const lvl of sortedLevels) {
            if (lvl > user.level) {
                const roleId = levelRewards[lvl];
                const role = interaction.guild.roles.cache.get(roleId);
                if (role) {
                    nextRankName = role.name; // Rol ismini al
                } else {
                    nextRankName = `Level ${lvl} Rütbesi`; // Rol silinmişse idare et
                }
                break; // İlk büyük olanı bul ve çık
            }
        }

        const embed = new EmbedBuilder()
            .setColor(rankColor)
            .setAuthor({ name: `${targetUser.username} Profili`, iconURL: targetUser.displayAvatarURL() })
            .setDescription(`**Rütbe:** ${rankName}\n**Sonraki Rütbe:** ${nextRankName}\n\n${progressBar} **%${percentage}**`)
            .addFields(
                { name: '🏆 Seviye', value: `**${user.level}**`, inline: true },
                { name: '✨ XP', value: `${user.xp} / ${nextLevelXp}`, inline: true },
                { name: '💸 Furyuna Coin', value: `**${user.money}**`, inline: true }
            )
            .setFooter({ text: 'FuryunaBot Level Sistemi' });

        await interaction.reply({ embeds: [embed] });
    }
};
```
