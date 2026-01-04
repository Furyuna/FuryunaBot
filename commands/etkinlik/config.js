module.exports = {
    // --- HAYIRLI CUMALAR MESAJI ---
    fridayMessage: {
        enabled: true,                  // Açık mı?
        time: "11:53",                  // Saat kaçta atılacak? (24 saat formatı)
        channelId: "1287071155219599525", // Mesajın atılacağı kanal ID'si

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
        channelId: "1287071155219599525"
    },

    // --- HOŞ GELDİN MESAJI ---
    welcome: {
        enabled: true,
        channelId: "1287071155219599525", // Genel Sohbet
        pingRoleId: "1457114132108017837", // Hoş Geldin Ping Rolü
        messages: [
            (target, roleId) => `🎉 **Furyuna**'ya hoş geldin <@${target}>! Seni aramızda görmek harika. 🌟\n<@&${roleId}>`,
            (target, roleId) => `🚀 **Furyuna** ailesine yeni bir üye katıldı! Hoş geldin <@${target}>. 🥳\n<@&${roleId}>`,
            (target, roleId) => `👋 Selam <@${target}>! **Furyuna** evrenine hoş geldin, keyifli vakit geçirmen dileğiyle!\n<@&${roleId}>`,
            (target, roleId) => `💫 Aramıza hoş geldin <@${target}>! **Furyuna** seninle daha güzel.\n<@&${roleId}>`,
            (target, roleId) => `✨ **Furyuna**'ya giriş yaptın <@${target}>! İyi eğlenceler dileriz.\n<@&${roleId}>`
        ]
    }
};
