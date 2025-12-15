const Database = require('better-sqlite3');
const path = require('path');

// Veritabanı dosyasını oluştur veya aç
const db = new Database(path.join(__dirname, '../database.sqlite'));

// Tabloları Başlat
function initDatabase() {
    // Kullanıcılar Tablosu: ID, XP, Seviye, Para, SonMesajZamanı, AktiflikPuanı
    db.prepare(`
        CREATE TABLE IF NOT EXISTS users (
            user_id TEXT PRIMARY KEY,
            xp INTEGER DEFAULT 0,
            level INTEGER DEFAULT 0,
            money INTEGER DEFAULT 0,
            last_message_turn INTEGER DEFAULT 0,
            activity_points INTEGER DEFAULT 0
        )
    `).run();

    // Eğer tablo eski ise 'activity_points' sütununu eklemeye çalış (Hata verirse zaten vardır)
    try {
        db.prepare('ALTER TABLE users ADD COLUMN activity_points INTEGER DEFAULT 0').run();
    } catch (err) {
        // Sütun zaten varsa buraya düşer, sorun yok.
    }

    console.log("[VERİTABANI] Başlatıldı ve tablolar kontrol edildi.");
}

// Kullanıcıyı Getir (Yoksa oluşturur)
function getUser(userId) {
    let user = db.prepare('SELECT * FROM users WHERE user_id = ?').get(userId);
    if (!user) {
        db.prepare('INSERT INTO users (user_id) VALUES (?)').run(userId);
        user = { user_id: userId, xp: 0, level: 0, money: 0, last_message_turn: 0, activity_points: 0 };
    }
    return user;
}

// XP Ekle
function addXp(userId, amount) {
    db.prepare('UPDATE users SET xp = xp + ? WHERE user_id = ?').run(amount, userId);
}

// Aktiflik Puanı Ekle (YENİ)
function addActivity(userId, amount) {
    db.prepare('UPDATE users SET activity_points = activity_points + ? WHERE user_id = ?').run(amount, userId);
}

// Aktiflik Puanlarını Çürüt (Decay) (YENİ)
// Herkesin puanını belli bir oranda düşürür (Örn: 0.95 ile çarpar)
function decayActivity(rate) {
    // rate: 0.05 ise, kalacak oran 0.95'tir.
    const keepRate = 1.0 - rate;
    db.prepare('UPDATE users SET activity_points = CAST(activity_points * ? AS INTEGER)').run(keepRate);
}

// Seviye Güncelle
function setLevel(userId, newLevel) {
    db.prepare('UPDATE users SET level = ? WHERE user_id = ?').run(newLevel, userId);
}

// Para Ekle/Çıkar
function addMoney(userId, amount) {
    db.prepare('UPDATE users SET money = money + ? WHERE user_id = ?').run(amount, userId);
}

// Son Mesaj Zamanını Güncelle
function updateCooldown(userId, timestamp) {
    db.prepare('UPDATE users SET last_message_turn = ? WHERE user_id = ?').run(timestamp, userId);
}

// Sıralamayı Getir (İlk N kişi)
function getLeaderboard(limit = 10) {
    return db.prepare('SELECT * FROM users ORDER BY level DESC, xp DESC LIMIT ?').all(limit);
}

module.exports = {
    initDatabase,
    getUser,
    addXp,
    addActivity,
    decayActivity,
    setLevel,
    addMoney,
    updateCooldown,
    getLeaderboard
};
