const config = require('../commands/etkinlik/config.js');
const fs = require('fs');
const path = require('path');
const stateFile = path.join(__dirname, '../data/scheduledEvents.json');

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

        // --- 1. CUMA MESAJI (AKILLI SİSTEM) ---
        if (config.fridayMessage.enabled && currentDay === 5) { // 5 = Cuma
            const todayDateString = now.toLocaleDateString('tr-TR'); // "9.01.2026" gibi

            // Hedef zamanı hesapla (Rastgelelik içerir)
            let targetMinutes = 0;

            // Durum dosyasını oku
            let state = {};
            try {
                state = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
            } catch (e) { }

            // Eğer bugün için zaten bir hedef belirlenmişse onu kullan
            if (state.fridayTargetDate === todayDateString && state.fridayTargetMinutes) {
                targetMinutes = state.fridayTargetMinutes;
            } else {
                // Yoksa yeni bir rastgele dakika belirle ve kaydet
                const [startHour, startMin] = config.fridayMessage.startTime.split(':').map(Number);
                const [endHour, endMin] = config.fridayMessage.endTime.split(':').map(Number);

                const startTotal = (startHour * 60) + startMin;
                const endTotal = (endHour * 60) + endMin;

                targetMinutes = Math.floor(Math.random() * (endTotal - startTotal + 1)) + startTotal;

                // Kaydet
                state.fridayTargetDate = todayDateString;
                state.fridayTargetMinutes = targetMinutes;
                try {
                    fs.writeFileSync(stateFile, JSON.stringify(state, null, 4));
                } catch (e) { }

                console.log(`[CUMA] Bugünün şanslı saati belirlendi: ${Math.floor(targetMinutes / 60)}:${(targetMinutes % 60).toString().padStart(2, '0')}`);
            }

            const nowMinutes = (now.getHours() * 60) + now.getMinutes();

            // Şayet belirlenen hedef saati geçtiyse VE bugün henüz mesaj atılmadıysa
            if (nowMinutes >= targetMinutes) {

                if (state.lastFridayDate !== todayDateString) {
                    const channel = client.channels.cache.get(config.fridayMessage.channelId);
                    if (channel) {
                        // Rastgele mesaj seç
                        const messages = config.fridayMessage.messages;
                        const randomMsg = messages[Math.floor(Math.random() * messages.length)];

                        channel.send(randomMsg)
                            .then(() => {
                                console.log(`[CUMA] Mesaj gönderildi: ${currentTime}`);
                                // Durumu Kaydet (Mesaj atıldı)
                                state.lastFridayDate = todayDateString;
                                fs.writeFileSync(stateFile, JSON.stringify(state, null, 4));
                            })
                            .catch(e => console.error(`[CUMA] Hata: ${e}`));
                    }
                }
            }
        }

        // --- 2. GÜNAYDIN MESAJI (AKILLI SİSTEM) ---
        // Her gün belirlenen aralıkta (örn: 07:58 - 08:50) rastgele atar.
        if (config.morning.enabled) {
            const todayDateString = now.toLocaleDateString('tr-TR');

            // Durum dosyasını oku
            let state = {};
            try {
                state = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
            } catch (e) { }

            // GEÇ KALMA KONTROLÜ (Saat 11:00'i geçtiyse atma, bugünü "atıldı" say)
            if (parseInt(currentHour) >= 11) {
                if (state.lastMorningDate !== todayDateString) {
                    state.lastMorningDate = todayDateString;
                    // Reset target for tomorrow
                    state.morningTargetDate = null;
                    state.morningTargetMinutes = null;
                    try {
                        fs.writeFileSync(stateFile, JSON.stringify(state, null, 4));
                        console.log(`[GÜNAYDIN] Mesaj saati kaçırıldı (>11:00). Bugün pas geçiliyor.`);
                    } catch (e) { }
                }
            } else {
                // NORMAL AKIŞ
                let targetMinutes = 0;

                if (state.morningTargetDate === todayDateString && state.morningTargetMinutes) {
                    targetMinutes = state.morningTargetMinutes;
                } else {
                    const [startHour, startMin] = config.morning.startTime.split(':').map(Number);
                    const [endHour, endMin] = config.morning.endTime.split(':').map(Number);
                    const startTotal = (startHour * 60) + startMin;
                    const endTotal = (endHour * 60) + endMin;
                    targetMinutes = Math.floor(Math.random() * (endTotal - startTotal + 1)) + startTotal;

                    state.morningTargetDate = todayDateString;
                    state.morningTargetMinutes = targetMinutes;
                    try {
                        fs.writeFileSync(stateFile, JSON.stringify(state, null, 4));
                    } catch (e) { }
                    console.log(`[GÜNAYDIN] Hedef Saat: ${Math.floor(targetMinutes / 60)}:${(targetMinutes % 60).toString().padStart(2, '0')}`);
                }

                const nowMinutes = (now.getHours() * 60) + now.getMinutes();

                if (nowMinutes >= targetMinutes && state.lastMorningDate !== todayDateString) {
                    const channel = client.channels.cache.get(config.morning.channelId);
                    if (channel) {
                        const messages = config.morning.messages;
                        const randomMsg = messages[Math.floor(Math.random() * messages.length)];
                        channel.send(randomMsg).then(() => {
                            console.log(`[GÜNAYDIN] Mesaj gönderildi.`);
                            state.lastMorningDate = todayDateString;
                            fs.writeFileSync(stateFile, JSON.stringify(state, null, 4));
                        }).catch(e => console.error(`[GÜNAYDIN] Hata: ${e}`));
                    }
                }
            }
        }

        // --- 3. GECE TEMİZLİĞİ (İPTAL EDİLDİ) ---
        // Eskiden her gece 04:05'te sunucuda olmayanların verisi otomatik siliniyordu.
        // Çıkıp ertesi gün geri girenler tüm verilerini (XP/level/aktiflik) kaybettiği
        // için kapatıldı. Hayalet temizliği artık YALNIZCA manuel /senkronize komutuyla,
        // yetkili bilerek çalıştırdığında yapılır.
    }, 60000); // 1 Dakika arayla çalışır

    console.log('[SİSTEM] Oto-Mesaj Servisi Başlatıldı. 🕒');
};
