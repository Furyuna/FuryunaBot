const Database = require('better-sqlite3');
const path = require('path');

// Veritabanına doğrudan bağlan
const db = new Database(path.join(__dirname, 'database.sqlite'));

try {
    console.log("🛠️ Aktivite Puanlarını 1500'e Sabitleme Başladı...");

    // 1500'den fazla puanı olanları bul ve güncelle
    const stmt = db.prepare("UPDATE users SET activity_points = 1500 WHERE activity_points > 1500");
    const result = stmt.run();

    console.log(`✅ İşlem Tamamlandı!`);
    console.log(`📊 Toplam Değişen Kullanıcı: ${result.changes}`);

} catch (error) {
    console.error("Hata:", error);
}
