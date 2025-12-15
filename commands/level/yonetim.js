const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('../../utils/database.js');
const levelConfig = require('./config.js').levelSystem;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('level-yonet')
        .setDescription('Kullanıcıların seviye ve XP verilerini yönetir (Sadece Yetkililer).')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(sub =>
            sub.setName('xp-ver')
                .setDescription('Bir kullanıcıya XP ve Para verir.')
                .addUserOption(opt => opt.setName('kullanici').setDescription('Kullanıcı').setRequired(true))
                .addIntegerOption(opt => opt.setName('miktar').setDescription('XP Miktarı').setRequired(true))
                .addIntegerOption(opt => opt.setName('para').setDescription('Para Miktarı (Opsiyonel)').setRequired(false))
        )
        .addSubcommand(sub =>
            sub.setName('level-ayarla')
                .setDescription('Bir kullanıcının seviyesini doğrudan ayarlar.')
                .addUserOption(opt => opt.setName('kullanici').setDescription('Kullanıcı').setRequired(true))
                .addIntegerOption(opt => opt.setName('seviye').setDescription('Yeni Seviye').setRequired(true))
        )
        .addSubcommand(sub =>
            sub.setName('sifirla')
                .setDescription('Bir kullanıcının tüm verilerini (XP, Level, Para) sıfırlar.')
                .addUserOption(opt => opt.setName('kullanici').setDescription('Kullanıcı').setRequired(true))
        )
        .addSubcommand(sub =>
            sub.setName('senkronize-et')
                .setDescription('Tüm sunucu üyelerinin rollerini puanlarına göre düzeltir.')
        ),

    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return interaction.reply({ content: '⛔ Bu komutu kullanmak için **Yönetici** yetkisine sahip olmalısın.', ephemeral: true });
        }

        const subcommand = interaction.options.getSubcommand();
        const targetUser = interaction.options.getUser('kullanici');
        const userId = targetUser ? targetUser.id : null;

        if (subcommand === 'senkronize-et') {
            await interaction.deferReply();
            const guild = interaction.guild;
            const members = await guild.members.fetch();
            let updatedCount = 0;

            if (!levelConfig.rankSystem || !levelConfig.rankSystem.enabled) {
                return interaction.editReply('❌ Rütbe sistemi aktif değil.');
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
                if (eligibleRoleId) {
                    if (!member.roles.cache.has(eligibleRoleId)) {
                        await member.roles.add(eligibleRoleId).catch(() => { });
                        changed = true;
                    }
                }

                for (const roleId of allRankRoles) {
                    if (roleId !== eligibleRoleId && member.roles.cache.has(roleId)) {
                        await member.roles.remove(roleId).catch(() => { });
                        changed = true;
                    }
                }

                if (changed) updatedCount++;
            }

            return interaction.editReply(`✅ Senkronizasyon Tamamlandı!\n**${members.size}** üye tarandı, **${updatedCount}** kişinin rolleri düzeltildi.`);
        }

        // Diğer komutlar kullanıcı gerektirir
        if (!userId) return; // (Teorik olarak setRequired true ama güvenlik olsun)

        if (subcommand === 'xp-ver') {
            const xpAmount = interaction.options.getInteger('miktar');
            const moneyAmount = interaction.options.getInteger('para') || 0;

            db.addXp(userId, xpAmount);
            if (moneyAmount > 0) db.addMoney(userId, moneyAmount);

            await interaction.reply({
                content: `✅ <@${userId}> kullanıcısına **${xpAmount} XP** ve **${moneyAmount} Coin** verildi!\n(Not: Seviye atlama işlemi bir sonraki mesajında gerçekleşir).`
            });

        } else if (subcommand === 'level-ayarla') {
            const newLevel = interaction.options.getInteger('seviye');
            db.setLevel(userId, newLevel);
            await interaction.reply({
                content: `🛠️ <@${userId}> kullanıcısının seviyesi **${newLevel}** olarak ayarlandı.`
            });

        } else if (subcommand === 'sifirla') {
            try {
                // Basit SQL sorgusu ile sıfırla
                const sqliteDb = require('better-sqlite3')('database.sqlite');
                sqliteDb.prepare('UPDATE users SET xp = 0, level = 0, money = 0, activity_points = 0 WHERE user_id = ?').run(userId);
                sqliteDb.close();

                await interaction.reply({
                    content: `♻️ <@${userId}> kullanıcısının tüm verileri sıfırlandı!`
                });
            } catch (e) {
                console.error(e);
                await interaction.reply({ content: '❌ Sıfırlama sırasında bir hata oluştu.' });
            }
        }
    }
};
