require('dotenv').config();
const { Client, GatewayIntentBits, Collection, Events } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
const globalConfig = require('./config.json');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

client.commands = new Collection();

// --- HANDLER YÜKLE ---
// --- HANDLER YÜKLE ---
require('./handlers/commandHandler')(client);
require('./handlers/eventHandler')(client);
require('./handlers/decaySystem')(client); // Çürüme sistemi
// --- GÜNLÜK BACKUP SİSTEMİ (YENİ) ---
const backupSystem = require('./handlers/backupSystem')(client);
client.backupSystem = backupSystem; // Manuel erişim için client'a ekle
require('./handlers/autoMessages')(client); // Oto-Mesaj sistemi (YENİ)
const revivalHandler = require('./handlers/events/revivalHandler'); // Sohbet Canlandırıcı (YENİ)
revivalHandler.init(client);
require('./handlers/wordGameHandler')(client); // Kelime Oyunu (YENİ)
// require('./handlers/events/morningHandler').init(client); // Günaydın Sistemi (ESKİ - İPTAL)
require('./handlers/events/securityHandler').init(client); // Güvenlik Sistemi (Link/Medya Koruması)
require('./handlers/memberCountChannel')(client); // Üye Sayısı Kanalı (Otomatik isim güncelleme)
// require('./handlers/events/gifWelcomeHandler').execute(member); // Eski (İptal)
// Yeni Resimli Hoş Geldin Sistemi (Otomatik Event Handler tarafından yüklenir ama manuel init gerekebilir)
// Event Handler zaten 'events' klasöründeki dosyaları yüklüyor mu?
// handlers/eventHandler.js dosyasına bakmak lazım. Eğer otomatik yüklüyorsa buraya eklemeye gerek yok.

// --- VERİTABANI BAŞLAT ---
require('./utils/database').initDatabase();

// --- SLASH KOMUT HANDLER ( / ) & SAĞ TIK ---
// Event handler events/interactionCreate.js dosyasında yönetiliyor

// --- PREFIX KOMUT HANDLER ( ! . ? ) ---
client.on(Events.MessageCreate, async message => {
    if (message.author.bot) return;

    // --- SOHBET CANLANDIRICI ZAMANLAYICI GÜNCELLEME ---
    const revivalConfig = require('./commands/etkinlik/config.js').chatRevival;
    if (message.channel && message.channel.id === revivalConfig.channelId && !message.author.bot) {
        require('./handlers/events/revivalHandler').updateTimestamp();
    }

    // 1. Prefix Kontrolü (Liste Desteği)
    let usedPrefix = null;
    const prefixes = Array.isArray(globalConfig.prefix) ? globalConfig.prefix : [globalConfig.prefix];

    for (const p of prefixes) {
        if (message.content.startsWith(p)) {
            usedPrefix = p;
            break;
        }
    }

    if (!usedPrefix) return;

    const args = message.content.slice(usedPrefix.length).trim().split(/ +/);
    const firstWord = args.shift().toLowerCase();
    let command = null;

    // 1. Önce İKİ KELİMELİ kombinasyonu kontrol et (Öncelik uzun olanda)
    // Örn: "!kayıt sil" yazıldığında "kayıt" komutunu bulmadan önce "kayıt sil" alias'ını ara.
    if (args.length > 0) {
        const potentialDoubleName = `${firstWord} ${args[0]}`.toLowerCase();
        command = client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(potentialDoubleName));
        if (command) {
            args.shift(); // İkinci kelimeyi de argümanlardan sil (artık komutun parçası)
        }
    }

    // 2. Bulunamadıysa TEK KELİMELİ kontrol et
    if (!command) {
        command = client.commands.get(firstWord) ||
            client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(firstWord));
    }

    if (!command || !command.executePrefix) return;

    try {
        await command.executePrefix(message, args);
    } catch (error) {
        console.error(error);
        message.reply('Komut çalıştırılırken hata oluştu!');
    }
});



client.on('error', error => {
    console.error('[DISCORD CLIENT ERROR]', error);
});

process.on('unhandledRejection', error => {
    console.error('[UNHANDLED REJECTION]', error);
});

process.on('uncaughtException', error => {
    console.error('[UNCAUGHT EXCEPTION]', error);
});

client.login(process.env.BOT_TOKEN);
