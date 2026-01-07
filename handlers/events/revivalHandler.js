const { EmbedBuilder } = require('discord.js');
const db = require('../../utils/database.js');
const config = require('../../commands/etkinlik/config.js').chatRevival;

// Son mesaj zamanını tutmak için değişken
let lastMessageTime = Date.now();
let isEventActive = false; // Aynı anda birden fazla etkinlik olmasın

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

        console.log('[REVIVAL] Sohbet Canlandırıcı Aktif!');

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
    }
};

/**
 * Rastgele bir etkinlik başlatır
 * @param {import('discord.js').TextChannel} channel 
 */
async function triggerEvent(channel) {
    isEventActive = true;
    lastMessageTime = Date.now(); // Tekrar tetiklenmesin diye zamanı güncelle

    // Ağırlıklı rastgele seçim
    const rand = Math.random() * 100;
    let type = 'quiz';

    const w = config.weights;
    if (rand < w.quiz) type = 'quiz';
    else if (rand < w.quiz + w.math) type = 'math';
    else type = 'drop';

    console.log(`[REVIVAL] Etkinlik Tetiklendi: ${type}`);

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
async function waitForAnswer(channel, sentMessage, checkFn, rewardCfg, correctAnswerDisplay) {
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
            if (idleTimer) clearTimeout(idleTimer);

            // Ödül İşlemleri
            db.addMoney(m.author.id, rewardCfg.reward);
            db.addXp(m.author.id, rewardCfg.xp);
            db.addActivityPoints(m.author.id, rewardCfg.activity);

            const winMsg = config.messages.winner
                .replace('{user}', m.author)
                .replace('{reward}', rewardCfg.reward)
                .replace('{xp}', rewardCfg.xp);

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

            await sentMessage.reply(`${config.messages.timeout}\n*(Cevap: ${correctAnswerDisplay})*`);

            console.log('[REVIVAL] Etkinlik tamamlandı (Kimse bilemedi), yeni döngü bekleniyor.');
        }

        isEventActive = false;
        lastMessageTime = Date.now();
    });
}

async function startQuiz(channel) {
    const qData = config.quiz.questions[Math.floor(Math.random() * config.quiz.questions.length)];

    // Format: 🧠 BİLGİ YARIŞMASI \n [Soru]
    const content = `**${config.messages.quizTitle}**\n${qData.q}`;
    const sentMessage = await channel.send({ content: content });

    // Cevap kontrol fonksiyonu (Sentence Match)
    const checkFn = (text) => qData.a.some(answer => text.toLowerCase().includes(answer));

    await waitForAnswer(channel, sentMessage, checkFn, config.quiz, qData.a[0]);
}

async function startMath(channel) {
    const n1 = Math.floor(Math.random() * (config.math.max - config.math.min)) + config.math.min;
    const n2 = Math.floor(Math.random() * (config.math.max - config.math.min)) + config.math.min;
    const op = config.math.operations[Math.floor(Math.random() * config.math.operations.length)];

    let answer;
    if (op === '+') answer = n1 + n2;
    else if (op === '-') answer = n1 - n2;
    else if (op === '*') answer = n1 * n2;

    // Format: 🧩 ZEKA YARIŞMASI \n [İşlem] işleminin cevabı kaçtır?
    const content = `**${config.messages.mathTitle}**\n${n1} ${op} ${n2} işleminin cevabı kaçtır?`;
    const sentMessage = await channel.send({ content: content });

    // Cevap kontrol fonksiyonu (Regex Number Match)
    const regex = new RegExp(`(^|\\D)${answer}(\\D|$)`);
    const checkFn = (text) => regex.test(text);

    await waitForAnswer(channel, sentMessage, checkFn, config.math, answer);
}

async function startDrop(channel) {
    const word = config.drop.words[Math.floor(Math.random() * config.drop.words.length)];
    // Drop ödülü o an hesaplanır, config'den okuyamayız. O yüzden geçici bir obje yapıyoruz.
    const rewardCoins = Math.floor(Math.random() * (config.drop.maxReward - config.drop.minReward)) + config.drop.minReward;

    const rewardCfg = {
        reward: rewardCoins,
        xp: config.drop.xp,
        activity: config.drop.activity
    };

    // Format: ⚡ HIZ YARIŞMASI \n [Kelime] kelimesini sohbete yaz!
    const content = `**${config.messages.dropTitle}**\n**"${word}"** kelimesini sohbete yaz!`;
    const sentMessage = await channel.send({ content: content });

    // Cevap kontrol fonksiyonu (Regex Word Match)
    const regex = new RegExp(`(^|\\s|[.,!?])${word}($|\\s|[.,!?])`, 'i');
    const checkFn = (text) => regex.test(text);

    await waitForAnswer(channel, sentMessage, checkFn, rewardCfg, word);
}
