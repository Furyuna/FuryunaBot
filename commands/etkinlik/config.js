module.exports = {
    // --- HAYIRLI CUMALAR MESAJI ---
    fridayMessage: {
        enabled: true,                  // Açık mı?
        time: "11:53",                  // Saat kaçta atılacak? (24 saat formatı)
        channelId: "1394372243554828431", // Mesajın atılacağı kanal ID'si

        // Rastgele seçilecek mesajlar
        messages: [
            "🕌 **Hayırlı Cumalar!** Allah dualarımızı kabul etsin. 🤲",
            "✨ Cumanız mübarek olsun. Huzurlu ve bereketli bir gün dilerim.",
            "🌹 **Hayırlı Cumalar!** Gönlünüzden geçen tüm güzellikler kabul olsun.",
            "🕊️ Bu mübarek günde dualarda buluşalım. **Hayırlı Cumalar.**",
            "🕋 **Cumanız Mübarek Olsun.** Rabbim bizi affedilenlerden eylesin."
        ]
    },

    // --- SOHBET CANLANDIRICI (REVIVAL) - İLERİDE EKLENECEK ---
    chatRevival: {
        enabled: false,
        timeoutMinutes: 60, // 60 dakika sessizlik olursa
        channelId: "1394372243554828431"
    }
};
