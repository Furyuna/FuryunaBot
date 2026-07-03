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
        inactivityThreshold: 1000 * 60 * 60 * 4, // 4 Saat (Sessizlik Süresi)
        checkInterval: 1000 * 60, // Her 1 dakikada bir kontrol (Performans için artırıldı)

        // ⏳ ETKİNLİK SÜRESİ (HEPSİ İÇİN GEÇERLİ)
        eventDuration: 0, // 0 = Sonsuz (Ölü Bekleme Yok), >0 = Süreli
        activeTimeout: 1000 * 60 * 5,  // 5 Dakika (Geçerlilik süresi - bu süre kadar yeni mesaj gelmezse soru kapanır)
        messagesBeforeTimeout: 3, // Geçerlilik süresi (activeTimeout) KAÇINCI mesajdan sonra başlasın? (Eskiden 1'di -> ilk mesaj)

        // 📝 SABİT MESAJLAR
        messages: {
            quizTitle: "🧠 BİLGİ YARIŞMASI",
            mathTitle: "🧩 ZEKA YARIŞMASI",
            dropTitle: "⚡ HIZ YARIŞMASI",
            winner: "🎉 Tebrikler {user}! **{reward} Coin** ve **{xp} XP** kazandın! 💸",
            timeout: "⏰ Süre doldu! Kimse bilemedi...",
            timeoutDrop: "⏰ Süre doldu! Kimse yazamadı...",

            // 😜 SORUYU "YANITLA" İLE YANLIŞ CEVAPLAYANLARLA DALGA GEÇME MESAJLARI (Rastgele seçilir)
            wrongReplyTeases: [
                "😂 Cidden bu cevaba mı güvendin? Yanına bile yaklaşamadın!",
                "🤡 Hahah... hayır. O tuşlara biraz daha bas bakalım.",
                "💀 Bu kadar mı? Yanlış, hem de fena halde yanlış!",
                "🙃 Yok yok, o değil. Ama denemen çok tatlıydı.",
                "📉 O özgüvenle yanlış cevap vermek de ayrı bir yetenek bravo.",
                "🦊 Furyuna senden utandı şu an. Yanlış!",
                "❌ Pat diye yanlış. Acele etme, biraz düşünsen?",
                "🤭 O cevabı nereden buldun, çöp kutusundan mı?",
                "😹 Olmadı canım, hiç olmadı. Tekrar dene (ya da deneme).",
                "🫠 Yaklaştın bile diyemem. Tamamen ışınlandın yanlışa.",
                "🥴 Bu cevabı görünce klavyeni sorgula derim.",
                "🧠 Beynin bir kahve molası vermiş galiba. Yanlış!",
                "📚 Kitapları açsan fena olmaz, bu değildi.",
                "🚮 Cevabını geldiği yere geri koyabilirsin, yanlış.",
                "😔 İnancım tamdı sana... ve boşa çıktı.",
                "🎪 Sirke başvurabilirsin, komik oldu ama yanlış.",
                "🐟 Balık hafızası bile bunu bilirdi, yanlış.",
                "🧊 Buz gibi soğuk, cevaptan kilometrelerce uzaktasın.",
                "🙈 Bunu görmezden geleceğim ama yine de: yanlış.",
                "🫡 Cesaretin için teşekkürler, doğruluk için değil.",
                "📵 Nöronlarınla iletişim kopmuş sanırım. Yanlış!",
                "🤨 Emin misin? Çünkü ben eminim: yanlış.",
                "🎯 Hedefi vurdun ama yanlış tahtayı. Alkış.",
                "🍞 Ekmek kadar sade bir yanlış, afiyet olsun.",
                "😴 Uyuya uyuya cevap veriyorsun galiba, yanlış.",
                "🪦 Bu cevabı buraya gömüyorum. Huzur içinde yat.",
                "🧩 Parçalar hiç oturmadı, tamamen yanlış.",
                "🛑 Dur! O cevabı kimse duymasın. Yanlış çünkü.",
                "🤷 Denedin, olmadı, hayat böyle. Yanlış.",
                "🎈 Cevabın balon gibi, dokununca patladı. Yanlış.",
                "🐌 Bu hızla bu cevabı vermene şaşırdım. Yanlış.",
                "📖 Genel kültür alarmı çalıyor: yanlış cevap!",
                "💤 Zzz... pardon, cevabın beni uyuttu. Yanlış.",
                "🃏 Elindeki tek kart yanlıştı, onu da oynadın.",
                "🧯 Yangın yok ama cevabın felaket. Yanlış."
            ]
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
                { q: "Işığın saniyedeki hızı yaklaşık kaç kilometredir?", a: ["300000", "300.000", "300 000"] },
                { q: "Türkiye Cumhuriyetinin ilk cumhurbaşkanı kimdir?", a: ["atatürk", "mustafa kemal atatürk"] }
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

    // --- OTO CEVAP SİSTEMİ (SA/AS) ---
    autoReply: {
        enabled: true,
        triggers: ["sa", "selamın aleyküm", "selamun aleyküm", "s.a.", "s.a", "selaminaleykum", "selamin aleykum"],
        responses: [
            "Aleyküm Selam",
            "Aleyküm Selam.",
            "As.",
            "Aleyküm Selam canım, hoş geldin.",
            "Ve Aleyküm Selam."
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
    },
    // --- KUMAR SİSTEMİ (SLOT & BLACKJACK) ---
    gambling: {
        enabled: true,
        allowedChannelId: "1465051241162739938", // Sadece bu kanalda çalışır
        minBet: 10,
        maxBet: 50000,
        // Slot Oranları
        slot: {
            emojis: ["🍒", "🍋", "🍇", "🍉", "💎", "7️⃣"],
            win3: 5,   // 3 tanesi aynı (x5)
            win2: 2,   // 2 tanesi aynı (x2)
            jackpot: 10 // Hepsi 7 veya Elmas ise (x10) - (Hardcoded in logic)
        }
    },
    // --- RESİMLİ HOŞ GELDİN PENCERESİ (CANVAS) ---
    gifWelcome: {
        enabled: true,
        channelId: "1465051241162739938", // Test Kanalı
        // gifUrl satırı artık kullanılmıyor, lokal dosya kullanılıyor.
        width: 1000, // Çıktı genişliği (Yatay banner)
        height: 340, // Çıktı yüksekliği
        backgroundColor: "#000000", // GIF yüklenemezse arka plan rengi
        quality: 10, // GIF Kalitesi (1-20, 1 en iyi, 20 en hızlı)

        // Profil Fotoğrafı (Avatar) Ayarları
        avatar: {
            x: 50,      // X koordinatı (Sol üst köşe)
            y: 50,      // Y koordinatı (Sol üst köşe)
            size: 150,  // Çapı (Yuvarlak)
            border: 5,  // Çerçeve kalınlığı
            borderColor: "#ffffff" // Çerçeve rengi
        },

        // İsim (Username) Ayarları
        username: {
            text: "{username}", // {username} yerine kullanıcı adı gelir
            x: 220,     // X koordinatı
            y: 120,     // Y koordinatı
            font: "bold 40px sans-serif",
            color: "#ffffff"
        },

        // Hoş Geldin Mesajı
        title: {
            text: "HOŞ GELDİN!",
            x: 220,
            y: 70,
            font: "bold 30px sans-serif",
            color: "#FFD700" // Sarı
        }
    }
};
