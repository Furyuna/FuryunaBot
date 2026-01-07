const { EmbedBuilder } = require('discord.js');
const db = require('../../utils/database.js');
const config = require('../../commands/etkinlik/config.js').chatRevival;

// Son mesaj zamanını tutmak için değişken
let lastMessageTime = Date.now();
let isEventActive = false; // Aynı anda birden fazla etkinlik olmasın
let isPaused = false; // Kimse cevap vermezse sistemi duraklat (Spam önleme)

module.exports = {
    /**
     * Mesaj atıldığında bu fonksiyon çağrılmalı
     */
    updateTimestamp: () => {
        // Eğer etkinlik o kanalda ise zamanı güncelle
        lastMessageTime = Date.now();

        // Eğer sistem duraklatıldıysa (kimse cevap vermediği için uyuduysa) uyandır
        if (isPaused) {
            isPaused = false;
            console.log('[REVIVAL] Sistem tekrar uyandı! (Kullanıcı mesajı tespit edildi) ☀️');
        }
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
            // Etkinlik varsa veya sistem duraklatıldıysa (kimse yoksa) işlem yapma
            if (isEventActive || isPaused) return;

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

async function startQuiz(channel) {
    const qData = config.quiz.questions[Math.floor(Math.random() * config.quiz.questions.length)];

    // Format: 🧠 BİLGİ YARIŞMASI \n [Soru]
    const content = `**${config.messages.quizTitle}**\n${qData.q}`;

    const sentMessage = await channel.send({ content: content });

    // Relaxed matching: Check if message content includes the answer
    const filter = m => !m.author.bot && qData.a.some(answer => m.content.toLowerCase().includes(answer));
    try {
        const collected = await channel.awaitMessages({ filter, max: 1, time: config.eventDuration, errors: ['time'] });
        const winner = collected.first();

        db.addMoney(winner.author.id, config.quiz.reward);

        // Kazanan mesajı
        const winMsg = config.messages.winner
            .replace('{user}', winner.author)
            .replace('{reward}', config.quiz.reward);

        // Kazanana yanıt ver
        await winner.reply(`${winMsg}\n*(Doğru cevap: ${qData.a[0]})*`);
    } catch (e) {
        // Timeout: Kendi mesajına yanıt ver
        await sentMessage.reply(`${config.messages.timeout}\n*(Doğru cevap: ${qData.a[0]})*`);
        // Kimse bilmedi, sistemi duraklat
        isPaused = true;
        console.log('[REVIVAL] Kimse cevap vermedi. Sistem duraklatıldı. 💤');
    }

    isEventActive = false;
    lastMessageTime = Date.now();
}

async function startMath(channel) {
    const n1 = Math.floor(Math.random() * (config.math.max - config.math.min)) + config.math.min;
    const n2 = Math.floor(Math.random() * (config.math.max - config.math.min)) + config.math.min;
    const op = config.math.operations[Math.floor(Math.random() * config.math.operations.length)];

    let answer;
    if (op === '+') answer = n1 + n2;
    else if (op === '-') answer = n1 - n2;
    else if (op === '*') answer = n1 * n2;

    // Format: 🧠 BİLGİ YARIŞMASI \n [İşlem] işleminin cevabı kaçtır?
    const content = `**${config.messages.mathTitle}**\n${n1} ${op} ${n2} işleminin cevabı kaçtır?`;

    const sentMessage = await channel.send({ content: content });

    // Regex matching: Check for whole number match (prevent 14 matching 4)
    const regex = new RegExp(`(^|\\D)${answer}(\\D|$)`);
    const filter = m => !m.author.bot && regex.test(m.content);

    try {
        const collected = await channel.awaitMessages({ filter, max: 1, time: config.eventDuration, errors: ['time'] });
        const winner = collected.first();

        db.addMoney(winner.author.id, config.math.reward);

        // Kazanan mesajı
        const winMsg = config.messages.winner
            .replace('{user}', winner.author)
            .replace('{reward}', config.math.reward);

        // Kazanana yanıt ver
        await winner.reply(`${winMsg}\n*(Cevap: ${answer})*`);
    } catch (e) {
        // Timeout: Kendi mesajına yanıt ver
        await sentMessage.reply(`${config.messages.timeout}\n*(Cevap: ${answer})*`);
        // Kimse bilmedi, sistemi duraklat
        isPaused = true;
        console.log('[REVIVAL] Kimse cevap vermedi. Sistem duraklatıldı. 💤');
    }

    isEventActive = false;
    lastMessageTime = Date.now();
}

async function startDrop(channel) {
    const word = config.drop.words[Math.floor(Math.random() * config.drop.words.length)];
    const reward = Math.floor(Math.random() * (config.drop.maxReward - config.drop.minReward)) + config.drop.minReward;

    // Format: ⚡ HIZ YARIŞMASI \n [Kelime] kelimesini sohbete yaz!
    const content = `**${config.messages.dropTitle}**\n**"${word}"** kelimesini sohbete yaz!`;

    const sentMessage = await channel.send({ content: content });

    // Regex matching: Check for whole word match
    const regex = new RegExp(`(^|\\s|[.,!?])${word}($|\\s|[.,!?])`, 'i');
    const filter = m => !m.author.bot && regex.test(m.content);

    try {
        const collected = await channel.awaitMessages({ filter, max: 1, time: config.eventDuration, errors: ['time'] });
        const winner = collected.first();

        db.addMoney(winner.author.id, reward);

        // Kazanan mesajı
        const winMsg = config.messages.winner
            .replace('{user}', winner.author)
            .replace('{reward}', reward);

        // Kazanana yanıt ver
        await winner.reply(winMsg);
    } catch (e) {
        // Timeout: Kendi mesajına yanıt ver
        await sentMessage.reply(config.messages.timeout);
        // Kimse bilmedi, sistemi duraklat
        isPaused = true;
        console.log('[REVIVAL] Kimse cevap vermedi. Sistem duraklatıldı. 💤');
    }

    isEventActive = false;
    lastMessageTime = Date.now();
}
