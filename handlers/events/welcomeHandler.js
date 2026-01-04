const { Events } = require('discord.js');
const localConfig = require('../../commands/etkinlik/config.js');
const kayitConfig = require('../../commands/kayit/config.js');

module.exports = {
    name: Events.GuildMemberUpdate,
    async execute(oldMember, newMember) {
        // Eğer özellik kapalıysa dur
        if (!localConfig.welcome || !localConfig.welcome.enabled) return;

        // Rol değişikliklerini kontrol et
        // 'Unregistered' rolü kalktı mı?
        const oldHasUnregistered = oldMember.roles.cache.has(kayitConfig.roles.unregistered);
        const newHasUnregistered = newMember.roles.cache.has(kayitConfig.roles.unregistered);

        if (oldHasUnregistered && !newHasUnregistered) {
            // Kayıt işlemi tamamlanmış demektir (Kayıtsız rolü gitmiş)

            const channelId = localConfig.welcome.channelId;
            const channel = newMember.guild.channels.cache.get(channelId);

            if (channel) {
                try {
                    // Rastgele bir mesaj seç
                    const messages = localConfig.welcome.messages;
                    const randomMessage = messages[Math.floor(Math.random() * messages.length)];

                    let finalMessage = randomMessage(newMember.id, localConfig.welcome.pingRoleId);
                    // Artık ping config içindeki fonksiyonda hallediliyor

                    await channel.send(finalMessage);
                } catch (error) {
                    console.error(`[WELCOME] Mesaj gönderilirken hata: ${error}`);
                }
            } else {
                console.error(`[WELCOME] Kanal bulunamadı: ${channelId}`);
            }
        }
    },
};
