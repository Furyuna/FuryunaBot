const levelConfig = require('../commands/level/config.js').levelSystem;

async function updateRank(member, currentPoints) {
    if (!levelConfig.rankSystem.enabled) return;

    // 1. Config'deki tüm rütbeleri ve puanlarını al
    const thresholds = levelConfig.rankSystem.thresholds;
    const sortedPoints = Object.keys(thresholds).map(Number).sort((a, b) => b - a); // Büyükten küçüğe sırala

    // 2. Kullanıcının puanına uygun EN YÜKSEK rütbeyi bul
    let targetRoleId = null;
    for (const point of sortedPoints) {
        if (currentPoints >= point) {
            targetRoleId = thresholds[point];
            break; // En yükseği bulduk, dur.
        }
    }

    // 3. Eğer hiçbir rütbeye yetmiyorsa (targetRoleId null ise), işlem yapma (belki eski rütbeleri silmek gerekebilir ama şimdilik kalsın)
    // Şimdilik sadece kazanılan rütbe varsa işlem yapalım.

    if (targetRoleId) {
        // Mevcut rütbesi zaten bu mu?
        if (member.roles.cache.has(targetRoleId)) {
            // Zaten bu rütbede, diğer rütbeleri kontrol edip varsa silelim (Garanti olsun)
            const otherRankRoles = Object.values(thresholds).filter(id => id !== targetRoleId);
            const hasOtherRoles = otherRankRoles.some(id => member.roles.cache.has(id));

            if (hasOtherRoles) {
                await member.roles.remove(otherRankRoles).catch(console.error);
                console.log(`[RÜTBE] ${member.user.tag} kullanıcısının fazlalık rütbeleri temizlendi.`);
            }
            return;
        }

        // 4. Yeni rütbeyi ver, ESKİLERİ SİL
        const allRankRoles = Object.values(thresholds);

        try {
            // Önce eskileri sil (Hepsini silip yeniyi eklemek daha temiz)
            // Ama API limiti yememek için sadece sahip olduklarını silsek daha iyi olur
            const rolesToRemove = allRankRoles.filter(id => member.roles.cache.has(id));
            if (rolesToRemove.length > 0) {
                await member.roles.remove(rolesToRemove);
            }

            // Yeni rolü ekle
            await member.roles.add(targetRoleId);

            // Log veya Mesaj (Opsiyonel)
            // console.log(`[RÜTBE] ${member.user.tag} yeni rütbeye atladı: ${targetRoleId}`);

            // Kanal bildirimi (Config'e göre)
            if (levelConfig.rankSystem.announceRankUp) {
                // Kanal bulma mantığı eklenebilir
            }

        } catch (error) {
            console.error(`[RÜTBE HATA] ${member.id} rütbe güncellenemedi:`, error);
        }
    }
}

module.exports = { updateRank };
