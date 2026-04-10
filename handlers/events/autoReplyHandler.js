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
            // Daha hassas kontrol: Sadece EXACT MATCH (Noktalama işaretleri hariç)
            // "sa desen" -> "sa desen" != "sa" -> Tetiklenmez.
            // "sa." -> "sa" == "sa" -> Tetiklenir.
            const cleanContent = content.replace(/[.,:;!?]+$/g, '').trim();

            // Eğer temizlenmiş içerik birebir trigger listesindeyse
            if (triggers.includes(cleanContent)) {

                // Rastgele cevap seç
                const responses = config.autoReply.responses;
                const randomResponse = responses[Math.floor(Math.random() * responses.length)];

                // Cevap ver (Reply)
                await message.reply(randomResponse);
            }
        } catch (error) {
            console.error('[AUTO REPLY ERROR]', error);
        }
    }
};
