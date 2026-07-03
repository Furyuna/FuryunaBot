const { Events, AttachmentBuilder } = require('discord.js');
const path = require('path');
const config = require('../../commands/etkinlik/config.js');
const { generateWelcomeImage } = require('../../utils/imageGenerator');

module.exports = {
    name: Events.GuildMemberRemove,
    once: false,
    async execute(member) {
        if (!config.gifWelcome || !config.gifWelcome.enabled) return;

        try {
            const channel = member.guild.channels.cache.get(config.gifWelcome.channelId);
            if (!channel) return;

            const avatarUrl = member.displayAvatarURL({ extension: 'png', size: 512, forceStatic: true });
            const bgPath = path.join(__dirname, '../../assets/cardbackround.png');

            const imageBuffer = await generateWelcomeImage({
                userName: member.displayName,
                avatarUrl: avatarUrl,
                mainText: "GÜLE GÜLE",
                subText: "Kendine çok iyi bak!",
                backgroundPath: bgPath,
                titleColor: "#ff6b6b", // Çıkış mesajı için kırmızı tonda
                width: config.gifWelcome.width || 800,
                height: config.gifWelcome.height || 450
            });

            const attachment = new AttachmentBuilder(imageBuffer, { name: 'goodbye-image.png' });
            await channel.send({ content: `${member.user.tag} sunucudan ayrıldı.`, files: [attachment] });

        } catch (error) {
            console.error('[IMAGE GOODBYE ERROR]', error);
        }
    }
};
