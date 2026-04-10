const { Events, AttachmentBuilder } = require('discord.js');
const path = require('path');
const config = require('../../commands/etkinlik/config.js');
const { generateWelcomeImage } = require('../../utils/imageGenerator');

module.exports = {
    name: Events.GuildMemberAdd,
    once: false,
    async execute(member) {
        if (!config.gifWelcome || !config.gifWelcome.enabled) return;

        try {
            const channel = member.guild.channels.cache.get(config.gifWelcome.channelId);
            if (!channel) return;

            // İsim Kısaltma: Ekrana taşmaması için
            let displayName = member.displayName.toUpperCase();
            if (displayName.length > 20) displayName = displayName.substring(0, 18) + "...";

            const avatarUrl = member.displayAvatarURL({ extension: 'png', size: 512, forceStatic: true });
            const bgPath = path.join(__dirname, '../../assets/cardbackround.png');

            // Canvas yerine HTML/CSS generator kullanıyoruz
            const imageBuffer = await generateWelcomeImage({
                userName: displayName,
                avatarUrl: avatarUrl,
                mainText: config.gifWelcome.title?.text || "ARAMIZA HOŞ GELDİN!",
                subText: "Aramıza katıldığın için çok mutluyuz!",
                backgroundPath: bgPath,
                width: config.gifWelcome.width || 800,
                height: config.gifWelcome.height || 450
            });

            const attachment = new AttachmentBuilder(imageBuffer, { name: 'welcome-image.png' });
            await channel.send({ content: `Sunucuya hoş geldin <@${member.id}>!`, files: [attachment] });

        } catch (error) {
            console.error('[IMAGE WELCOME ERROR]', error);
        }
    }
};
