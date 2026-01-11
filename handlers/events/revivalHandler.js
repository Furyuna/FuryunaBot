const { EmbedBuilder } = require('discord.js');
const db = require('../../utils/database.js');
const config = require('../../commands/etkinlik/config.js').chatRevival;
const fs = require('fs');
const path = require('path');

// Durum dosyasının yolu
const STATE_FILE = path.join(__dirname, 'revivalState.json');

// Son mesaj zamanını tutmak için değişken
let lastMessageTime = Date.now();
let isEventActive = false; // Aynı anda birden fazla etkinlik olmasın

// --- DURUM YÖNETİMİ (Persistent State) ---
function loadState() {
    try {
        if (fs.existsSync(STATE_FILE)) {
            return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
        }
    } catch (e) {
        console.error('[REVIVAL] State yüklenirken hata:', e);
    }
    // Varsayılan
    return { nextEventType: 0, nextQuizIndex: 0, nextDropIndex: 0 };
}

function saveState(state) {
    try {
        fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
    } catch (e) {
        console.error('[REVIVAL] State kaydedilirken hata:', e);
    }
}

// Durumu yükle
let state = loadState();

module.exports = {
    /**
     * Mesaj atıldığında bu fonksiyon çağrılmalı
     */
    updateTimestamp: () => {
        // Eğer etkinlik o kanalda ise zamanı güncelle
        lastMessageTime = Date.now();
    },

    /**
     * Bot başladığında bu fonksiyon çağrılmalı
     * @param {import('discord.js').Client} client 
     */
    init: (client) => {
        if (!config.enabled) return;

        console.log('[REVIVAL] Sohbet Canlandırıcı Aktif! (Sıralı Mod)');

        // Belirli aralıklarla kontrol et
        setInterval(async () => {
            // Etkinlik varsa işlem yapma
            if (isEventActive) return;

            const now = Date.now();
            const timeDiff = now - lastMessageTime;

            // Eğer eşik değerden fazla süre geçtiyse ve bot o kanala erişebiliyorsa
            if (timeDiff >= config.inactivityThreshold) {
                const channel = client.channels.cache.get(config.channelId);
                if (channel && channel.isTextBased()) {
                    await triggerEvent(channel);
                }
            }
        }, config.checkInterval);
    },

    /**
     * Manuel Olarak Etkinlik Başlat
     * @param {import('discord.js').Client} client 
     * @param {string} type 'quiz', 'math', 'drop'
     */
    forceEvent: async (client, type) => {
        const channel = client.channels.cache.get(config.channelId);
        if (channel) {
            await triggerEvent(channel, type);
            return true;
        }
        return false;
    }
};

/**
 * Sıradaki etkinliği başlatır (Rotation: Quiz -> Math -> Drop)
 * @param {import('discord.js').TextChannel} channel 
 * @param {string|null} forcedType Eğer belirtilirse sıradaki yerine bu türü başlatır
 */
async function triggerEvent(channel, forcedType = null) {
    // Eğer zaten aktifse ve MANUEL DEĞİLSE başlatma (Manuel ise zorla)
    if (isEventActive && !forcedType) return;

    isEventActive = true;
    lastMessageTime = Date.now(); // Tekrar tetiklenmesin diye zamanı güncelle

    let type = forcedType;

    // Eğer manuel tür yoksa sıradakini seç
    if (!type) {
        // Sıralı Etkinlik Seçimi
        const eventTypes = ['quiz', 'math', 'drop'];

        // İndeks Güvenliği (Eğer saved state bozuksa veya tür sayısı değiştiyse)
        if (state.nextEventType >= eventTypes.length) state.nextEventType = 0;

        type = eventTypes[state.nextEventType];

        // Sayacı ilerlet (Wrap around)
        state.nextEventType++;
        if (state.nextEventType >= eventTypes.length) state.nextEventType = 0;

        saveState(state);
    }

    console.log(`[REVIVAL] Etkinlik Tetiklendi: ${type} ${forcedType ? '(MANUEL)' : `(Sıra: ${state.nextEventType})`}`);

    try {
        switch (type) {
            case 'quiz': await startQuiz(channel); break;
            case 'math': await startMath(channel); break;
            case 'drop': await startDrop(channel); break;
        }
    } catch (error) {
        console.error('[REVIVAL] Hata:', error);
        isEventActive = false;
    }
}

