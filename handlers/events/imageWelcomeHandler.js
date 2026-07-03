const { Events, AttachmentBuilder } = require('discord.js');
const config = require('../../commands/etkinlik/config.js');
const kayitConfig = require('../../commands/kayit/config.js');
const { generateWelcomeImage } = require('../../utils/imageGenerator');

// Hoş geldin kartını üret ve gönder.
// Hem gerçek kayıt event'i hem de !gir simülasyonu bu fonksiyonu kullanır.
async function sendWelcomeCard(member) {
    if (!config.gifWelcome || !config.gifWelcome.enabled) return;

    const channel = member.guild.channels.cache.get(config.gifWelcome.channelId);
    if (!channel) return;

    const avatarUrl = member.displayAvatarURL({ extension: 'png', size: 512, forceStatic: true });

    const imageBuffer = await generateWelcomeImage({
        userName: member.displayName,
        avatarUrl: avatarUrl,
        mainText: config.gifWelcome.title?.text || 'HOŞ GELDİN',
        subText: 'Aramıza katıldığın için çok mutluyuz!',
        titleColor: '#FFD86B', // sıcak altın
        accent2: '#FF8A5B',    // mercan (aurora/degrade)
        footerText: `${member.guild.memberCount}. üyemiz`,
        width: config.gifWelcome.width || 800,
        height: config.gifWelcome.height || 450
    });

    const attachment = new AttachmentBuilder(imageBuffer, { name: 'welcome-image.png' });
    await channel.send({ content: `Sunucuya hoş geldin <@${member.id}>! 🎉`, files: [attachment] });
}

module.exports = {
    name: Events.GuildMemberUpdate,
    once: false,
    sendWelcomeCard, // Simülasyon komutu doğrudan çağırabilsin diye dışa aktarıldı

    async execute(oldMember, newMember) {
        if (!config.gifWelcome || !config.gifWelcome.enabled) return;

        // SADECE KAYIT TAMAMLANINCA tetiklen: 'Kayıtsız' rolü kalktıysa.
        // (Katılınca değil — trol hesaplar daha kayıt olmadan resimde görünmesin.)
        const wasUnregistered = oldMember.roles.cache.has(kayitConfig.roles.unregistered);
        const isUnregistered = newMember.roles.cache.has(kayitConfig.roles.unregistered);
        if (!(wasUnregistered && !isUnregistered)) return;

        try {
            await sendWelcomeCard(newMember);
        } catch (error) {
            console.error('[IMAGE WELCOME ERROR]', error);
        }
    }
};
