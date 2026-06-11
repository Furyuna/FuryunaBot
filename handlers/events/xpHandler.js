const { Events } = require('discord.js');
const roleConfig = require('../../commands/kayit/config.js');
const levelConfig = require('../../commands/level/config.js').levelSystem;
const db = require('../../utils/database');
const { updateRank } = require('../../utils/rankUtils');

// Seviye atlama tebriklerinin atılacağı kanal (config'den)
const LEVEL_UP_CHANNEL_ID = levelConfig.levelUpChannelId;

// --- SEVİYE ÖDÜLÜNÜ VER ---
// Para, rol ödülü, tebrik mesajı ve (gerekiyorsa) oto-doğrulama tek yerde.
// Önceden 3 ayrı yere kopyalanmıştı (cooldown-pending, anlık level, geç-pending);
// davranış birebir korunarak tek fonksiyona toplandı.
async function grantLevelReward(message, member, level) {
    const userId = member.id;

    // 1. Seviyeyi kesinleştir
    db.setLevel(userId, level);

    // 2. Para ödülü (+ Boost bonusu)
    let totalMoney = level * levelConfig.coinMultiplier;
    let bonusMoney = 0;
    const isBooster = member.premiumSince || false;
    if (isBooster && levelConfig.bonuses.boostCoinMultiplier) {
        const multiplier = levelConfig.bonuses.boostCoinMultiplier;
        bonusMoney = totalMoney * (multiplier - 1); // Eklenen kısım
        totalMoney *= multiplier;                   // Toplam para
    }
    db.addMoney(userId, totalMoney);

    // 3. Rol ödülü (varsa)
    if (levelConfig.levelRewards[level]) {
        const rewardRoleId = levelConfig.levelRewards[level];
        try {
            await member.roles.add(rewardRoleId);
        } catch (e) {
            console.error("Rol ödülü verilemedi:", e);
        }
    }

    // 4. Tebrik mesajı
    const msg = levelConfig.messages.levelUp
        .replace(/{user}/g, `<@${userId}>`)
        .replace(/{level}/g, level)
        .replace(/{money}/g, totalMoney)
        .replace(/{bonus}/g, bonusMoney);
    await message.channel.send(msg);

    // 5. Oto-Doğrulama (Yeni Üye ise)
    if (level >= 1 && member.roles.cache.has(roleConfig.roles.newMember)) {
        try {
            await member.roles.remove([roleConfig.roles.newMember, roleConfig.roles.unregistered]);
            await member.roles.add(roleConfig.roles.verifiedMember);
            const verifyMsg = roleConfig.messages.dogrulamaBasarili(userId, message.client.user.id);
            await message.channel.send(verifyMsg);
        } catch (error) {
            console.error("Oto doğrulama hatası:", error);
        }
    }

    // 6. Bekleyen bayrağı temizle
    db.setPendingLevelUp(userId, 0);
}

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
                // COOLDOWN İÇİNDE BİLE OLSA:
                // Eğer bu mesaj HEDEF KANALDA ise ve BEKLEYEN TEBRİK varsa -> İŞLEMİ TAMAMLA
                if (message.channel.id === LEVEL_UP_CHANNEL_ID && user.pending_level_up > 0) {
                    await grantLevelReward(message, member, user.pending_level_up);
                    return; // Mesajı attık, işimiz bitti.
                }
                return;
            }

            // 6. XP Hesapla (Bonus YOK - Herkes Eşit)
            let earnedXp = Math.floor(Math.random() * (levelConfig.xpPerMessage.max - levelConfig.xpPerMessage.min + 1)) + levelConfig.xpPerMessage.min;

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
                    const maxPoints = levelConfig.rankSystem.maxPoints || 1000000;
                    db.addActivityPoints(userId, activityGain, maxPoints);

                    // Rütbe Kontrolü: Puan eklendikten sonra hemen kontrol edilir.
                    updateRank(member, currentActivity + activityGain);
                }
            }

            // --- SÜREKLİ COIN KAZANCI (İPTAL EDİLDİ) ---
            // Sadece Level atlayınca para verilecek.

            db.updateCooldown(userId, now);

            // ================= SEVİYE ATLAMA MANTIĞI =================
            const currentLevel = user.level;
            // ZORLUK YOK: Her seviye için sabit XP gerekir (Örn: Lvl 1->1000, Lvl 2->2000)
            const xpPerLevel = levelConfig.xpNeededPerLevel || 300;
            const nextLevelXp = (currentLevel + 1) * xpPerLevel;

            // Not: user objesi eski veriyi tuttuğu için manuel ekliyoruz
            let newTotalXp = user.xp + earnedXp;

            if (newTotalXp >= nextLevelXp) {
                const newLevel = currentLevel + 1;

                if (message.channel.id === LEVEL_UP_CHANNEL_ID) {
                    // HEDEF KANALDAYSAK -> HEMEN GÜNCELLE VE ÖDÜL VER
                    await grantLevelReward(message, member, newLevel);

                    // KORUMA: Local user nesnesini güncelle ki aşağıdaki geç-pending bloğu
                    // tekrar çalışmasın.
                    user.pending_level_up = 0;
                } else {
                    // YANLIŞ KANALDAYSAK -> SADECE NOT AL (Level/Para/Rol VERME)
                    // KORUMA: Eğer zaten pending_level_up >= newLevel ise güncelleme (Geri gitmesin)
                    if (user.pending_level_up < newLevel) {
                        db.setPendingLevelUp(userId, newLevel);
                        console.log(`[XP] ${member.user.tag} için level artışı ertelendi. (Hedef: ${newLevel}, Kanal: ${message.channel.name})`);
                    }
                }
            }

            // AÇIKTAKİ PENDING LEVEL CHECK (Cooldown dışı durumlar için)
            // Hedef kanaldaysak ve hâlâ bekleyen bir level varsa onu da kesinleştir.
            if (message.channel.id === LEVEL_UP_CHANNEL_ID && user.pending_level_up > 0) {
                await grantLevelReward(message, member, user.pending_level_up);
            }

        } catch (error) {
            console.error('[XP HANDLER ERROR]', error);
            // Bot çökmez, sadece log'a düşer
        }
    }
};
