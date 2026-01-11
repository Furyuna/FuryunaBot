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

// Aktiflik Puanı Yönetimi (MANUEL)
function addActivityPoints(userId, amount) {
    const stmt = db.prepare('INSERT INTO users (user_id, activity_points) VALUES (?, ?) ON CONFLICT(user_id) DO UPDATE SET activity_points = activity_points + ?');
    stmt.run(userId, amount, amount);
}

function removeActivityPoints(userId, amount) {
    const stmt = db.prepare('UPDATE users SET activity_points = CASE WHEN activity_points - ? < 0 THEN 0 ELSE activity_points - ? END WHERE user_id = ?');
    stmt.run(amount, amount, userId);
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

// Aktiflik Puanlarını Çürüt (Decay) (YENİ - Koşullu)
// Sadece 'cutoffTimestamp'ten önce mesaj atmış (yani 24 saattir pasif) olanların puanını düşürür.
function decayActivity(rate, cutoffTimestamp) {
    // rate: 0.05 ise, kalacak oran 0.95'tir.
    const keepRate = 1.0 - rate;

    db.prepare(`
        UPDATE users 
        SET activity_points = CAST(activity_points * ? AS INTEGER) 
        WHERE last_message_turn < ? AND activity_points > 0
    `).run(keepRate, cutoffTimestamp);
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

// Aktiflik Sıralaması (Rütbe için)
function getActivityLeaderboard(limit = 10) {
    return db.prepare('SELECT * FROM users ORDER BY activity_points DESC LIMIT ?').all(limit);
}

// TÜM Kullanıcıları Getir (ID Listesi)
function getAllUserIds() {
    const rows = db.prepare('SELECT user_id FROM users').all();
    return rows.map(r => r.user_id);
}

// Kullanıcıyı Sil (Ban/Kick Temizliği için)
function deleteUser(userId) {
    db.prepare('DELETE FROM users WHERE user_id = ?').run(userId);
}

module.exports = {
    initDatabase,
    getUser,
    addXp,
    addActivityPoints,
    removeActivityPoints,
    decayActivity,
    setLevel,
    addMoney,
    updateCooldown,
    getLeaderboard,
    getActivityLeaderboard,
    getAllUserIds,
    deleteUser
};
