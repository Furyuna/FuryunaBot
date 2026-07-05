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
                { q: "Türkiye Cumhuriyetinin ilk cumhurbaşkanı kimdir?", a: ["atatürk", "mustafa kemal atatürk"] },

                // --- Coğrafya ---
                { q: "Afrika'daki, dünyanın en uzun nehirlerinden biri olan nehir hangisidir?", a: ["nil"] },
                { q: "Türkiye'nin en kalabalık şehri hangisidir?", a: ["istanbul"] },
                { q: "Dünyanın en yüksek dağı hangisidir?", a: ["everest"] },
                { q: "Türkiye'nin en yüksek dağı hangisidir?", a: ["ağrı dağı", "ağrı"] },
                { q: "'Kara Kıta' olarak bilinen kıta hangisidir?", a: ["afrika"] },
                { q: "Dünyanın en büyük okyanusu hangisidir?", a: ["pasifik"] },
                { q: "İtalya'nın başkenti neresidir?", a: ["roma"] },
                { q: "Fransa'nın başkenti neresidir?", a: ["paris"] },
                { q: "Japonya'nın başkenti neresidir?", a: ["tokyo"] },
                { q: "Türkiye'nin kuzeyindeki deniz hangisidir?", a: ["karadeniz"] },

                // --- Bilim ---
                { q: "Suyun kimyasal formülü nedir?", a: ["h2o"] },
                { q: "İnsan vücudundaki en büyük organ hangisidir?", a: ["deri", "cilt"] },
                { q: "Kanı vücuda pompalayan organ hangisidir?", a: ["kalp"] },
                { q: "Görelilik teorisini geliştiren bilim insanı kimdir?", a: ["einstein", "albert einstein"] },
                { q: "Yerçekimi yasasıyla tanınan bilim insanı kimdir?", a: ["newton", "isaac newton"] },
                { q: "Suyun donma sıcaklığı kaç derecedir?", a: ["0", "sıfır"] },
                { q: "Solunumda yaşamak için aldığımız gaz hangisidir?", a: ["oksijen"] },
                { q: "Ampulüyle tanınan ünlü mucit kimdir?", a: ["edison", "thomas edison"] },
                { q: "İnsan iskeletinde yaklaşık kaç kemik vardır?", a: ["206"] },
                { q: "Kana kırmızı rengini veren madde nedir?", a: ["hemoglobin"] },
                { q: "Dünya, Güneş çevresindeki turunu yaklaşık kaç günde tamamlar?", a: ["365"] },

                // --- Uzay ---
                { q: "Güneş'e en yakın gezegen hangisidir?", a: ["merkür"] },
                { q: "'Kızıl Gezegen' olarak bilinen gezegen hangisidir?", a: ["mars"] },
                { q: "Uzaya giden ilk insan kimdir?", a: ["gagarin", "yuri gagarin"] },

                // --- Tarih ---
                { q: "Osmanlı Devleti'nin kurucusu kimdir?", a: ["osman bey", "osman gazi"] },
                { q: "İkinci Dünya Savaşı hangi yıl sona ermiştir?", a: ["1945"] },
                { q: "TBMM hangi yıl açılmıştır?", a: ["1920"] },
                { q: "Cumhuriyet hangi ayda ilan edilmiştir?", a: ["ekim"] },
                { q: "Amerika kıtasına 1492'de ulaşan ünlü denizci kimdir?", a: ["kolomb", "kristof kolomb"] },

                // --- Doğa & Hayvanlar ---
                { q: "Ormanların kralı olarak bilinen hayvan hangisidir?", a: ["aslan"] },
                { q: "Dünyanın en büyük hayvanı hangisidir?", a: ["mavi balina", "balina"] },
                { q: "En hızlı kara hayvanı hangisidir?", a: ["çita"] },
                { q: "Boynu çok uzun olan Afrika hayvanı hangisidir?", a: ["zürafa"] },
                { q: "Kutup ayısının tüyleri hangi renktedir?", a: ["beyaz"] },

                // --- Kültür & Genel ---
                { q: "Bir futbol takımında sahada kaç oyuncu bulunur?", a: ["11"] },
                { q: "Gökkuşağında kaç renk vardır?", a: ["7", "yedi"] },
                { q: "Bir günde kaç saat vardır?", a: ["24"] },
                { q: "Bir saat kaç dakikadır?", a: ["60"] },
                { q: "Mona Lisa tablosunu kim yapmıştır?", a: ["da vinci", "leonardo da vinci", "leonardo"] },
                { q: "İngilizcedeki 'apple' kelimesinin Türkçesi nedir?", a: ["elma"] },
                { q: "Bir düzine kaç adettir?", a: ["12", "on iki"] },

                // --- Matematik ---
                { q: "Bir üçgenin iç açıları toplamı kaç derecedir?", a: ["180"] },
                { q: "Bir dik açı kaç derecedir?", a: ["90"] },
                { q: "Bir tam çember kaç derecedir?", a: ["360"] },
                { q: "Pi sayısı yaklaşık kaçtır?", a: ["3.14", "3,14"] }
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
                // Tekerlemeler (yazması eğlenceli/zorlayıcı)
                "Şu köşe yaz köşesi şu köşe kış köşesi",
                "Dal sarkar kartal kalkar",
                "Kırk küp kırkının da kulpu kırık kara küp",
                "Bir berber bir berbere gel beraber dükkan açalım demiş",
                "Al şu takatukaları takatukacıya götür",
                "Bu duvarı badanalamalı mı badanalamamalı mı",
                "Getirince kediyi eve pisi pisi diye severler",
                // Pozitif / keyifli
                "Bugün harika bir gün olacak",
                "Klavyede en hızlı parmaklar benim",
                "Bir fincan sıcak çikolata iyi gelir",
                "Yıldızlara uzanan küçük bir dilek",
                "Gülümsemek bulaşıcıdır",
                "Müzik ruhun gıdasıdır",
                "İyi ki bu sohbetteyiz",
                "Kahve her derde deva",
                // Sevimli / doğa temalı
                "Yumuşak tüylü sevimli bir tilki",
                "Ormanda özgürce koşan bir kurt",
                "Ay ışığında uluyan yalnız bir kurt",
                "Sabah çiğiyle ıslanan minik patiler",
                "Kar üstünde iz bırakan patiler",
                "Peluş kuyruğunu sallayan neşeli bir pati",
                // Eğlenceli / rastgele
                "Pizza mı hamburger mi bütün mesele bu",
                "Uykusuzlar kulübüne hoş geldiniz",
                "Bir dilim limonlu cheesecake lütfen",
                "Yağmurlu havada sıcacık bir battaniye",
                "Gece yarısı buzdolabı baskını",
                "En sevdiğim tuş boşluk tuşu",
                "Hafta sonu uyku moduna geçildi",
                "Çilekli dondurma asla eskimez",
                "Kitap kokusu en güzel kokudur",
                "Bir kupa çay üç dilim kurabiye",
                "Sonbahar yaprakları yere düşüyor",
                "Sıcak bir çorba soğuk günün ilacı",
                "Kediler internetin gerçek sahibi",
                "Bir tık daha sonra uyuyacağım",
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

    // --- ÜYE SAYISI KANALI (İsim otomatik güncellenir) ---
    memberCountChannel: {
        enabled: true,
        channelId: "1288519209399353344",
        format: "Üye Sayısı • {count}", // {count} yerine üye sayısı gelir
        updateIntervalMinutes: 10       // Discord rename limiti (~2/10dk) yüzünden düşük tutulmamalı
    },

    // --- TAKVİYE (BOOST) DUYURUSU ---
    // Başka bot takviyecilere roleId'yi veriyor; biz rol eklenince chate mesaj atarız.
    boostAnnounce: {
        enabled: true,
        roleId: "1234560409386881126",      // Takviyecilere verilen rol
        channelId: "1287071155219599525",   // Mesajın atılacağı kanal (Genel Sohbet)
        announceDelaySeconds: 2,            // Discord toplam takviye sayısını tazelesin diye duyuru gecikmesi
        // {user} = kişi etiketi, {count} = sunucudaki toplam takviye sayısı
        // {count} = sunucudaki TOPLAM aktif takviye sayısı (kaçıncı kişi/seviye DEĞİL)
        messages: [
            "🎉 {user} takviye bastı ve sunucumuzu toplam {count} takviyeye ulaştırdı! Teşekkürler! 💜",
            "💜 {user} sayesinde toplam takviyemiz {count} oldu! Desteğin için minnettarız! 🚀",
            "✨ {user} takviye bastı! Sunucumuz artık {count} takviyede! Furyuna'ya güç kattın! 🦊💜",
            "🚀 {user} yeni bir takviye bastı! Toplam {count} takviyeye ulaştık! Kocaman teşekkürler! 💜",
            "🥳 Alkışlar {user} için! Takviyesiyle {count} takviyeye çıktık! Sağ ol! 💜",
            "🎊 {user} takviye bastı! Furyuna şu an {count} takviyede — sen harikasın! 💜",
            "🌟 {user} bizi destekledi, takviye sayımız {count} oldu! Minnettarız! 💜"
        ],
        // Takviye bitince (rol kalkınca) mesaj atılsın mı?
        endEnabled: true,
        endMessages: [
            "🥺 {user} takviyesi sona erdi. Yine de desteğin için teşekkürler! 💜"
        ],

        // --- AYLIK SADAKAT ---
        // Kesintisiz takviye basmaya devam edenler için (Discord premiumSince'ten
        // hesaplanır). Kişinin her aylık dönümünde bir kez kutlanır.
        // {months} = kaç aydır kesintisiz takviye bastığı
        loyaltyEnabled: true,
        loyaltyMessages: [
            "💜 {user} tam {months} aydır takviye basıyor! Sadakatin için kocaman teşekkürler! 🦊",
            "🏆 {user} {months} aydır aramızda takviyeci! Sen bir efsanesin! 💜",
            "✨ {months} ay oldu ve {user} hâlâ takviyede! Desteğin için minnettarız! 💜",
            "🚀 {user} {months} aydır sunucuya destek oluyor! Böyle dostlar var oldukça! 💜",
            "🥹 {months} aydır kesintisiz takviye! {user} sen tam bir Furyuna aşığısın! 💜"
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
