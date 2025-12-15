const { Events } = require('discord.js');
const roleConfig = require('../../commands/kayit/config.js');
const levelConfig = require('../../commands/level/config.js').levelSystem;
const db = require('../../utils/database');

module.exports = {
    name: Events.MessageCreate,
    once: false,
    async execute(message) {
        // 1. Bot mesajlarını ve DM'leri yoksay
        if (message.author.bot || !message.guild) return;

        // 2. Yoksayılan kanallar
        if (levelConfig.ignoredChannels.includes(message.channel.id)) return;

        // 3. Kullanıcı rollerini kontrol et
        const member = message.member;
        if (!member) return;

        // Sadece "Kayıtsız" rolü OLMAYANLAR XP kazanabilir.
        if (member.roles.cache.has(roleConfig.roles.unregistered)) return;

        const userId = message.author.id;
        const now = Date.now();

        // 4. Veritabanından kullanıcıyı çek
        const user = db.getUser(userId);

        // 5. Cooldown Kontrolü
        if (now - user.last_message_turn < levelConfig.cooldown) {
            return;
        }

        // 6. XP Hesapla (Temel + Bonuslar)
        let earnedXp = Math.floor(Math.random() * (levelConfig.xpPerMessage.max - levelConfig.xpPerMessage.min + 1)) + levelConfig.xpPerMessage.min;
        let bonusXp = 0;

        // A) Boost Bonusu (Gün Bazlı)
        if (member.premiumSince) {
            const boostDurationMs = now - member.premiumSinceTimestamp;
            const boostDays = Math.floor(boostDurationMs / (1000 * 60 * 60 * 24)); // Gün sayısı
            const dailyBonus = levelConfig.bonuses.boostDaily || 0;

            // Bonus Hesapla: Gün * GünlükBonus
            const boostBonus = Math.floor(boostDays * dailyBonus);
            if (boostBonus > 0) bonusXp += boostBonus;
        }

        // B) Rol Bonusları
        if (levelConfig.bonuses.roles) {
            for (const [roleId, bonus] of Object.entries(levelConfig.bonuses.roles)) {
                if (member.roles.cache.has(roleId)) {
                    bonusXp += bonus;
                }
            }
        }

        earnedXp += bonusXp;

        // 7. XP ve Aktivite Puanı Ekle
        db.addXp(userId, earnedXp);

        let currentActivity = user.activity_points || 0;
        if (levelConfig.rankSystem && levelConfig.rankSystem.enabled) {
            const activityGain = levelConfig.rankSystem.activityPerMessage;
            db.addActivity(userId, activityGain);
            currentActivity += activityGain;

            // --- RÜTBE KONTROLÜ (YENİ) ---
            const thresholds = levelConfig.rankSystem.thresholds;
            const guildMember = message.member;

            for (const [points, roleId] of Object.entries(thresholds)) {
                if (currentActivity >= parseInt(points)) {
                    if (!guildMember.roles.cache.has(roleId)) {
                        guildMember.roles.add(roleId)
                            .then(() => {
                                // Rütbe Atlama Mesajı
                                message.channel.send(`🎉 Tebrikler <@${userId}>! Aktifliğin sayesinde **${points} Puan** barajını geçtin ve **<@&${roleId}>** rütbesini kazandın! 🚀`);
                            })
                            .catch(console.error);
                    }
                }
            }
        }

        // --- SÜREKLİ COIN KAZANCI ---
        // Her mesajda az da olsa para kazansın (XP'nin %10'u kadar)
        const instantCoin = Math.max(1, Math.floor(earnedXp / 10));
        db.addMoney(userId, instantCoin);

        db.updateCooldown(userId, now);

        // ================= SEVİYE ATLAMA MANTIĞI =================
        const currentLevel = user.level;
        // Zorluk Formülü: 5 * L^2 + 50 * L + 100
        const nextLevelXp = 5 * Math.pow(currentLevel, 2) + (50 * currentLevel) + 100;

        // Not: user objesi eski veriyi tuttuğu için manuel ekliyoruz
        let newTotalXp = user.xp + earnedXp;

        if (newTotalXp >= nextLevelXp) {
            const newLevel = currentLevel + 1;
            db.setLevel(userId, newLevel);

            // Para Ödülü (Bonuslar parayı da etkiler)
            // Formül: (Level * Çarpan) + (BonusXP * 2)
            const baseMoney = newLevel * levelConfig.coinMultiplier;
            const bonusMoney = bonusXp * 2; // Bonus XP'si yüksek olanın parası da artar
            const totalMoney = baseMoney + bonusMoney;

            db.addMoney(userId, totalMoney);

            const channel = message.channel;

            // ================= ROL ÖDÜLLERİ =================
            // Config'de tanımlı seviye ödülü varsa ver
            if (levelConfig.levelRewards[newLevel]) {
                const rewardRoleId = levelConfig.levelRewards[newLevel];
                try {
                    await member.roles.add(rewardRoleId);
                    // Rol verildi mesajı eklenebilir
                } catch (e) {
                    console.error("Rol ödülü verilemedi:", e);
                }
            }

            // ================= 1. SEVİYE ÖZEL: OTO DOĞRULAMA =================
            if (newLevel >= 1 && member.roles.cache.has(roleConfig.roles.newMember)) {
                try {
                    await member.roles.remove([roleConfig.roles.newMember, roleConfig.roles.unregistered]);
                    await member.roles.add(roleConfig.roles.verifiedMember);
                    await channel.send(`🛡️ <@${userId}> **1. Seviye** olduğu için otomatik doğrulandı!`);
                } catch (error) {
                    console.error("Oto doğrulama hatası:", error);
                }
            }

            // Normal Level Up Mesajı
            await channel.send(`🎉 Tebrikler <@${userId}>! **Seviye ${newLevel}** oldun!\n💸 **${totalMoney}** Furyuna Coin kazandın. (Bonus: +${bonusMoney})`);
        }
    }
};
