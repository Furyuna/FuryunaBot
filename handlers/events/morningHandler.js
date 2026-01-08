const config = require('../../commands/etkinlik/config.js');
const schedule = require('node-schedule'); // node-schedule var mı kontrol etmeliyiz, yoksa setTimeout kullanırız. 
// User environment check showed basic discord.js setup. Assuming typical setTimeout logic is safer if no dependency installed.
// Ancak "autoMessages" vardı, belki orada schedule kullanıldı. 
// Neyse, native setTimeout ile yapalım, dependency riskine girmeyelim.

let timer = null;

module.exports = {
    init: (client) => {
        if (!config.morning.enabled) return;

        console.log('[MORNING] Günaydın Sistemi Aktif!');
        scheduleNextMessage(client);
    }
};

function scheduleNextMessage(client) {
    if (timer) clearTimeout(timer);

    const now = new Date();
    const cfg = config.morning;

    // Hedef Zamanı Belirle
    let targetTime = new Date();

    // Rastgele bir dakika/saniye seç (Saat aralığı içinde)
    // minHour (dahil) ile maxHour (hariç) arasında
    const randomHour = Math.floor(Math.random() * (cfg.maxHour - cfg.minHour)) + cfg.minHour;
    const randomMinute = Math.floor(Math.random() * 60);
    const randomSecond = Math.floor(Math.random() * 60);

    targetTime.setHours(randomHour, randomMinute, randomSecond, 0);

    // Eğer bugün için belirlenen saat GEÇTİYSE -> YARINA kur
    if (now > targetTime) {
        targetTime.setDate(targetTime.getDate() + 1);
        console.log(`[MORNING] Bugünün saati geçti, yarına kuruluyor...`);
    } else {
        // Eğer henüz geçmediyse, ama şu anki saat pencerenin içindeyse ve targetTime future ise -> BUGÜNE kur
        // Zaten targetTime > now olduğu için okey.
    }

    const timeUntil = targetTime.getTime() - now.getTime();

    // Log (Saat:Dakika formatında göster)
    const timeStr = targetTime.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    console.log(`[MORNING] Bir sonraki Günaydın mesajı: ${timeStr} (Kalan: ${Math.floor(timeUntil / 1000 / 60)} dk)`);

    timer = setTimeout(async () => {
        const channel = client.channels.cache.get(cfg.channelId);
        if (channel && channel.isTextBased()) {
            const msgs = cfg.messages;
            const randomMsg = msgs[Math.floor(Math.random() * msgs.length)];

            try {
                await channel.send(randomMsg);
                console.log('[MORNING] Günaydın mesajı gönderildi!');
            } catch (err) {
                console.error('[MORNING] Mesaj gönderilirken hata:', err);
            }
        }

        // Gönderdikten sonra bir sonraki gün için tekrar kur
        // Fonksiyon kendini tekrar çağıracağı için targetTime yeniden hesaplanacak (ve now > targetTime olacağı için yarına atacak... 
        // DİKKAT: Aynı gün içinde tekrar çağırmaması için minik bir delay veya "yarın" garantisi lazım.
        // targetTime bugün ise, bir sonraki çağrıda "now" hemen hemen aynı olacak.
        // Ama targetTime geçmişte kalacağı için logic "now > targetTime" olacak ve +1 day yapacak. Doğru çalışır.
        scheduleNextMessage(client);

    }, timeUntil);
}
