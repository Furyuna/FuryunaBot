module.exports = {
    // --- SEVİYE SİSTEMİ AYARLARI ---
    levelSystem: {
        xpPerMessage: { min: 10, max: 30 }, // Mesaj başına rastgele XP aralığı
        cooldown: 60000, // 1 Dakika (milisaniye cinsinden)
        coinMultiplier: 100, // Seviye başına verilecek para (Level * 100)
        ignoredChannels: [], // Buraya ID'ler yazılacak

        // Ses XP Ayarları (Level Sistemi İçin)
        voice: {
            xpPerMinute: 10,        // Level için XP
            coinPerMinute: 5,       // Para
            ignoredChannels: []
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
            boostDaily: 0.5,
            roles: {}
        },

        // Arka Plan
        cardBackground: ""
    }
};
