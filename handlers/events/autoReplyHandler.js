const { Events } = require('discord.js');
const config = require('../../commands/etkinlik/config.js');

module.exports = {
    name: Events.MessageCreate,
    once: false,
    async execute(message) {
        try {
            // 1. Bot mesajlarını yoksay
            if (message.author.bot || !message.guild) return;

            // 2. Config kontrolü
            if (!config.autoReply || !config.autoReply.enabled) return;

            const content = message.content.toLowerCase().trim();
            const triggers = config.autoReply.triggers;

            // 3. Tetikleyici Kontrolü
            // Tam eşleşme (örn: "sa") VEYA Başlangıç (örn: "sa beyler")
            const isTriggered = triggers.some(trigger =>
                content === trigger ||
                content.startsWith(`${trigger} `) ||
                content.slice(0, trigger.length) === trigger // Basit kontrol, yukarıdakiler daha güvenli ama
            );

            // Daha hassas kontrol: Kelime bazlı
            // "sa" kelimesi cümlenin başında mı?
            // "masa" kelimesinde tetiklenmemeli.
            const words = content.split(/\s+/);
            const firstWord = words[0];

            // Eğer ilk kelime bizim trigger listesindeyse
            if (triggers.includes(firstWord)) {
                // Rastgele cevap seç
                const responses = config.autoReply.responses;
                const randomResponse = responses[Math.floor(Math.random() * responses.length)];

                // Cevap ver (Reply)
                await message.reply(randomResponse);
                // console.log(`[OTO-CEVAP] ${message.author.tag} kişisine cevap verildi.`);
            }

        } catch (error) {
            console.error('[AUTO REPLY ERROR]', error);
        }
    }
};
