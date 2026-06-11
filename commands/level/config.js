module.exports = {
    // --- GENEL AYARLAR (HEPSİ İÇİN GEÇERLİ) ---
    levelSystem: {
        // ORTAK AYARLAR (Hem Level Hem Rütbe İçin)
        cooldown: 2000,          // Bekleme Süresi (2 Saniye): Hızlı test için düşürüldü.
        ignoredChannels: [1383056700700885073, 1294987333698981969],     // Yoksayılan Kanallar: Burada ne XP ne Rütbe puanı kazanılır.
        levelUpChannelId: "1287071155219599525", // Seviye atlama tebriklerinin atılacağı kanal (Genel Sohbet)

        // --- SEVİYE SİSTEMİ (XP & PARA) ---
        // XP Gereksinimi (1000 XP):
        // Kullanıcı isteği: 2000 çok görünüyor, 1000 olsun ama zorluk aynı kalsın.
        // Çözüm: Hedefi yarıya indirdik, kazanılan XP'yi de yarıya indirdik.
        xpNeededPerLevel: 1000,

        // XP Kazanma Aralığı (5 - 15 ARASI):
        // Eskiden 10-20 idi. Hedef 2000 -> 1000 olduğu için bunu da yarıya çektik.
        // Böylece yine ortalama 100 mesajda level atlanacak.
        xpPerMessage: {
            min: 5,
            max: 15
        },
        coinMultiplier: 100,     // Seviye başına verilecek para (Level * 100)

        // Ses XP Ayarları (Level Sistemi İçin)
        voice: {
            xpPerMinute: 10,        // Level için XP
            coinPerMinute: 0,       // Para (İptal edildi)
            ignoredChannels: []
        },

        // --- KOMUT İSİMLERİ (Buradan değiştirebilirsiniz) ---
        commands: {
            profile: "profil",       // Profil komutu adı
            leaderboard: "sıralama", // Sıralama komutu adı
            management: "level-yonet" // Yönetim komutu adı
        },

        // --- DİNAMİK RÜTBE SİSTEMİ (RANK SYSTEM) ---
        rankSystem: {
            enabled: true,
            activityPerMessage: 1,        // Mesaj başına aktiflik puanı (EKSİK OLAN AYAR)
            activityPerVoiceMinute: 5,    // Ses dakika başı aktiflik puanı
            decayRate: 0.11,              // Günlük silinme oranı (%11 - 2 gün girmeyen Elmas düşer)
            maxPoints: 1500,              // MAKSİMUM PUAN SINIRI (Hoarding engellemek için)
            announceRankUp: false,    // Rütbe atlama mesajı gönderilsin mi? (Spam olmaması için kapalı)

            // Aktiflik Puanı Hedefleri (Puan -> Rol ID)
            thresholds: {
                200: "1457051809511374898",   // Bronz
                400: "1457051860119851243",   // Gümüş
                600: "1457052073458794697",   // Altın
                800: "1457051906265448764",   // Platin
                1000: "1457051986074534050"   // Elmas
            }
        },

        // Eski Level Ödülleri (İptal edildi, Rütbe sistemine taşındı)
        levelRewards: {},

        // XP Bonusları (Para ve Level XP'si için geçerli)
        bonuses: {
            boostCoinMultiplier: 2, // Boost basanlara 2 KAT daha fazla para
            roles: {}
        },

        // Arka Plan
        cardBackground: "",

        // --- MESAJLAR (Özelleştirilebilir) ---
        messages: {
            // {user} = Kullanıcı, {level} = Yeni Level, {money} = Toplam Para, {bonus} = Bonus Para
            levelUp: "🎉 Tebrikler {user}! **Seviye {level}** oldun!\n💸 **{money}** FCoin kazandın. (Boost Bonusu: +{bonus})",

            // {user} = Kullanıcı (Display Name), {role} = Yeni Rütbe
            rankUp: "🎉 Tebrikler **{user}**! Aktifliğin sayesinde **{role}** rütbesini kazandın! 🚀"
        }
    }
};
