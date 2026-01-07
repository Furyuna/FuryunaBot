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

async function startQuiz(channel) {
    const qData = config.quiz.questions[Math.floor(Math.random() * config.quiz.questions.length)];
    const durationSec = config.eventDuration / 1000;

    // Mesaj formatı: İlk satır sabit, sonra soru
    const startText = config.messages.quizStart.replace('{time}', durationSec);
    const description = `${startText}\n\n**Soru: ${qData.q}**`;

    const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle('🧠 Bilgi Yarışması!')
        .setDescription(description)
        .setFooter({ text: 'FuryunaBot • Sohbet Canlandırıcı' });

    await channel.send({ embeds: [embed] });

    const filter = m => !m.author.bot && qData.a.includes(m.content.toLowerCase());
    try {
        const collected = await channel.awaitMessages({ filter, max: 1, time: config.eventDuration, errors: ['time'] });
        const winner = collected.first();

        db.addMoney(winner.author.id, config.quiz.reward);

        // Kazanan mesajı
        const winMsg = config.messages.winner
            .replace('{user}', winner.author)
            .replace('{reward}', config.quiz.reward);

        await channel.send(`${winMsg}\n*(Doğru cevap: ${qData.a[0]})*`);
    } catch (e) {
        await channel.send(`${config.messages.timeout}\n*(Doğru cevap: ${qData.a[0]})*`);
    }

    isEventActive = false;
    lastMessageTime = Date.now();
}

async function startMath(channel) {
    const n1 = Math.floor(Math.random() * (config.math.max - config.math.min)) + config.math.min;
    const n2 = Math.floor(Math.random() * (config.math.max - config.math.min)) + config.math.min;
    const op = config.math.operations[Math.floor(Math.random() * config.math.operations.length)];
    const durationSec = config.eventDuration / 1000;

    let answer;
    if (op === '+') answer = n1 + n2;
    else if (op === '-') answer = n1 - n2;
    else if (op === '*') answer = n1 * n2;

    const startText = config.messages.mathStart.replace('{time}', durationSec);
    const description = `${startText}\n\n**İşlem: ${n1} ${op} ${n2} = ?**`;

    const embed = new EmbedBuilder()
        .setColor('#ff9900')
        .setTitle('➕ Matematik Zamanı!')
        .setDescription(description)
        .setFooter({ text: 'FuryunaBot • Sohbet Canlandırıcı' });

    await channel.send({ embeds: [embed] });

    const filter = m => !m.author.bot && parseInt(m.content) === answer;
    try {
        const collected = await channel.awaitMessages({ filter, max: 1, time: config.eventDuration, errors: ['time'] });
        const winner = collected.first();

        db.addMoney(winner.author.id, config.math.reward);

        // Kazanan mesajı
        const winMsg = config.messages.winner
            .replace('{user}', winner.author)
            .replace('{reward}', config.math.reward);

        await channel.send(`${winMsg}\n*(Cevap: ${answer})*`);
    } catch (e) {
        await channel.send(`${config.messages.timeout}\n*(Cevap: ${answer})*`);
    }

    isEventActive = false;
    lastMessageTime = Date.now();
}

async function startDrop(channel) {
    const word = config.drop.words[Math.floor(Math.random() * config.drop.words.length)];
    const reward = Math.floor(Math.random() * (config.drop.maxReward - config.drop.minReward)) + config.drop.minReward;
    const durationSec = config.eventDuration / 1000;

    const startText = config.messages.dropStart.replace('{time}', durationSec);
    const description = `${startText}\n\n**Kelime:** \`${word}\``;

    const embed = new EmbedBuilder()
        .setColor('#00ff00')
        .setTitle('💸 Gökten Coin Yağıyor!')
        .setDescription(description)
        .setFooter({ text: 'FuryunaBot • Sohbet Canlandırıcı' });

    await channel.send({ embeds: [embed] });

    const filter = m => !m.author.bot && m.content.toLowerCase() === word;
    try {
        const collected = await channel.awaitMessages({ filter, max: 1, time: config.eventDuration, errors: ['time'] });
        const winner = collected.first();

        db.addMoney(winner.author.id, reward);

        // Kazanan mesajı
        const winMsg = config.messages.winner
            .replace('{user}', winner.author)
            .replace('{reward}', reward);

        await channel.send(winMsg);
    } catch (e) {
        await channel.send(config.messages.timeout);
    }

    isEventActive = false;
    lastMessageTime = Date.now();
}
