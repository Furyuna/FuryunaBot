const fs = require('fs');
const path = require('path');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder } = require('discord.js');

module.exports = (client) => {
    // Yedekleme Hedefi: Proje kök dizininde 'backups' klasörü
    const BACKUP_DIR = path.join(__dirname, '../backups');
    const DB_PATH = path.join(__dirname, '../database.sqlite');

    // Klasör yoksa oluştur
    if (!fs.existsSync(BACKUP_DIR)) {
        fs.mkdirSync(BACKUP_DIR);
    }

    // Hedef Saat: Her gece 03:55 (Temizlikten 5 dk önce)
    const TARGET_HOUR = 3;
    const TARGET_MINUTE = 55;

    function init() {
        console.log('[BACKUP] Yedekleme sistemi başlatılıyor...');

        // 1. TELAFİ KONTROLÜ: Bugün yedek alınmış mı?
        checkAndRunMissedBackup();

        // 2. Rutin Zamanlayıcıyı Başlat
        scheduleDailyBackup();
    }

    function checkAndRunMissedBackup() {
        const now = new Date();
        const targetTimeToday = new Date(now);
        targetTimeToday.setHours(TARGET_HOUR, TARGET_MINUTE, 0, 0);

        // Eğer şu an saat 03:55'i geçtiyse, bugün bir yedek olmalı.
        if (now > targetTimeToday) {
            const todayStr = now.toISOString().split('T')[0];

            try {
                const files = fs.readdirSync(BACKUP_DIR);
                const hasBackupToday = files.some(file => file.startsWith(`database_backup_${todayStr}`));

                if (!hasBackupToday) {
                    console.log(`[BACKUP-UYARI] Bugün (${todayStr}) yedek alınmamış (Bot kapalı kalmış olabilir). Hemen telafi yedeği alınıyor...`);
                    createBackup();
                } else {
                    console.log(`[BACKUP] Bugünün yedeği zaten mevcut. Sorun yok.`);
                }
            } catch (e) {
                console.error("[BACKUP-INIT-ERROR]", e);
            }
        }
    }

    function scheduleDailyBackup() {
        const now = new Date();
        let nextRun = new Date(now);

        nextRun.setHours(TARGET_HOUR, TARGET_MINUTE, 0, 0);

        if (now >= nextRun) {
            nextRun.setDate(now.getDate() + 1);
        }

        const timeUntilNextRun = nextRun - now;

        console.log(`[ZAMANLAYICI] Sonraki Otomatik Yedekleme: ${nextRun.toLocaleString('tr-TR')} (${Math.floor(timeUntilNextRun / 1000 / 60)} dakika sonra)`);

        setTimeout(async () => {
            await createBackup();
            // Döngü
            scheduleDailyBackup();
        }, timeUntilNextRun);
    }

    async function createBackup() {
        try {
            const now = new Date();
            const timestamp = now.toISOString().replace(/[:.]/g, '-').slice(0, 19);
            const backupName = `database_backup_${timestamp}.sqlite`;
            const tempPath = path.join(BACKUP_DIR, `temp_${timestamp}.sqlite`); // Geçici dosya
            const finalPath = path.join(BACKUP_DIR, backupName);

            // 1. Önce GEÇİCİ dosyaya kopyala (Atomik işlem simülasyonu)
            fs.copyFileSync(DB_PATH, tempPath);

            // 2. Dosya bittikten sonra adını değiştir
            fs.renameSync(tempPath, finalPath);

            console.log(`[BACKUP] ✅ Veritabanı başarıyla yedeklendi: ${backupName}`);

            // Eski Yedekleri Temizle
            cleanOldBackups();

            return finalPath;
        } catch (error) {
            console.error('[BACKUP-ERROR] ❌ Yedekleme başarısız:', error);
            // Hata durumunda temp dosyası varsa sil
            try {
                const files = fs.readdirSync(BACKUP_DIR);
                for (const file of files) {
                    if (file.startsWith('temp_')) {
                        fs.unlinkSync(path.join(BACKUP_DIR, file));
                    }
                }
            } catch (cleanupError) { }

            return null;
        }
    }

    function cleanOldBackups() {
        try {
            const files = fs.readdirSync(BACKUP_DIR);
            const now = Date.now();
            const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;

            let deletedCount = 0;

            for (const file of files) {
                const filePath = path.join(BACKUP_DIR, file);
                const stats = fs.statSync(filePath);

                if (now - stats.mtimeMs > SEVEN_DAYS) {
                    fs.unlinkSync(filePath);
                    deletedCount++;
                    console.log(`[BACKUP-CLEAN] Eski yedek silindi: ${file}`);
                }
            }

            if (deletedCount > 0) {
                console.log(`[BACKUP-CLEAN] Toplam ${deletedCount} eski yedek temizlendi.`);
            }
        } catch (error) {
            console.error('[BACKUP-CLEAN-ERROR] Temizlik sırasında hata:', error);
        }
    }

    // İlk başlatma
    init();

    // Dışa Aktar (Manuel tetikleme için)
    return {
        createBackup
    };
};
