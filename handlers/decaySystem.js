const db = require('../utils/database');
const { levelSystem } = require('../commands/level/config.js');

module.exports = (client) => {
    // Hedef Saat: Her gece 04:00
    const TARGET_HOUR = 4;

    function scheduleDailyDecay() {
        const now = new Date();
        let nextRun = new Date(now);

        // Saat 04:00'e ayarla
        nextRun.setHours(TARGET_HOUR, 0, 0, 0);

        // Eğer saat zaten 04:00'ü geçtiyse, yarına at
        if (now >= nextRun) {
            nextRun.setDate(now.getDate() + 1);
        }

        const timeUntilNextRun = nextRun - now;

        console.log(`[ZAMANLAYICI] Gece temizliği (Decay) ${nextRun.toLocaleString('tr-TR')} zamanına ayarlandı. (${Math.floor(timeUntilNextRun / 1000 / 60)} dakika sonra)`);

        setTimeout(async () => {
            await runDecayTask();
            // İşlem bitince bir sonraki gün için tekrar kur
            scheduleDailyDecay();
        }, timeUntilNextRun);
    }

    async function runDecayTask() {
        if (!levelSystem.rankSystem.enabled) return;

        console.log('[SİSTEM] Günlük Aktiflik Çürümesi (Decay) ve Rütbe Kontrolü Başladı...');

        try {
            // 1. Herkesin puanını düşür (%5) - Ama sadece 24 saattir mesaj atmayanlarınkini!
            const decayRate = levelSystem.rankSystem.decayRate || 0.05;
            const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);

            db.decayActivity(decayRate, oneDayAgo);

            // 2. Rolleri Kontrol Et (Düşmesi gerekenleri düşür)
            const guiidIds = client.guilds.cache.map(g => g.id);

            for (const guildId of guiidIds) {
                const guild = client.guilds.cache.get(guildId);
                if (!guild) continue;

                const members = await guild.members.fetch();
                const thresholds = levelSystem.rankSystem.thresholds;
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

                    if (eligibleRoleId) {
                        if (!member.roles.cache.has(eligibleRoleId)) {
                            await member.roles.add(eligibleRoleId).catch(e => console.error(`Rol ekleme hatası: ${e}`));
                        }

                        for (const roleId of allRankRoles) {
                            if (roleId !== eligibleRoleId && member.roles.cache.has(roleId)) {
                                await member.roles.remove(roleId).catch(e => console.error(`Rol silme hatası: ${e}`));
                            }
                        }
                    } else {
                        // Puanı yetmeyenlerin rütbelerini al
                        for (const roleId of allRankRoles) {
                            if (member.roles.cache.has(roleId)) {
                                await member.roles.remove(roleId).catch(e => console.error(`Rol silme (yetersiz puan) hatası: ${e}`));
                            }
                        }
                    }
                }
            }
            console.log('[SİSTEM] Günlük Decay ve Rütbe Kontrolü Tamamlandı.');
        } catch (error) {
            console.error('[HATA] Decay işlemi sırasında hata:', error);
        }
    }

    // İlk başlatma
    scheduleDailyDecay();
};
