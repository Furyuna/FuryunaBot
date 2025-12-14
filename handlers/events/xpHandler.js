const { Events } = require('discord.js');
const localConfig = require('../commands/kayit/config.js');
const db = require('../utils/database');

module.exports = {
    name: Events.MessageCreate,
    once: false,
    async execute(message) {
        // 1. Bot mesajlarını ve DM'leri yoksay
        if (message.author.bot || !message.guild) return;

        // 2. Yoksayılan kanallar
        if (localConfig.levelSystem.ignoredChannels.includes(message.channel.id)) return;

        // 3. Kullanıcı rollerini kontrol et
        // Sadece "Kayıtsız" rolü OLMAYANLAR XP kazanabilir.
        if (message.member.roles.cache.has(localConfig.roles.unregistered)) return;

        const userId = message.author.id;
        const now = Date.now();

        // 4. Veritabanından kullanıcıyı çek
        const user = db.getUser(userId);

        // 5. Cooldown Kontrolü (1 dakika)
        if (now - user.last_message_turn < localConfig.levelSystem.cooldown) {
            return;
        }

        // 6. Rastgele XP Hesapla
        const minXp = localConfig.levelSystem.xpPerMessage.min;
        const maxXp = localConfig.levelSystem.xpPerMessage.max;
        const earnedXp = Math.floor(Math.random() * (maxXp - minXp + 1)) + minXp;

        // 7. XP'yi Ekle ve Zamanı Güncelle
        db.addXp(userId, earnedXp);
        db.updateCooldown(userId, now);

        // ================= SEVİYE ATLAMA MANTIĞI =================
        // Formül: 5 * (Level ^ 2) + (50 * Level) + 100
        // Örn: Lvl 0 -> 1 için 100 XP gerekir.
        const currentLevel = user.level;
        const nextLevelXp = 5 * Math.pow(currentLevel, 2) + (50 * currentLevel) + 100;

        let newTotalXp = user.xp + earnedXp; // user.xp henüz güncellenmediği için +earnedXp ekliyoruz (db.addXp async değil better-sqlite3 sync çalışır ama db.getUser eski veriyi tutuyor olabilir, db.addXp update yaptı)
        // Düzeltme: better-sqlite3 senkroni olduğu için db.addXp sonrası tekrar çekmeye gerek yok ama user objesi eski.
        // Basitlik için user.xp'ye manuel ekliyoruz:
        newTotalXp = user.xp + earnedXp;

        if (newTotalXp >= nextLevelXp) {
            const newLevel = currentLevel + 1;
            db.setLevel(userId, newLevel);

            // Para Ödülü
            const rewardMoney = newLevel * localConfig.levelSystem.coinMultiplier;
            db.addMoney(userId, rewardMoney);

            // Mesaj Gönder
            const channel = message.channel;
            await channel.send(`🎉 Tebrikler <@${userId}>! **Seviye ${newLevel}** oldun! 💸 **${rewardMoney} Furyuna Coin** kazandın.`);

            // ================= 1. SEVİYE ÖZEL: OTO DOĞRULAMA =================
            // Eğer Yeni Üye ise ve Level 1 olduysa -> Doğrula
            if (newLevel >= 1 && message.member.roles.cache.has(localConfig.roles.newMember)) {
                try {
                    await message.member.roles.remove([localConfig.roles.newMember, localConfig.roles.unregistered]);
                    await message.member.roles.add(localConfig.roles.verifiedMember);
                    await channel.send(`🛡️ **OTOMATİK DOĞRULAMA:** <@${userId}> 1. seviyeye ulaştığı için **Doğrulanmış Üye** oldu!`);
                } catch (error) {
                    console.error("Oto doğrulama hatası:", error);
                }
            }
        }
    }
};
