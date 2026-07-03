const { Events, AttachmentBuilder } = require('discord.js');
const path = require('path');
const config = require('../../commands/etkinlik/config.js');
const kayitConfig = require('../../commands/kayit/config.js');
const { generateWelcomeImage } = require('../../utils/imageGenerator');

module.exports = {
    name: Events.GuildMemberUpdate,
    once: false,
    async execute(oldMember, newMember) {
        if (!config.gifWelcome || !config.gifWelcome.enabled) return;

        // SADECE KAYIT TAMAMLANINCA tetiklen: 'Kayıtsız' rolü kalktıysa.
        // (Katılınca değil — trol hesaplar daha kayıt olmadan resimde görünmesin.)
        const wasUnregistered = oldMember.roles.cache.has(kayitConfig.roles.unregistered);
        const isUnregistered = newMember.roles.cache.has(kayitConfig.roles.unregistered);
        if (!(wasUnregistered && !isUnregistered)) return;

        try {
            const channel = newMember.guild.channels.cache.get(config.gifWelcome.channelId);
            if (!channel) return;

            const avatarUrl = newMember.displayAvatarURL({ extension: 'png', size: 512, forceStatic: true });
            const bgPath = path.join(__dirname, '../../assets/cardbackround.png');

            const imageBuffer = await generateWelcomeImage({
                userName: newMember.displayName,
                avatarUrl: avatarUrl,
                mainText: config.gifWelcome.title?.text || 'HOŞ GELDİN',
                subText: 'Aramıza katıldığın için çok mutluyuz!',
                backgroundPath: bgPath,
                titleColor: '#FFD700',
                footerText: `${newMember.guild.memberCount}. üyemiz`,
                width: config.gifWelcome.width || 800,
                height: config.gifWelcome.height || 450
            });

            const attachment = new AttachmentBuilder(imageBuffer, { name: 'welcome-image.png' });
            await channel.send({ content: `Sunucuya hoş geldin <@${newMember.id}>! 🎉`, files: [attachment] });

        } catch (error) {
            console.error('[IMAGE WELCOME ERROR]', error);
        }
    }
};
