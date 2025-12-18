const config = require('../commands/etkinlik/config.js');

module.exports = (client) => {
    // Dakikada bir kontrol eder (60000 ms)
    setInterval(() => {
        const now = new Date();

        // Türkiye Saatine Ayarla (Eğer sunucu UTC ise +3 ekle)
        // Ancak çoğu node sunucusu UTC çalışır. Basitlik için yerel saati alalım.
        // Eğer saat sorunu yaşanırsa burası 'tr-TR' locale ile güncellenir.
        const currentDay = now.getDay(); // 0=Pazar, 5=Cuma
        const currentHour = now.getHours().toString().padStart(2, '0');
        const currentMinute = now.getMinutes().toString().padStart(2, '0');
        const currentTime = `${currentHour}:${currentMinute}`;

        // --- 1. CUMA MESAJI ---
        if (config.fridayMessage.enabled && currentDay === 5) { // 5 = Cuma
            if (currentTime === config.fridayMessage.time) {
                const channel = client.channels.cache.get(config.fridayMessage.channelId);
                if (channel) {
                    // Rastgele mesaj seç
                    const messages = config.fridayMessage.messages;
                    const randomMsg = messages[Math.floor(Math.random() * messages.length)];

                    channel.send(randomMsg)
                        .then(() => console.log(`[CUMA] Mesaj gönderildi: ${currentTime}`))
                        .catch(e => console.error(`[CUMA] Hata: ${e}`));
                }
            }
        }

    }, 60000); // 1 Dakika arayla çalışır

    console.log('[SİSTEM] Oto-Mesaj Servisi Başlatıldı. 🕒');
};
