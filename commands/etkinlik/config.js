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
        channelId: "1287071155219599525", // Genel Sohbet
        inactivityThreshold: 1000 * 60 * 30, // 30 Dakika hareketsizlik süresi
        checkInterval: 1000 * 60 * 1, // Her 1 dakikada bir kontrol eder

        // ⏳ ETKİNLİK SÜRESİ (HEPSİ İÇİN GEÇERLİ)
        eventDuration: 30000, // 30 Saniye (ms cinsinden)

        // 📝 SABİT MESAJLAR
        messages: {
            quizStart: "⏱️ **{time} saniye** içinde ilk bilen kazanır!",
            mathStart: "⏱️ **{time} saniye** içinde ilk çözen kazanır!",
            dropStart: "⏱️ **{time} saniye** içinde ilk yazan kapar!",
            winner: "🎉 Tebrikler {user}! **{reward} Coin** kazandın! 💸",
            timeout: "⏰ Süre doldu! Kimse bilemedi..."
        },

        // Etkinliklerin çıkma olasılıkları (Ağırlık)
        weights: {
            quiz: 40,   // %40
            math: 40,   // %40
            drop: 20    // %20
        },

        // 🧠 Bilgi Yarışması Ayarları
        quiz: {
            reward: 50, // Ödül
            questions: [
                { q: "Türkiye'nin başkenti neresidir?", a: ["ankara"] },
                { q: "Su kaç derecede kaynar?", a: ["100"] },
                { q: "Fatih Sultan Mehmet İstanbul'u kaç yılında fethetti?", a: ["1453"] },
                { q: "Güneş sistemindeki en büyük gezegen hangisidir?", a: ["jupiter", "jüpiter"] },
                { q: "İstiklal Marşı'nın yazarı kimdir?", a: ["mehmet akif ersoy", "mehmet akif"] },
                { q: "Futbol maçları kaç dakika sürer?", a: ["90"] },
                { q: "Hangi hayvan 'Ormanlar Kralı' olarak bilinir?", a: ["aslan"] },
                { q: "Bir yılda kaç hafta vardır?", a: ["52"] },
                { q: "Botumuzun adı nedir?", a: ["furyuna", "furyunabot"] }
            ]
        },

        // ➕ Matematik Sorusu Ayarları
        math: {
            reward: 35,
            min: 10,
            max: 99,
            operations: ['+', '-', '*']
        },

        // 💸 Airdrop (Para Dağıtma) Ayarları
        drop: {
            minReward: 20,
            maxReward: 100,
            words: ["furyuna", "para", "kap", "ganimet", "coin"]
        }
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
