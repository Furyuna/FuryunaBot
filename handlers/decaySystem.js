const db = require('../utils/database');
const { levelSystem } = require('../commands/level/config.js');

module.exports = (client) => {
    // 24 Saatte bir çalışacak (86400000 ms)
    const DECAY_INTERVAL = 24 * 60 * 60 * 1000;

    setInterval(async () => {
        if (!levelSystem.rankSystem.enabled) return;

        console.log('[SİSTEM] Günlük Aktiflik Çürümesi (Decay) Başladı...');

        // 1. Herkesin puanını düşür (%5) - Ama sadece 24 saattir mesaj atmayanlarınkini!
        const decayRate = levelSystem.rankSystem.decayRate || 0.05;

        // Şu andan 24 saat (veya 1 gün) öncesi
        const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);

        db.decayActivity(decayRate, oneDayAgo);

        // 2. Rolleri Kontrol Et (Düşmesi gerekenleri düşür)
        // Sunucudaki üyeleri tarayalım
        const guiidIds = client.guilds.cache.map(g => g.id);

        for (const guildId of guiidIds) {
            const guild = client.guilds.cache.get(guildId);
            if (!guild) continue;

            const members = await guild.members.fetch();
            const thresholds = levelSystem.rankSystem.thresholds;
            // Puanı en yüksekten düşüğe sırala ki en yüksek hak ettiği rolü bulalım
            const sortedPoints = Object.keys(thresholds).map(Number).sort((a, b) => b - a);

            for (const [memberId, member] of members) {
                if (member.user.bot) continue;

                const user = db.getUser(memberId);
                const points = user.activity_points || 0;

                // Hak ettiği en yüksek rolü bul
                let eligibleRoleId = null;
                for (const threshold of sortedPoints) {
                    if (points >= threshold) {
                        eligibleRoleId = thresholds[threshold];
                        break;
                    }
                }

                // Mevcut rütbe rollerini kontrol et
                const allRankRoles = Object.values(thresholds);

                // Eğer hak ettiği bir rol varsa
                if (eligibleRoleId) {
                    // O role sahip değilse ver (YENİ RÜTBE KAZANDI)
                    if (!member.roles.cache.has(eligibleRoleId)) {
                        await member.roles.add(eligibleRoleId).then(() => {
                            // Bildirim Gönder (Ping yok, DisplayName var)
                            const channel = guild.systemChannel || guild.channels.cache.find(c => c.type === 0 && c.permissionsFor(guild.members.me).has('SendMessages'));
                            if (channel) {
                                const roleName = guild.roles.cache.get(eligibleRoleId)?.name || "Yeni Rütbe";
                                let msg = levelConfig.rankSystem.messages?.rankUp || "🎉 Tebrikler **{user}**! Aktifliğin sayesinde **{role}** rütbesini kazandın! 🚀";

                                // Ana config'den çekmeyi dene (yapı biraz karışık olduğu için fallbackli)
                                if (levelConfig.messages && levelConfig.messages.rankUp) {
                                    msg = levelConfig.messages.rankUp;
                                }

                                msg = msg.replace(/{user}/g, member.displayName)
                                    .replace(/{role}/g, roleName);

                                channel.send(msg);
                            }
                        }).catch(e => console.error(`Rol verme hatası: ${e}`));
                    }

                    // Diğer düşük/yüksek rütbe rollerini al
                    // Veya "yüksek olan düşükleri de kapsar" mantığı değilse:
                    // Genelde discord'da "Gold" olan "Silver" rolünü de taşımaz, yenisi gelince eskisi gider.
                    // O yüzden diğer rank rollerini silelim.
                    for (const roleId of allRankRoles) {
                        if (roleId !== eligibleRoleId && member.roles.cache.has(roleId)) {
                            await member.roles.remove(roleId).catch(e => console.error(`Rol alma hatası: ${e}`));
                            // console.log(`${member.user.tag} eski rütbesi alındı.`);
                        }
                    }
                } else {
                    // Hiçbir rütbeyi hak etmiyor (Puanı < 100)
                    // Üzerindeki tüm rank rollerini al
                    for (const roleId of allRankRoles) {
                        if (member.roles.cache.has(roleId)) {
                            await member.roles.remove(roleId).catch(e => console.error(`Rol alma hatası (Puan yetersiz): ${e}`));
                        }
                    }
                }
            }
        }

        console.log('[SİSTEM] Günlük Decay ve Rütbe Kontrolü Tamamlandı.');

    }, DECAY_INTERVAL);
};
