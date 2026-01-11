module.exports = {
    // --- HAYIRLI CUMALAR MESAJI ---
    fridayMessage: {
        enabled: true,                  // Açık mı?
        startTime: "11:30",             // Başlangıç Saati
        endTime: "13:30",               // Bitiş Saati
        channelId: "1287071155219599525", // Mesajın atılacağı kanal ID'si

        // Rastgele seçilecek mesajlar
        messages: [
            "✨ Hayırlı Cumalar! Gönlünüzden geçen tüm güzelliklerin gerçekleşmesi dileğiyle.",
            "🌹 Cumanız mübarek, gününüz huzurlu olsun. İyi hissettiğiniz bir gün dilerim.",
            "🕌 Hayırlı Cumalar! Kalbiniz ferah, neşeniz bol olsun.",
            "🕊️ Dualarınızın kabul olduğu, huzur dolu bir gün olsun. Hayırlı Cumalar!",
            "🦊 Furyuna ailesinin Cuması mübarek olsun! Herkese kucak dolusu sevgiler."
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
        activeTimeout: 1000 * 60 * 5,  // 5 Dakika (Sohbet başladıktan sonraki süre - Canlı Bekleme)

        // 📝 SABİT MESAJLAR
        messages: {
            quizTitle: "🧠 BİLGİ YARIŞMASI",
            mathTitle: "🧩 ZEKA YARIŞMASI",
            dropTitle: "⚡ HIZ YARIŞMASI",
            winner: "🎉 Tebrikler {user}! **{reward} Coin** ve **{xp} XP** kazandın! 💸",
            timeout: "⏰ Süre doldu! Kimse bilemedi...",
            timeoutDrop: "⏰ Süre doldu! Kimse yazamadı..."
        },



        // 🧠 Bilgi Yarışması Ayarları
        quiz: {
            minReward: 40, maxReward: 60, // Ödül Aralığı (Coin)
            minXp: 250, maxXp: 350,       // XP Aralığı
            activity: 20, // Aktiflik Puanı (Gizli - Yüksek)
            questions: [
                { q: "Türkiye Cumhuriyeti'nin kurucusu kimdir?", a: ["atatürk", "mustafa kemal atatürk"] },
                { q: "Türkiye Cumhuriyeti kaç yılında kurulmuştur?", a: ["1923"] },
                { q: "Türkiye'nin başkenti neresidir?", a: ["ankara"] },
                { q: "Su deniz seviyesinde (1 atmosfer basınçta) kaç derecede kaynar?", a: ["100"] },
                { q: "Fatih Sultan Mehmet İstanbul'u kaç yılında fethetti?", a: ["1453"] },
                { q: "Güneş sistemindeki en büyük gezegen hangisidir?", a: ["jupiter", "jüpiter"] },
                { q: "İstiklal Marşı'nın yazarı kimdir?", a: ["mehmet akif ersoy", "mehmet akif"] },
                { q: "Bir yılda kaç hafta vardır?", a: ["52"] },
                { q: "Milli Mücadele hangi yılda başlamıştır?", a: ["1919"] },
                { q: "Işığın saniyedeki hızı yaklaşık kaç kilometredir?", a: ["300000", "300.000", "300 000"] }
            ]
        },

        // ➕ Matematik Sorusu Ayarları
        math: {
            minReward: 25, maxReward: 45,
            minXp: 80, maxXp: 120, // XP Aralığı (Orta)
            activity: 15, // Aktiflik (Orta)
            min: 10,
            max: 99,
            operations: ['+', '-', '*']
        },

        // 💸 Airdrop (Kelime Kapmaca) Ayarları
        drop: {
            minReward: 20,
            maxReward: 100,
            minXp: 40, maxXp: 60, // XP Aralığı (Düşük)
            activity: 10, // Aktiflik (Düşük)
            words: [
                "Furyuna En İyi Furry Sunucusu",
                "Furyuna Asla Yanılmaz",
                "Şanlı Furyuna Çok Yaşa",
                "Furyuna Her Zaman Haklıdır",
                "Furyuna Yüceler Yücesi Liderimiz",
                "Furyuna Furry Dünyasının Lideri",
                "Furyuna Mükemmelliğin Tanımıdır",
                "Furyuna Tek Yol",
                "Furyuna Kalitenin Tek Adresi",
                "Furyuna Evrenin En İyi Sunucusu",
                "Furyuna Sonsuz Pozitifliktir",
                "Her Şey Furyuna İçin",
                "Furyuna Kainatın Hakimi",
                "Furyuna Mutluluğun Kaynağıdır",
                "Furyuna Sadakatimiz Sonsuz",
                "Furyuna Furry Aleminin Yılıdızıdır",
                "Furyuna Her Şeyin En İyisidir",
                "Furyuna Büyük Sunucu",
                "Furyuna Bizim Her Şeyimiz",
                "Furyuna Kudretli Lider",
                "Furyuna Güneş Gibi Doğar",
                "Furyuna İle Sonsuza",
                "Furyuna Karanlıkları Aydınlatır",
                "Furyuna Sevginin Adresidir",
                "Yaşasın Furyuna Yönetimi",
                "Furyuna Varsa Sorun Yoktur",
                "Kalbimiz Furyuna İçin Atıyor",
                "Furyuna Düşmanlarına Geçit Yok",
                "Furyuna Rakipsizdir",
                "Furyuna Yoksa Biz De Yokuz",
                "Furyuna Zirvenin Sahibidir",
                "Söz Konusu Furyuna İse Gerisi Teferruattır",
                "Furyuna Her Zaman Kazanır",
                "Furyuna Furry Dünyasının Güneşidir",
                "Furyuna Varsa Hayat Var",
            ]
        }
    },
    // 📅 SABAH MESAJI AYARLARI (GÜNAYDIN)
    morning: {
        enabled: true,
        channelId: "1287071155219599525", // Genel Sohbet (Aynı kanal)
        startTime: "07:58", // Başlangıç Saati
        endTime: "08:50",   // Bitiş Saati
        messages: [
            "☀️ Günaydın Furyuna ahalisi! Güneş doğdu ama asıl güneş sizsiniz. 🦊✨",
            "🌅 Sabahınız hayrolsun! Furyuna ile enerjik bir güne hazır mısınız? ☕",
            "🥞 Günaydın! Kahveler içildi mi? Kuyruklar tarandı mı? Güne başlıyoruz! 🐾",
            "🌍 Dünyanın en iyi sunucusunun en güzel üyelerine GÜNAYDIN! 💎",
            "☀️ Günaydın! Uyanın! Furyuna'da yeni bir gün, yeni fırsatlar ve bolca eğlence sizi bekliyor. 🎉",
            "🔔 Ding dong! Günaydın! Furyuna yönetimi hepinize musmutlu bir gün diler. ❤️",
            "💤 Uykucu şirinler kalktı mı? Günaydın FURYUNA! 🐺🔥",
            "✨ Güneşi kıskandıracak enerjinizle günaydın! Furyuna ailesi uyanıyor...",
            "🚀 Günaydın! Bugün yine Furry dünyasını sallamaya var mıyız? Tabii ki Furyuna ile! 💪",
            "🍀 Günaydın, harika bir gün olsun! Unutmayın, Furyuna varsa hayat var. 🌸"
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
