const { Events } = require('discord.js');
const config = require('../commands/etkinlik/config.js').memberCountChannel;

// Bir kanalın adını üye sayısına göre otomatik günceller.
// Discord kanal-yeniden-adlandırma limiti (~2/10dk) yüzünden her giriş/çıkışta
// değil, zamanlayıcıyla ve YALNIZCA sayı değiştiğinde güncelleriz.
module.exports = (client) => {
    if (!config || !config.enabled) return;

    async function updateCount() {
        try {
            const channel = await client.channels.fetch(config.channelId).catch(() => null);
            if (!channel || !channel.guild) return;

            const count = channel.guild.memberCount;
            const newName = String(config.format || 'Üye Sayısı • {count}').replace('{count}', count);

            // Sadece değiştiyse yeniden adlandır (gereksiz rename = rate limit yeme)
            if (channel.name !== newName) {
                await channel.setName(newName);
                console.log(`[ÜYE SAYACI] Kanal adı güncellendi -> "${newName}"`);
            }
        } catch (e) {
            console.error('[ÜYE SAYACI] Güncellenemedi:', e.message);
        }
    }

    client.once(Events.ClientReady, () => {
        const mins = config.updateIntervalMinutes || 10;
        updateCount(); // Başlangıçta bir kez
        setInterval(updateCount, mins * 60 * 1000);
        console.log(`[ÜYE SAYACI] Aktif — her ${mins} dakikada bir kontrol edilecek.`);
    });
};