// --- ORTAK CEVAP BEKLEME FONKSİYONU ---
async function waitForAnswer(channel, sentMessage, checkFn, rewardCfg, correctAnswerDisplay, timeoutMsg = config.messages.timeout) {
    // Eğer eventDuration 0 ise SÜRE YOK (Sonsuz), değilse configdeki süre
    const collectorOptions = {
        filter: m => !m.author.bot
    };

    if (config.eventDuration > 0) {
        collectorOptions.time = config.eventDuration;
    }

    const collector = channel.createMessageCollector(collectorOptions);

    let idleTimer = null;

    collector.on('collect', async (m) => {
        // 1. Cevap Kontrolü
        if (checkFn(m.content)) {
            collector.stop('won'); // Kazanıldı!

            // Timer varsa temizle
            // Timer varsa temizle
            if (idleTimer) clearTimeout(idleTimer);

            // Ödül Hesaplama (Aralık veya Sabit)
            const getRandom = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

            const finalReward = (rewardCfg.minReward && rewardCfg.maxReward)
                ? getRandom(rewardCfg.minReward, rewardCfg.maxReward)
                : (rewardCfg.reward || 0);

            const finalXp = (rewardCfg.minXp && rewardCfg.maxXp)
                ? getRandom(rewardCfg.minXp, rewardCfg.maxXp)
                : (rewardCfg.xp || 0);

            // Veritabanı İşlemleri
            db.addMoney(m.author.id, finalReward);
            db.addXp(m.author.id, finalXp);
            db.addActivityPoints(m.author.id, rewardCfg.activity);

            // Mesaj Formatlama
            const winMsg = config.messages.winner
                .replace('{user}', m.author)
                .replace('{reward}', finalReward)
                .replace('{xp}', finalXp);

            await m.reply(winMsg);
            return;
        }

        // 2. Yanlış Cevap (Normal Sohbet) -> Sayaç Başlat/Sıfırla
        // Kullanıcı mantığı: "Bot harici kim yazmaya başlarsa o zaman timeout başlasın (30s)"
        if (idleTimer) clearTimeout(idleTimer);

        idleTimer = setTimeout(() => {
            collector.stop('revived_timeout');
        }, config.activeTimeout); // Config'den gelen süre (Sohbet başladıktan sonra)
    });

    collector.on('end', async (collected, reason) => {
        if (reason === 'won') {
            // Zaten collect içinde halledildi
        } else {
            // Timeout (Süre doldu veya Sohbet başladı ama kimse bilemedi)
            if (idleTimer) clearTimeout(idleTimer);

            const answerText = correctAnswerDisplay ? `\n*(Cevap: ${correctAnswerDisplay})*` : '';
            await sentMessage.reply(`${timeoutMsg}${answerText}`);

            console.log('[REVIVAL] Etkinlik tamamlandı (Kimse bilemedi), yeni döngü bekleniyor.');
        }

        isEventActive = false;
        lastMessageTime = Date.now();
    });
}

async function startQuiz(channel) {
    // Liste güvenliği
    if (config.quiz.questions.length === 0) return;

    // İndeks Güvenliği (Liste küçüldüyse veya sınır aşıldıysa başa dön)
    if (state.nextQuizIndex >= config.quiz.questions.length) state.nextQuizIndex = 0;

    // Sıralı Soru Seçimi
    const qData = config.quiz.questions[state.nextQuizIndex];

    // İndeksi ilerlet ve kaydet
    state.nextQuizIndex++;
    if (state.nextQuizIndex >= config.quiz.questions.length) state.nextQuizIndex = 0;

    saveState(state);

    // Format: 🧠 BİLGİ YARIŞMASI \n [Soru] \n @Rol
    const ping = config.pingRoleId ? `\n<@&${config.pingRoleId}>` : '';
    const content = `**${config.messages.quizTitle}**\n${qData.q}${ping}`;
    const sentMessage = await channel.send({ content: content });

    // Cevap kontrol fonksiyonu (Sentence Match)
    const checkFn = (text) => qData.a.some(answer => text.toLowerCase().includes(answer));

    await waitForAnswer(channel, sentMessage, checkFn, config.quiz, qData.a[0]);
}

async function startMath(channel) {
    // Matematik işlemi rastgele kalabilir, çünkü milyonlarca kombinasyon var.
    const n1 = Math.floor(Math.random() * (config.math.max - config.math.min)) + config.math.min;
    const n2 = Math.floor(Math.random() * (config.math.max - config.math.min)) + config.math.min;
    const op = config.math.operations[Math.floor(Math.random() * config.math.operations.length)];

    let answer;
    if (op === '+') answer = n1 + n2;
    else if (op === '-') answer = n1 - n2;
    else if (op === '*') answer = n1 * n2;

    // Format: 🧩 ZEKA YARIŞMASI \n [İşlem] işleminin cevabı kaçtır? \n @Rol
    const ping = config.pingRoleId ? `\n<@&${config.pingRoleId}>` : '';
    const content = `**${config.messages.mathTitle}**\n${n1} ${op} ${n2} işleminin cevabı kaçtır?${ping}`;
    const sentMessage = await channel.send({ content: content });

    // Cevap kontrol fonksiyonu (Regex Number Match)
    const regex = new RegExp(`(^|\\D)${answer}(\\D|$)`);
    const checkFn = (text) => regex.test(text);

    await waitForAnswer(channel, sentMessage, checkFn, config.math, answer);
}

async function startDrop(channel) {
    // Liste güvenliği
    if (config.drop.words.length === 0) return;

    // İndeks Güvenliği
    if (state.nextDropIndex >= config.drop.words.length) state.nextDropIndex = 0;

    // Sıralı Kelime Seçimi
    const word = config.drop.words[state.nextDropIndex];

    // İndeksi ilerlet ve kaydet
    state.nextDropIndex++;
    if (state.nextDropIndex >= config.drop.words.length) state.nextDropIndex = 0;

    saveState(state);

    // Drop ödülü o an hesaplanır
    const rewardCoins = Math.floor(Math.random() * (config.drop.maxReward - config.drop.minReward)) + config.drop.minReward;

    const rewardCfg = {
        reward: rewardCoins,
        xp: config.drop.xp,
        activity: config.drop.activity
    };

    // Format: ⚡ HIZ YARIŞMASI \n ***"Kelime"*** kelimesini sohbete yaz! \n @Rol
    const ping = config.pingRoleId ? `\n<@&${config.pingRoleId}>` : '';
    const content = `**${config.messages.dropTitle}**\n***"${word}"*** cümlesini sohbete yaz!${ping}`;
    const sentMessage = await channel.send({ content: content });

    // Cevap kontrol fonksiyonu (Regex Word Match)
    const regex = new RegExp(`(^|\\s|[.,!?])${word}($|\\s|[.,!?])`, 'i');
    const checkFn = (text) => regex.test(text);

    // Drop için cevap göstermeye gerek yok (Zaten ekranda yazı) -> null gönderiyoruz
    await waitForAnswer(channel, sentMessage, checkFn, rewardCfg, null, config.messages.timeoutDrop);
}
