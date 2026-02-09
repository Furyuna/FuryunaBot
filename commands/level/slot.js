const db = require('../../utils/database.js');
const config = require('../etkinlik/config.js');

module.exports = {
    name: 'slot',
    aliases: ['s', 'slots'],
    description: 'Slot makinesini çevirir.',
    async executePrefix(message, args) {
        // 1. Kanal Kontrolü
        if (config.gambling.allowedChannelId && message.channel.id !== config.gambling.allowedChannelId) {
            return;
        }

        const userId = message.author.id;
        const user = db.getUser(userId);

        // 2. Bahis Miktarı
        let bet = args[0];
        if (bet === 'hepsi' || bet === 'all') {
            bet = user.money;
        } else {
            bet = parseInt(bet);
        }

        // 3. Validasyon
        if (isNaN(bet) || bet <= 0) {
            return message.reply('❌ Geçerli bir bahis miktarı girmelisin. (Örn: `!slot 100`)');
        }
        if (bet < config.gambling.minBet) {
            return message.reply(`❌ Minimum bahis miktarı: **${config.gambling.minBet} FCoin**`);
        }
        if (bet > config.gambling.maxBet) {
            return message.reply(`❌ Maksimum bahis miktarı: **${config.gambling.maxBet} FCoin**`);
        }
        if (user.money < bet) {
            return message.reply('❌ Yetersiz bakiye! Fakir kaldın...');
        }

        // 4. Oyunu Başlat
        db.addMoney(userId, -bet);
        const emojis = config.gambling.slot.emojis;

        // Sonucu önceden belirle
        const slot1 = emojis[Math.floor(Math.random() * emojis.length)];
        const slot2 = emojis[Math.floor(Math.random() * emojis.length)];
        const slot3 = emojis[Math.floor(Math.random() * emojis.length)];

        // Helper: Bekleme fonksiyonu
        const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
        const spinning = "🌀"; // Dönme efekti emojisi

        // 1. Başlangıç Mesajı (Hepsi Dönüyor)
        const slotMessage = await message.reply(`🎰 **SLOT MAKİNESİ** 🎰\n\n| ${spinning} | ${spinning} | ${spinning} |\n\n⏳ Çarklar dönüyor...`);

        // 2. Animasyon Adımları
        // Adım 1: İlk durdu
        await sleep(1000);
        await slotMessage.edit(`🎰 **SLOT MAKİNESİ** 🎰\n\n| ${slot1} | ${spinning} | ${spinning} |`);

        // Adım 2: İkinci durdu
        await sleep(1000);
        await slotMessage.edit(`🎰 **SLOT MAKİNESİ** 🎰\n\n| ${slot1} | ${slot2} | ${spinning} |`);

        // Adım 3: Üçüncü durdu (Final)
        await sleep(1000);

        // Sonuç Hesaplama
        let multiplier = 0;
        let win = false;
        let resultText = "";

        if (slot1 === slot2 && slot2 === slot3) {
            win = true;
            if (slot1 === '💎' || slot1 === '7️⃣') {
                multiplier = config.gambling.slot.jackpot; // x10
                resultText = `🎉 **JACKPOT!** Muhteşem!`;
            } else {
                multiplier = config.gambling.slot.win3; // x5
                resultText = `🔥 **Mükemmel!** Üçü de aynı!`;
            }
        } else if (slot1 === slot2 || slot2 === slot3 || slot1 === slot3) {
            win = true;
            multiplier = config.gambling.slot.win2; // x2
            resultText = `✅ **Güzel!** İkili tutturdun.`;
        } else {
            win = false;
            multiplier = 0;
            resultText = `💀 **Kaybettin!** Şansına küs.`;
        }

        const winnings = Math.floor(bet * multiplier);
        if (win) {
            db.addMoney(userId, winnings);
        }

        const finalContent = `🎰 **SLOT MAKİNESİ** 🎰\n\n| ${slot1} | ${slot2} | ${slot3} |\n\n${resultText}\n${win ? `💸 Kazancın: **${winnings} FCoin**` : `💸 Kaybın: **${bet} FCoin**`}\n💰 Yeni Bakiye: **${db.getUser(userId).money} FCoin**`;

        await slotMessage.edit(finalContent);
    }
};
