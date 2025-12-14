module.exports = {
    // --- SEVİYE SİSTEMİ AYARLARI ---
    levelSystem: {
        xpPerMessage: { min: 10, max: 30 }, // Mesaj başına rastgele XP aralığı
        cooldown: 60000, // 1 Dakika (milisaniye cinsinden)
        coinMultiplier: 100, // Seviye başına verilecek para (Level * 100)
        ignoredChannels: [], // Buraya ID'ler yazılacak

        // Ses XP Ayarları
        voice: {
            xpPerMinute: 10,        // Dakika başı XP
            coinPerMinute: 5,       // Dakika başı Coin
            ignoredChannels: []     // AFK kanalı ID'leri
        },

        // Seviye Ödülleri (Level -> Rol ID)
        levelRewards: {
            5: "1449821236111872120",   // Bronz
            10: "1449821307016450119",  // Gümüş
            20: "1449837249914212626",  // Altın
            50: "1449837274291507310",  // Platin
            100: "1449837286752780540"  // Elmas
        },

        // XP Bonusları
        bonuses: {
            // Boost Bonus: (Boost Gün Sayısı * Günlük Bonus)
            // Örn: 10 gündür boost basıyorsa ve günlük 0.5 ise: 10 * 0.5 = +5 XP
            boostDaily: 0.5,

            // Rol Bonusları (Sabit puan ekler)
            roles: {
                // "ROL_ID": EKSTRA_XP
                // "1329376205195055125": 5 
            }
        },

        // Arka Plan Görselleri (Canvas kartı için)
        cardBackground: "https://i.imgur.com/8m1z9lS.png" // Varsayılan görsel
    }
};
