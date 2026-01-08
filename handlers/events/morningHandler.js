const config = require('../../commands/etkinlik/config.js');

// Native setTimeout kullanıyoruz, harici dependency gerek yok.
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

    // Ayarlardaki saati parse et (HH:MM)
    const [startH, startM] = cfg.startTime.split(':').map(Number);
    const [endH, endM] = cfg.endTime.split(':').map(Number);

    // Bugün için Başlangıç ve Bitiş zamanlarını oluştur
    const startWindow = new Date();
    startWindow.setHours(startH, startM, 0, 0);

    const endWindow = new Date();
    endWindow.setHours(endH, endM, 0, 0);

    // Rastgele bir zaman belirle (Start ile End arasındaki fark kadar saniye ekle)
    const diffMs = endWindow.getTime() - startWindow.getTime();
    const randomOffset = Math.floor(Math.random() * diffMs);

    let targetTime = new Date(startWindow.getTime() + randomOffset);

    // Eğer bugün için belirlenen bu rastgele zaman GEÇMİŞSE -> YARINA kur
    if (now > targetTime) {
        // Yarın aynı saatlerde olacak şekilde ayarla
        targetTime.setDate(targetTime.getDate() + 1);
        console.log(`[MORNING] Bugünün şanslı saati (${targetTime.toLocaleTimeString()}) geçti, yarına kuruluyor...`);
    } else {
        // Hedef gelecek bir zaman, sorun yok.
    }

    const timeUntil = targetTime.getTime() - now.getTime();

    // Log
    const timeStr = targetTime.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
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

        // Gönderdikten sonra döngüyü devam ettir
        scheduleNextMessage(client);

    }, timeUntil);
}
