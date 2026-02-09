const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('../../utils/database.js');
const levelConfig = require('./config.js').levelSystem;

module.exports = {
    data: new SlashCommandBuilder()
        .setName(levelConfig.commands.management || 'level-yonet')
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
        )
        .addSubcommand(sub =>
            sub.setName('puan-ver')
                .setDescription('Bir kullanıcıya Rütbe/Aktiflik Puanı verir.')
                .addUserOption(opt => opt.setName('kullanici').setDescription('Kullanıcı').setRequired(true))
                .addIntegerOption(opt => opt.setName('miktar').setDescription('Puan Miktarı').setRequired(true))
        )
        .addSubcommand(sub =>
            sub.setName('puan-sil')
                .setDescription('Bir kullanıcıdan Rütbe/Aktiflik Puanı siler.')
                .addUserOption(opt => opt.setName('kullanici').setDescription('Kullanıcı').setRequired(true))
                .addIntegerOption(opt => opt.setName('miktar').setDescription('Silinecek Miktar').setRequired(true))
        ),

    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return interaction.reply({ content: '⛔ Bu komutu kullanmak için **Yönetici** yetkisine sahip olmalısın.', ephemeral: false });
        }

        const subcommand = interaction.options.getSubcommand();
        const targetUser = interaction.options.getUser('kullanici');
        const userId = targetUser ? targetUser.id : null;

        if (subcommand === 'senkronize-et') {
            await interaction.deferReply();
            const guild = interaction.guild;
            const members = await guild.members.fetch();
            let updatedCount = 0;
            let deletedGhostCount = 0;

            // 1. ADIM: HAYALET TEMİZLİĞİ (Banlı/Çıkmışları Sil)
            const allDbUserIds = db.getAllUserIds();
            for (const userId of allDbUserIds) {
                if (!members.has(userId)) {
                    db.deleteUser(userId);
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

            return interaction.editReply(`✅ **SENKRONİZASYON TAMAMLANDI!** 🦅\n\n🗑️ **Temizlik:** ${deletedGhostCount} adet 'hayalet' (sunucuda olmayan) kullanıcı silindi.\n🛠️ **Roller:** ${updatedCount} kişinin rütbesi düzeltildi.`);
        }

        // Diğer komutlar kullanıcı gerektirir
        if (!userId) return; // (Teorik olarak setRequired true ama güvenlik olsun)

        if (subcommand === 'xp-ver') {
            const xpAmount = interaction.options.getInteger('miktar');
            const moneyAmount = interaction.options.getInteger('para') || 0;

            db.addXp(userId, xpAmount);
            if (moneyAmount > 0) db.addMoney(userId, moneyAmount);

            await interaction.reply({
                content: `✅ <@${userId}> kullanıcısına **${xpAmount} XP** ve **${moneyAmount} FCoin** verildi!\n(Not: Seviye atlama işlemi bir sonraki mesajında gerçekleşir).`
            });

        } else if (subcommand === 'puan-ver') {
            const amount = interaction.options.getInteger('miktar');
            if (amount <= 0) return interaction.reply({ content: '❌ Pozitif bir miktar girin.', ephemeral: false });

            db.addActivityPoints(userId, amount);

            // --- OTOMATİK SENKRONİZASYON ---
            if (levelConfig.rankSystem && levelConfig.rankSystem.enabled) {
                const member = await interaction.guild.members.fetch(userId).catch(() => null);
                if (member) {
                    const user = db.getUser(userId); // Yeni puanı al
                    const points = user.activity_points || 0;

                    const thresholds = levelConfig.rankSystem.thresholds;
                    const sortedPoints = Object.keys(thresholds).map(Number).sort((a, b) => b - a);

                    let eligibleRoleId = null;
                    for (const threshold of sortedPoints) {
                        if (points >= threshold) {
                            eligibleRoleId = thresholds[threshold];
                            break;
                        }
                    }

                    if (eligibleRoleId && !member.roles.cache.has(eligibleRoleId)) {
                        await member.roles.add(eligibleRoleId).catch(() => { });
                    }

                    // Diğer rütbeleri temizle
                    for (const roleId of Object.values(thresholds)) {
                        if (roleId !== eligibleRoleId && member.roles.cache.has(roleId)) {
                            await member.roles.remove(roleId).catch(() => { });
                        }
                    }
                }
            }

            await interaction.reply({
                content: `📈 <@${userId}> kullanıcısına **${amount} Aktiflik Puanı** verildi ve rolleri güncellendi!`
            });

        } else if (subcommand === 'puan-sil') {
            const amount = interaction.options.getInteger('miktar');
            if (amount <= 0) return interaction.reply({ content: '❌ Pozitif bir miktar girin.', ephemeral: false });

            db.removeActivityPoints(userId, amount);

            // --- OTOMATİK SENKRONİZASYON ---
            if (levelConfig.rankSystem && levelConfig.rankSystem.enabled) {
                const member = await interaction.guild.members.fetch(userId).catch(() => null);
                if (member) {
                    const user = db.getUser(userId); // Yeni puanı al
                    const points = user.activity_points || 0;

                    const thresholds = levelConfig.rankSystem.thresholds;
                    const sortedPoints = Object.keys(thresholds).map(Number).sort((a, b) => b - a);

                    let eligibleRoleId = null;
                    for (const threshold of sortedPoints) {
                        if (points >= threshold) {
                            eligibleRoleId = thresholds[threshold];
                            break;
                        }
                    }

                    if (eligibleRoleId && !member.roles.cache.has(eligibleRoleId)) {
                        await member.roles.add(eligibleRoleId).catch(() => { });
                    }

                    // Diğer rütbeleri temizle
                    for (const roleId of Object.values(thresholds)) {
                        if (roleId !== eligibleRoleId && member.roles.cache.has(roleId)) {
                            await member.roles.remove(roleId).catch(() => { });
                        }
                    }
                }
            }

            await interaction.reply({
                content: `📉 <@${userId}> kullanıcısından **${amount} Aktiflik Puanı** silindi ve rolleri güncellendi.`
            });

        } else if (subcommand === 'level-ayarla') {
            const newLevel = interaction.options.getInteger('seviye');
            db.setLevel(userId, newLevel);
            await interaction.reply({
                content: `🛠️ <@${userId}> kullanıcısının seviyesi **${newLevel}** olarak ayarlandı.`
            });

        } else if (subcommand === 'sifirla') {
            try {
                // Basit SQL sorgusu ile sıfırla (Better-sqlite3 db.prepare kullanalım)
                // db modülü üzerinden erişim olmadığı için require ile açalım
                const sqlite = require('better-sqlite3');
                const path = require('path');
                const rawDb = new sqlite(path.join(__dirname, '../../database.sqlite'));

                rawDb.prepare('UPDATE users SET xp = 0, level = 0, money = 0, activity_points = 0 WHERE user_id = ?').run(userId);
                rawDb.close();

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
