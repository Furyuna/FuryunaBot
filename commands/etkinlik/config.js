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
        enabled: true,
        channelId: "1287071155219599525", // Genel Sohbet
        pingRoleId: "1425518927274053775", // Aktiflik Pingi Rolü
        inactivityThreshold: 1000 * 60 * 60 * 3, // 3 Saat (Sessizlik Süresi)
        checkInterval: 1000 * 60, // Her 1 dakikada bir kontrol (Performans için artırıldı)

        // ⏳ ETKİNLİK SÜRESİ (HEPSİ İÇİN GEÇERLİ)
        eventDuration: 0, // 0 = Sonsuz (Ölü Bekleme Yok), >0 = Süreli
        activeTimeout: 1000 * 30,      // 30 Saniye (Sohbet başladıktan sonraki süre - Canlı Bekleme)

        // 📝 SABİT MESAJLAR
        messages: {
            quizTitle: "🧠 BİLGİ YARIŞMASI",
            mathTitle: "🧩 ZEKA YARIŞMASI",
            dropTitle: "⚡ HIZ YARIŞMASI",
            winner: "🎉 Tebrikler {user}! **{reward} Coin** ve **{xp} XP** kazandın! 💸",
            timeout: "⏰ Süre doldu! Kimse bilemedi...",
            timeoutDrop: "⏰ Süre doldu! Kimse yazamadı..."
        },

        // Etkinliklerin çıkma olasılıkları (Ağırlık)
        weights: {
            quiz: 40,   // %40
            math: 40,   // %40
            drop: 20    // %20
        },

        // 🧠 Bilgi Yarışması Ayarları
        quiz: {
            reward: 50, // Ödül (Coin)
            xp: 150,    // XP Ödülü (Yüksek)
            activity: 20, // Aktiflik Puanı (Gizli - Yüksek)
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
            xp: 100,      // XP (Orta)
            activity: 15, // Aktiflik (Orta)
            min: 10,
            max: 99,
            operations: ['+', '-', '*']
        },

        // 💸 Airdrop (Kelime Kapmaca) Ayarları
        drop: {
            minReward: 20,
            maxReward: 100,
            xp: 50,       // XP (Düşük - Çünkü sadece yazma)
            activity: 10, // Aktiflik (Düşük)
            words: [
                "En İyi Furry Sunucusu Furyuna",
                "Furyuna Asla Yanılmaz",
                "Şanlı Furyuna Çok Yaşa",
                "Türkiye'nin Bir Numarası Furyuna",
                "Furyuna Her Zaman Haklıdır",
                "Yüceler Yücesi Liderimiz Furyuna",
                "Furry Dünyasının Lideri Furyuna",
                "Furyuna Mükemmelliğin Tanımıdır",
                "Tek Yol Furyuna",
                "Kalitenin Tek Adresi Furyuna",
                "Furyuna Kusursuzdur",
                "Güneşimiz Furyuna",
                "Evrenin En İyi Sunucusu Furyuna",
                "Furyuna Sonsuz Pozitifliktir",
                "Her Şey Furyuna İçin",
                "Kainatın Hakimi Furyuna",
                "Furyuna Mutluluğun Kaynağıdır",
                "Sadakatimiz Sonsuz Furyuna",
                "Furyuna Furry Aleminin Yılıdızıdır",
                "Furyuna Hata Yapmaz",
                "Zafer Furyunanındır",
                "Furyuna Her Şeyin En İyisidir",
                "Büyük Önder Furyuna",
                "Furyuna Daima İleri Gider",
                "Furyuna Bizim Her Şeyimiz",
                "Furyuna Asla Pes Etmez",
                "Kudretli Lider Furyuna",
                "Furyuna Güneş Gibi Doğar",
                "Furyuna İle Sonsuza",
                "Furyuna Karanlıkları Aydınlatır",
                "Canımız Feda Furyuna",
                "Furyuna Sevginin Adresidir",
                "Yaşasın Yüce Furyuna Yönetimi",
                "Furyuna Varsa Sorun Yoktur",
                "Kalbimiz Furyuna İçin Atıyor",
                "Furyuna Çözümün Kendisidir",
                "Furyuna Düşmanlarına Geçit Yok",
                "Furyuna Rakipsizdir",
                "Furyuna Yoksa Biz De Yokuz",
                "Furyuna Zirvenin Sahibidir",
                "Söz Konusu Furyuna İse Gerisi Teferruattır",
                "Furyuna Eşsizdir",
                "Furyuna İle Yürüyoruz Geleceğe",
                "Furyuna Her Zaman Kazanır",
                "Furyuna Furry Dünyasının Güneşidir",
                "Furyuna Varsa Hayat Var",
                "Furyuna Cennetin Yeryüzündeki Şubesidir",
                "Furyuna Demek Mutluluk Demek",
                "Bütün Yollar Furyunaya Çıkar"
            ]
        }
    },
    // 📅 SABAH MESAJI AYARLARI (GÜNAYDIN)
    morning: {
        enabled: true,
        channelId: "1366096443160526958", // Genel Sohbet (Aynı kanal)
        startTime: "07:58", // Başlangıç Saati
        endTime: "08:50",   // Bitiş Saati
        messages: [
            "☀️ Günaydın Furyuna ahalisi! Güneş doğdu ama asıl güneş sizsiniz. 🦊✨",
            "🌅 Sabahınız xêr olsun! Furyuna ile enerjik bir güne hazır mısınız? ☕",
            "🥞 Günaydın! Kahveler içildi mi? Kuyruklar tarandı mı? Güne başlıyoruz! 🐾",
            "🌍 Dünyanın en iyi sunucusunun en güzel üyelerine GÜNAYDIN! 💎",
            "☀️ Uyanın! Furyuna'da yeni bir gün, yeni fırsatlar ve bolca eğlence sizi bekliyor. 🎉",
            "🔔 Ding dong! Sabah oldu! Furyuna yönetimi hepinize musmutlu bir gün diler. ❤️",
            "💤 Uykucu şirinler kalktı mı? Günaydın FURYUNA! 🐺🔥",
            "✨ Güneşi kıskandıracak enerjinizle günaydın! Furyuna ailesi uyanıyor...",
            "🚀 Günaydın! Bugün yine Furry dünyasını sallamaya var mıyız? Tabii ki Furyuna ile! 💪",
            "🍀 Harika bir gün olsun! Unutmayın, Furyuna varsa hayat var. 🌸"
        ]
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
