const { Events } = require('discord.js');
const config = require('../../commands/etkinlik/config.js').boostAnnounce;

// Başka bot takviyecilere config.roleId'yi veriyor. Biz o rolün eklenmesini
// (GuildMemberUpdate) izleyip chate teşekkür mesajı atıyoruz. Rol kalkınca
// (takviye bitince) opsiyonel bir bitiş mesajı gönderilir.
module.exports = {
    name: Events.GuildMemberUpdate,
    once: false,
    async execute(oldMember, newMember) {
        if (!config || !config.enabled) return;

        const had = oldMember.roles.cache.has(config.roleId);
        const has = newMember.roles.cache.has(config.roleId);
        if (had === has) return; // Bu rolle ilgili bir değişiklik yok

        const channel = newMember.guild.channels.cache.get(config.channelId);
        if (!channel) return;

        const format = (msg) => msg
            .replace(/{user}/g, `<@${newMember.id}>`)
            .replace(/{count}/g, newMember.guild.premiumSubscriptionCount || 0);

        try {
            if (!had && has) {
                // Rol EKLENDİ -> takviye teşekkürü
                const msgs = config.messages || [];
                if (msgs.length === 0) return;
                // Discord toplam takviye sayısını (premiumSubscriptionCount) ayrı bir
                // sinyalle güncelliyor; {count} taze olsun diye kısa bir gecikme koyuyoruz.
                const delayMs = (config.announceDelaySeconds ?? 2) * 1000;
                if (delayMs > 0) await new Promise(r => setTimeout(r, delayMs));
                await channel.send(format(msgs[Math.floor(Math.random() * msgs.length)]));
            } else if (had && !has && config.endEnabled) {
                // Rol KALKTI -> takviye bitiş mesajı (opsiyonel)
                const msgs = config.endMessages || [];
                if (msgs.length === 0) return;
                await channel.send(format(msgs[Math.floor(Math.random() * msgs.length)]));
            }
        } catch (e) {
            console.error('[BOOST] Duyuru gönderilemedi:', e.message);
        }
    }
};
