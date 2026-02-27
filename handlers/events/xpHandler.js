const { Events } = require('discord.js');
const roleConfig = require('../../commands/kayit/config.js');
const levelConfig = require('../../commands/level/config.js').levelSystem;
const db = require('../../utils/database');
const { updateRank } = require('../../utils/rankUtils');

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
                if (message.channel.id === '1287071155219599525' && user.pending_level_up > 0) {
                    const pendingLevel = user.pending_level_up;

                    // 1. SEVİYEYİ GÜNCELLE (Artık kesinleşti)
                    db.setLevel(userId, pendingLevel);

                    // 2. ÖDÜLLERİ HESAPLA VE VER
                    let totalMoney = pendingLevel * levelConfig.coinMultiplier;
                    const isBooster = member.premiumSince || false;
                    let bonusMoney = 0;
                    if (isBooster && levelConfig.bonuses.boostCoinMultiplier) {
                        const multiplier = levelConfig.bonuses.boostCoinMultiplier;
                        bonusMoney = totalMoney * (multiplier - 1);
                        totalMoney *= multiplier;
                    }

                    db.addMoney(userId, totalMoney);

                    // Rol Ödülleri
                    if (levelConfig.levelRewards[pendingLevel]) {
                        const rewardRoleId = levelConfig.levelRewards[pendingLevel];
                        try {
                            await member.roles.add(rewardRoleId);
                        } catch (e) {
                            console.error("Rol ödülü verilemedi (Pending):", e);
                        }
                    }

                    // 3. MESAJI GÖNDER
                    let msg = levelConfig.messages.levelUp
                        .replace(/{user}/g, `<@${userId}>`)
                        .replace(/{level}/g, pendingLevel)
                        .replace(/{money}/g, totalMoney)
                        .replace(/{bonus}/g, bonusMoney);

                    await message.channel.send(msg);

                    // 4. OTO DOĞRULAMA (Eğer Gerekliyse)
                    if (pendingLevel >= 1 && member.roles.cache.has(roleConfig.roles.newMember)) {
                        try {
                            await member.roles.remove([roleConfig.roles.newMember, roleConfig.roles.unregistered]);
                            await member.roles.add(roleConfig.roles.verifiedMember);
                            const verifyMsg = roleConfig.messages.dogrulamaBasarili(userId, message.client.user.id);
                            await message.channel.send(verifyMsg);
                        } catch (error) {
                            console.error("Oto doğrulama hatası (Pending):", error);
                        }
                    }

                    // Flag'i temizle
                    db.setPendingLevelUp(userId, 0);
                    return; // Mesajı attık, işimiz bitti.
                }
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
                    const maxPoints = levelConfig.rankSystem.maxPoints || 1000000;
                    db.addActivityPoints(userId, activityGain, maxPoints);

                    // Rütbe Kontrolü (YENİ)
                    // Puan eklendikten sonra hemen kontrol edilir.
                    updateRank(member, currentActivity + activityGain);
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
                const TARGET_CHANNEL_ID = '1287071155219599525';
                const newLevel = currentLevel + 1;

                if (message.channel.id === TARGET_CHANNEL_ID) {
                    // HEDEF KANALDAYSAK -> HEMEN GÜNCELLE VE ÖDÜL VER
                    db.setLevel(userId, newLevel);

                    // Para Ödülü
                    let totalMoney = newLevel * levelConfig.coinMultiplier;
                    let bonusMoney = 0;
                    if (isBooster && levelConfig.bonuses.boostCoinMultiplier) {
                        const multiplier = levelConfig.bonuses.boostCoinMultiplier;
                        bonusMoney = totalMoney * (multiplier - 1); // Eklenen kısım
                        totalMoney *= multiplier; // Toplam para
                    }
                    db.addMoney(userId, totalMoney);

                    // Rol Ödülleri
                    if (levelConfig.levelRewards[newLevel]) {
                        const rewardRoleId = levelConfig.levelRewards[newLevel];
                        try {
                            await member.roles.add(rewardRoleId);
                            // Rol verildi mesajı eklenebilir
                        } catch (e) {
                            console.error("Rol ödülü verilemedi:", e);
                        }
                    }

                    // Mesaj
                    let msg = levelConfig.messages.levelUp
                        .replace(/{user}/g, `<@${userId}>`)
                        .replace(/{level}/g, newLevel)
                        .replace(/{money}/g, totalMoney)
                        .replace(/{bonus}/g, bonusMoney);

                    await message.channel.send(msg);

                    // Oto Doğrulama
                    if (newLevel >= 1 && member.roles.cache.has(roleConfig.roles.newMember)) {
                        try {
                            await member.roles.remove([roleConfig.roles.newMember, roleConfig.roles.unregistered]);
                            await member.roles.add(roleConfig.roles.verifiedMember);
                            const verifyMsg = roleConfig.messages.dogrulamaBasarili(userId, message.client.user.id);
                            await message.channel.send(verifyMsg);
                        } catch (error) {
                            console.error("Oto doğrulama hatası:", error);
                        }
                    }

                    // KORUMA: Eğer bekleyen bir level varsa onu temizle ve local user nesnesini güncelle
                    // Böylece aşağıdaki "check" bloğu tekrar çalışmaz.
                    db.setPendingLevelUp(userId, 0);
                    user.pending_level_up = 0;

                } else {
                    // YANLIŞ KANALDAYSAK -> SADECE NOT AL (Level/Para/Rol VERME)
                    // Eğer zaten bekleyen bir level varsa (örn: 2 level birden atladıysa), onu güncelle
                    // Ama şu anlık +1 mantığıyla gidiyoruz.
                    // KORUMA: Eğer zaten pending_level_up > newLevel ise güncelleme (Geri gitmesin)
                    if (user.pending_level_up < newLevel) {
                        db.setPendingLevelUp(userId, newLevel);
                        console.log(`[XP] ${member.user.tag} için level artışı ertelendi. (Hedef: ${newLevel}, Kanal: ${message.channel.name})`);
                    }
                }
            }

            // ACIKTAKİ PENDING LEVEL CHECK (Cooldown dışı durumlar için)
            // Eğer cooldown yoksa ve XP kazanılmışsa buraya geliriz.
            // Ama XP kazanılan mesaj AYNI zamanda Hedef Kanal olabilir.
            // O yüzden burada da bir kontrol yapmalıyız.
            if (message.channel.id === '1287071155219599525' && user.pending_level_up > 0) {
                const pendingLevel = user.pending_level_up;

                // 1. SEVİYEYİ GÜNCELLE
                db.setLevel(userId, pendingLevel);

                // 2. ÖDÜLLER
                let totalMoney = pendingLevel * levelConfig.coinMultiplier;
                const isBooster = member.premiumSince || false;
                let bonusMoney = 0;
                if (isBooster && levelConfig.bonuses.boostCoinMultiplier) {
                    const multiplier = levelConfig.bonuses.boostCoinMultiplier;
                    bonusMoney = totalMoney * (multiplier - 1);
                    totalMoney *= multiplier;
                }
                db.addMoney(userId, totalMoney);

                // Rol
                if (levelConfig.levelRewards[pendingLevel]) {
                    const rewardRoleId = levelConfig.levelRewards[pendingLevel];
                    try {
                        await member.roles.add(rewardRoleId);
                    } catch (e) {
                        console.error("Rol ödülü verilemedi (Pending-Late):", e);
                    }
                }

                let msg = levelConfig.messages.levelUp
                    .replace(/{user}/g, `<@${userId}>`)
                    .replace(/{level}/g, pendingLevel)
                    .replace(/{money}/g, totalMoney)
                    .replace(/{bonus}/g, bonusMoney);

                await message.channel.send(msg);

                // Oto Doğrulama
                if (pendingLevel >= 1 && member.roles.cache.has(roleConfig.roles.newMember)) {
                    try {
                        await member.roles.remove([roleConfig.roles.newMember, roleConfig.roles.unregistered]);
                        await member.roles.add(roleConfig.roles.verifiedMember);
                        const verifyMsg = roleConfig.messages.dogrulamaBasarili(userId, message.client.user.id);
                        await message.channel.send(verifyMsg);
                    } catch (error) {
                        console.error("Oto doğrulama hatası (Pending-Late):", error);
                    }
                }

                db.setPendingLevelUp(userId, 0);
            }

        } catch (error) {
            console.error('[XP HANDLER ERROR]', error);
            // Bot çökmez, sadece log'a düşer
        }
    }
};
