module.exports = {
    // --- GENEL AYARLAR (HEPSİ İÇİN GEÇERLİ) ---
    levelSystem: {
        // ORTAK AYARLAR (Hem Level Hem Rütbe İçin)
        cooldown: 60000,         // Bekleme Süresi (1 Dakika): Spamı engeller, ikisi için de geçerlidir.
        ignoredChannels: [],     // Yoksayılan Kanallar: Burada ne XP ne Rütbe puanı kazanılır.

        // --- SEVİYE SİSTEMİ (XP & PARA) ---
        xpPerMessage: { min: 10, max: 30 }, // Mesaj başına rastgele XP aralığı
        xpNeededPerLevel: 2000,  // Her seviye için gereken SABİT XP (Zorluk artmaz -> ~100 Mesaj)
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
            activityPerMessage: 5,        // Mesaj başı aktiflik puanı
            activityPerVoiceMinute: 5,    // Ses dakika başı aktiflik puanı
            decayRate: 0.05,              // Günlük silinme oranı (%5)

            // Aktiflik Puanı Hedefleri (Puan -> Rol ID)
            thresholds: {
                100: "1449821236111872120",   // Bronz
                150: "1449821307016450119",   // Gümüş
                200: "1449837249914212626",   // Altın
                250: "1449837274291507310",   // Platin
                300: "1449837286752780540"    // Elmas
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
            levelUp: "🎉 Tebrikler {user}! **Seviye {level}** oldun!\n💸 **{money}** Furyuna Coin kazandın. (Boost Bonusu: +{bonus})",

            // {user} = Kullanıcı (Display Name), {role} = Yeni Rütbe
            rankUp: "🎉 Tebrikler **{user}**! Aktifliğin sayesinde **{role}** rütbesini kazandın! 🚀"
        }
    }
};
