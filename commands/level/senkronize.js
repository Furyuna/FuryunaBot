const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('../../utils/database.js');
const levelConfig = require('./config.js').levelSystem;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('senkronize')
        .setDescription('Tüm sunucu üyelerinin rütbe rollerini puanlarına göre düzeltir (Sadece Yetkililer).')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return interaction.reply({ content: '⛔ Bu komutu kullanmak için **Yönetici** yetkisine sahip olmalısın.', ephemeral: false });
        }

        await interaction.deferReply();
        const guild = interaction.guild;
        const members = await guild.members.fetch();
        let updatedCount = 0;
        let deletedGhostCount = 0;

        // 1. ADIM: HAYALET TEMİZLİĞİ (Banlı/Çıkmışları Sil)
        const allDbUserIds = db.getAllUserIds();
        for (const dbUserId of allDbUserIds) {
            if (!members.has(dbUserId)) {
                db.deleteUser(dbUserId);
                deletedGhostCount++;
            }
        }

        if (!levelConfig.rankSystem || !levelConfig.rankSystem.enabled) {
            return interaction.editReply(`✅ Hayalet Temizliği: **${deletedGhostCount}** kişi DB'den silindi.\n❌ Rütbe sistemi aktif olmadığı için rol senkronizasyonu yapılmadı.`);
        }

        const thresholds = levelConfig.rankSystem.thresholds;
        const sortedPoints = Object.keys(thresholds).map(Number).sort((a, b) => b - a);
        const allRankRoles = Object.values(thresholds);

        for (const [memberId, member] of members) {
            if (member.user.bot) continue;

            const user = db.getUser(memberId);
            const points = user.activity_points || 0;

            let eligibleRoleId = null;
            for (const threshold of sortedPoints) {
                if (points >= threshold) {
                    eligibleRoleId = thresholds[threshold];
                    break;
                }
            }

            let changed = false;
            if (eligibleRoleId && !member.roles.cache.has(eligibleRoleId)) {
                await member.roles.add(eligibleRoleId).catch(() => { });
                changed = true;
            }

            for (const roleId of allRankRoles) {
                if (roleId !== eligibleRoleId && member.roles.cache.has(roleId)) {
                    await member.roles.remove(roleId).catch(() => { });
                    changed = true;
                }
            }

            if (changed) updatedCount++;
        }

        return interaction.editReply(`✅ **SENKRONİZASYON TAMAMLANDI!** 🦅\n\n🗑️ **Temizlik:** ${deletedGhostCount} adet 'hayalet' (sunucuda olmayan) kullanıcı silindi.\n🛠️ **Roller:** ${updatedCount} kişinin rütbesi düzeltildi.`);
    }
};
