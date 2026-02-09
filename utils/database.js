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

    // BUMP SİSTEMİ İÇİN YENİ TABLOLAR VE FONKSİYONLAR

    // Bump Ayarları Tablosu
    db.prepare(`
        CREATE TABLE IF NOT EXISTS bump_settings (
            user_id TEXT PRIMARY KEY,
            ping_on_bump_action INTEGER DEFAULT 1,  -- 0: Hayır, 1: Evet
            infinite_ping INTEGER DEFAULT 0,        -- 0: Hayır, 1: Evet (Sürekli Hatırlat listesi)
            nag_limit INTEGER DEFAULT 0             -- 0: Kapalı, N: N kere daha dürt, -1: Sonsuz
        )
    `).run();

    // Sütun güncellemesi için try-catch (Eski DB uyumluluğu)
    try {
        db.prepare('ALTER TABLE bump_settings ADD COLUMN nag_limit INTEGER DEFAULT 0').run();
    } catch (e) { }

    // Bump Hatırlatma Kuyruğu
    // Type: 1 (Tek Seferlik - "Beni Bu Sefer Hatırlat")
    db.prepare(`
        CREATE TABLE IF NOT EXISTS bump_queue (
            user_id TEXT PRIMARY KEY,
            timestamp INTEGER
        )
    `).run();

    // Bump Global Durumu (Kalıcılık İçin)
    db.prepare(`
        CREATE TABLE IF NOT EXISTS bump_global_state (
            id TEXT PRIMARY KEY, -- 'global'
            next_bump_timestamp INTEGER,
            last_bumper_id TEXT,
            last_message_id TEXT,
            channel_id TEXT,
            reminder_sent INTEGER DEFAULT 0 -- 0: Hayır, 1: Evet
        )
    `).run();

    // Sütun Ekleme (Migration - Eski DB Uyumluluğu)
    try {
        db.prepare('ALTER TABLE bump_global_state ADD COLUMN reminder_sent INTEGER DEFAULT 0').run();
    } catch (e) { }

    console.log("[VERİTABANI] Başlatıldı ve tablolar kontrol edildi.");
}

// Aktiflik Puanı Yönetimi (MANUEL)
// maxPoints varsayılan olarak 1500 (Hard limit)
function addActivityPoints(userId, amount, maxPoints = 1500) {
    // Yeni puan, maxPoints'i geçemez
    const stmt = db.prepare(`
        INSERT INTO users (user_id, activity_points) VALUES (?, MIN(?, ?)) 
        ON CONFLICT(user_id) 
        DO UPDATE SET activity_points = MIN(activity_points + ?, ?)
    `);
    stmt.run(userId, amount, maxPoints, amount, maxPoints);
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

// BUMP AYARLARI FONKSİYONLARI
function getBumpSettings(userId) {
    let settings = db.prepare('SELECT * FROM bump_settings WHERE user_id = ?').get(userId);
    if (!settings) {
        // Varsayılan Ayarlar
        db.prepare('INSERT INTO bump_settings (user_id) VALUES (?)').run(userId);
        settings = { user_id: userId, ping_on_bump_action: 1, infinite_ping: 0, nag_limit: 0 };
    }
    return settings;
}

function setBumpSetting(userId, column, value) {
    // column: 'ping_on_bump_action', 'infinite_ping', 'nag_limit'
    const validColumns = ['ping_on_bump_action', 'infinite_ping', 'nag_limit'];
    if (!validColumns.includes(column)) throw new Error("Invalid column name");

    // Önce kullanıcı var mı bak, yoksa oluştur
    getBumpSettings(userId);

    db.prepare(`UPDATE bump_settings SET ${column} = ? WHERE user_id = ?`).run(value, userId);
}

// KUYRUK FONKSİYONLARI
function addToBumpQueue(userId) {
    db.prepare('INSERT OR IGNORE INTO bump_queue (user_id, timestamp) VALUES (?, ?)').run(userId, Date.now());
}

function removeFromBumpQueue(userId) {
    db.prepare('DELETE FROM bump_queue WHERE user_id = ?').run(userId);
}

function getBumpQueue() {
    return db.prepare('SELECT user_id FROM bump_queue').all().map(r => r.user_id);
}

function clearBumpQueue() {
    db.prepare('DELETE FROM bump_queue').run();
}

function getInfinitePingers() {
    return db.prepare('SELECT * FROM bump_settings WHERE infinite_ping = 1 OR nag_limit != 0').all();
}

// BUMP GLOBAL DURUM FONKSİYONLARI
function setBumpGlobalState(timestamp, lastBumperId, lastMessageId, channelId, reminderSent = 0) {
    db.prepare(`
        INSERT INTO bump_global_state (id, next_bump_timestamp, last_bumper_id, last_message_id, channel_id, reminder_sent)
        VALUES ('global', ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
            next_bump_timestamp = excluded.next_bump_timestamp,
            last_bumper_id = excluded.last_bumper_id,
            last_message_id = excluded.last_message_id,
            channel_id = excluded.channel_id,
            reminder_sent = excluded.reminder_sent
    `).run(timestamp, lastBumperId, lastMessageId, channelId, reminderSent);
}

function markReminderSent() {
    db.prepare("UPDATE bump_global_state SET reminder_sent = 1 WHERE id = 'global'").run();
}

function getBumpGlobalState() {
    return db.prepare("SELECT * FROM bump_global_state WHERE id = 'global'").get();
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
    deleteUser,
    // Bump Exports
    getBumpSettings,
    setBumpSetting,
    addToBumpQueue,
    removeFromBumpQueue,
    getBumpQueue,
    clearBumpQueue,
    getBumpQueue,
    clearBumpQueue,
    getInfinitePingers,
    // Global Persistence
    // Global Persistence
    setBumpGlobalState,
    getBumpGlobalState,
    markReminderSent
};
