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

// --- HANDLER YÜKLEME ---
require('./handlers/commandHandler')(client);
require('./handlers/eventHandler')(client);

// --- VERİTABANI BAŞLAT ---
require('./utils/database').initDatabase();

// --- SLASH KOMUT HANDLER ( / ) & SAĞ TIK ---
// Event handler events/interactionCreate.js dosyasında yönetiliyor

// --- PREFIX KOMUT HANDLER ( ! . ? ) ---
client.on(Events.MessageCreate, async message => {
    if (message.author.bot) return;

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

client.login(process.env.BOT_TOKEN);
