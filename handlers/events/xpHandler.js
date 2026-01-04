const { Events } = require('discord.js');
const roleConfig = require('../../commands/kayit/config.js');
const levelConfig = require('../../commands/level/config.js').levelSystem;
const db = require('../../utils/database');

module.exports = {
    name: Events.MessageCreate,
    once: false,
    async execute(message) {
        try {
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

            // 6. XP Hesapla (Bonus YOK - Herkes Eşit)
            let earnedXp = Math.floor(Math.random() * (levelConfig.xpPerMessage.max - levelConfig.xpPerMessage.min + 1)) + levelConfig.xpPerMessage.min;

            // Boost Kontrolü (Para için kullanılacak)
            const isBooster = member.premiumSince || false;

            // 7. XP ve Aktivite Puanı Ekle
            db.addXp(userId, earnedXp);

            let currentActivity = user.activity_points || 0;
            if (levelConfig.rankSystem && levelConfig.rankSystem.enabled) {
                // Sadece "Doğrulanmış Üye", "Yeni Üye" veya "Yetkili" olanlar kazanabilir.
                const hasVerified = member.roles.cache.has(roleConfig.roles.verifiedMember);
                const hasNew = member.roles.cache.has(roleConfig.roles.newMember);
                const isStaff = roleConfig.staffRoles.some(roleId => member.roles.cache.has(roleId));

                if (hasVerified || hasNew || isStaff) {
                    const activityGain = levelConfig.rankSystem.activityPerMessage;
                    db.addActivityPoints(userId, activityGain);
                }
            }

            // --- SÜREKLİ COIN KAZANCI (İPTAL EDİLDİ) ---
            // Sadece Level atlayınca para verilecek.
            // db.addMoney(userId, instantCoin); (Kaldırıldı)

            db.updateCooldown(userId, now);

            // ================= SEVİYE ATLAMA MANTIĞI =================
            const currentLevel = user.level;
            // ZORLUK YOK: Her seviye için sabit XP gerekir (Örn: Lvl 1->2000, Lvl 2->4000)
            // Eğer config'de yoksa varsayılan 300 al
            const xpPerLevel = levelConfig.xpNeededPerLevel || 300;
            const nextLevelXp = (currentLevel + 1) * xpPerLevel;

            // Not: user objesi eski veriyi tuttuğu için manuel ekliyoruz
            let newTotalXp = user.xp + earnedXp;

            if (newTotalXp >= nextLevelXp) {
                const newLevel = currentLevel + 1;
                db.setLevel(userId, newLevel);

                // Para Ödülü (Bonuslar parayı da etkiler)
                // Formül: (Level * Çarpan)
                let totalMoney = newLevel * levelConfig.coinMultiplier;

                // BOOST VARSA SEVİYE ÖDÜLÜ DE ARTAR
                let bonusMoney = 0;
                if (isBooster && levelConfig.bonuses.boostCoinMultiplier) {
                    const multiplier = levelConfig.bonuses.boostCoinMultiplier;
                    bonusMoney = totalMoney * (multiplier - 1); // Eklenen kısım
                    totalMoney *= multiplier; // Toplam para
                }

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

                // Normal Level Up Mesajı
                // Mesaj şablonunu al ve değişkenleri yerleştir
                let msg = levelConfig.messages.levelUp
                    .replace(/{user}/g, `<@${userId}>`)
                    .replace(/{level}/g, newLevel)
                    .replace(/{money}/g, totalMoney)
                    .replace(/{bonus}/g, bonusMoney);

                await channel.send(msg);

                // ================= 1. SEVİYE ÖZEL: OTO DOĞRULAMA =================
                // Level mesajından SONRA gelmesi istendi.
                if (newLevel >= 1 && member.roles.cache.has(roleConfig.roles.newMember)) {
                    try {
                        await member.roles.remove([roleConfig.roles.newMember, roleConfig.roles.unregistered]);
                        await member.roles.add(roleConfig.roles.verifiedMember);
                        // Resmi doğrulama mesajını kullan (Yetkili = Bot)
                        const verifyMsg = roleConfig.messages.dogrulamaBasarili(userId, message.client.user.id);
                        await channel.send(verifyMsg);
                    } catch (error) {
                        console.error("Oto doğrulama hatası:", error);
                    }
                }
            }
        } catch (error) {
            console.error('[XP HANDLER ERROR]', error);
            // Bot çökmez, sadece log'a düşer
        }
    }
};
