const { EmbedBuilder } = require('discord.js');
const config = require('../commands/etkinlik/wordGameConfig');
const db = require('../utils/database.js')._db; // Raw DB access

// Node 18+ native fetch kullanımı
const _fetch = global.fetch;

module.exports = async (client) => {
    console.log('[WORD-GAME-SYSTEM] Modül Yüklendi ve Hazır!');

    // --- OTO-BAŞLATMA VE AYARLAR ---
    const initGame = async () => {
        // 1. OTO-BAŞLATMA (Veritabanı Boşsa)
        try {
            const historyCount = db.prepare('SELECT COUNT(*) as count FROM word_game_history').get().count;

            if (historyCount === 0) {
                const channel = await client.channels.fetch(config.channelId).catch(() => null);

                if (channel) {
                    // Sadece veritabanı boşsa direkt mesaj at (Spam kontrolü iptal)
                    await channel.send("Furyuna");
                }
            }
        } catch (e) {
            console.error("[WORD-GAME-AUTOSTART] Hata:", e);
        }

        // 2. YAVAŞ MOD (5 Saniye)
        try {
            const channel = await client.channels.fetch(config.channelId).catch(() => null);
            if (channel && channel.rateLimitPerUser !== 5) {
                await channel.setRateLimitPerUser(5);
                console.log("[WORD-GAME-SYSTEM] Kanal yavaş modu 5 saniye olarak ayarlandı.");
            }
        } catch (e) {
            console.error("[WORD-GAME-SYSTEM] Yavaş mod hatası:", e);
        }
    };

    // Client hazırsa hemen yap, değilse bekle (TOKEN HATASI ÇÖZÜMÜ)
    if (client.isReady()) {
        initGame();
    } else {
        client.once('ready', () => initGame());
    }

    client.on('messageCreate', async (message) => {
        // 1. Temel Kontroller
        if (message.author.bot) return;

        // DEBUG: Kanal kontrolü
        if (!message.channel) {
            console.error('[WORD-GAME-ERROR] Mesajın kanalı tanımsız!', message);
            return;
        }

        if (message.channel.id === config.channelId) {
            console.log(`[WORD-GAME-DEBUG] Mesaj alındı: ${message.content} (Yazan: ${message.author.tag})`);
        } else {
            return;
        }

        // 2. Oyun Durumunu Çek
        const state = db.prepare('SELECT * FROM word_game_state WHERE id = 1').get();
        if (!state) return; // DB hatası

        // Sadece boşlukları temizle ve küçült
        const content = message.content.trim();
        if (content.startsWith('.')) return; // Sohbet modu (Bypass)

        let word = content.toLocaleLowerCase('tr-TR');



        // A. ÇOKLU KELİME KONTROLÜ
        // Oyun sadece tek kelime kabul eder. Boşluk varsa uyar.
        if (word.includes(' ')) {
            await message.delete().catch(() => { });
            const warning = await message.channel.send(`⚠️ Sadece **tek kelime** yazabilirsin! (Sohbet için başına "." koy) ${message.author}`);
            setTimeout(() => warning.delete().catch(() => { }), 3000);
            return;
        }

        // B. KENDİNE YAZMA KONTROLÜ (Üst üste oynama)
        // Sadece geçerli bir kelime formatındaysa uyar
        if (state.last_user_id === message.author.id) {
            await message.delete().catch(() => { });
            const warning = await message.channel.send(`⚠️ Üst üste oynayamazsın ${message.author}!`);
            setTimeout(() => warning.delete().catch(() => { }), 3000);
            return;
        }

        // C. UZUNLUK KONTROLÜ
        if (word.length < config.minWordLength) {
            await message.delete().catch(() => { });
            const warning = await message.channel.send(`⚠️ **Çok kısa!** En az ${config.minWordLength} harf olmalı ${message.author}.`);
            setTimeout(() => warning.delete().catch(() => { }), 3000);
            return;
        }

        let lastLetter = state.last_letter;
        if (lastLetter) {
            lastLetter = lastLetter.trim().toLocaleLowerCase('tr-TR');
        }

        // B. HARF KONTROLÜ (Doğru harfle başlıyor mu?)
        if (!word.startsWith(lastLetter)) {
            await message.delete().catch(() => { });
            console.log(`[WORD-GAME-MISMATCH] Kelime: '${word}' | Beklenen: '${lastLetter}' | CharCodes: ${word.charCodeAt(0)} vs ${lastLetter.charCodeAt(0)}`);
            const warning = await message.channel.send(`⚠️ "**${lastLetter.toUpperCase()}**" harfi ile başlaman lazım ${message.author}!`);
            setTimeout(() => warning.delete().catch(() => { }), 3000);
            return;
        }

        // C. TEKRAR KONTROLÜ (Bu turda kullanıldı mı?)
        const used = db.prepare('SELECT word FROM word_game_history WHERE word = ?').get(word);
        if (used) {
            await message.delete().catch(() => { });
            // Mesaj: ⚠️ Bu kelime yazılmış @[KULLANICI]!
            const warning = await message.channel.send(`⚠️ Bu kelime yazılmış ${message.author}!`);
            setTimeout(() => warning.delete().catch(() => { }), 3000);
            return;
        }

        // D. TDK DOĞRULAMA
        const isValid = await checkTDK(word);

        if (!isValid) {
            await message.delete().catch(() => { });
            // Mesaj: ❌ Böyle bir kelime yok @[KULLANICI]!
            const warning = await message.channel.send(`❌ Böyle bir kelime yok ${message.author}!`);
            setTimeout(() => warning.delete().catch(() => { }), 3000);
            return;
        }

        // --- GEÇERLİ HAMLE ---

        // A. Veritabanına Kaydet
        db.prepare('INSERT INTO word_game_history (word, user_id, timestamp) VALUES (?, ?, ?)').run(word, message.author.id, Date.now());

        // B. Durumu Güncelle
        // Yeni son harf: Eğer son harf 'ğ' ise bir önceki harfi alalım mı? TDK kuralı genelde ğ ile biten kelimelerde dönüştürmez ama oyun tıkanabilir.
        // Standart kural: Olduğu gibi al.
        let newLastLetter = word.slice(-1);

        db.prepare(`
            UPDATE word_game_state 
            SET last_word = ?, 
                last_user_id = ?, 
                last_letter = ? 
            WHERE id = 1
        `).run(word, message.author.id, newLastLetter);

        // C. Puan Ver (Aktiflik Puanı + Coin?)
        // Coin sistemi henüz DB'de yoksa sadece activity_points
        try {
            const dbUtils = require('../utils/database.js');
            dbUtils.addActivityPoints(message.author.id, config.pointsPerWord);
        } catch (e) { console.error("Puan ekleme hatası", e); }

        // D. Tepki Ver
        message.react('✅');
    });

    async function checkTDK(word) {
        try {
            // TDK API SORGUSU (Her seferinde taze sorgu)
            const url = `https://sozluk.gov.tr/gts?ara=${encodeURIComponent(word)}`;
            const response = await _fetch(url);
            const data = await response.json();

            if (Array.isArray(data) && data.length > 0) {
                return true;
            }

            return false;

        } catch (e) {
            console.error("TDK API Hatası:", e);
            return false;
        }
    }
};
