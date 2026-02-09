const { Events, AttachmentBuilder } = require('discord.js');
const Canvas = require('canvas');
const path = require('path');
const config = require('../../commands/etkinlik/config.js');

module.exports = {
    name: Events.GuildMemberAdd,
    once: false,
    async execute(member) {
        if (!config.gifWelcome || !config.gifWelcome.enabled) return;

        try {
            const channel = member.guild.channels.cache.get(config.gifWelcome.channelId);
            if (!channel) return;

            // Canvas Oluştur
            const canvas = Canvas.createCanvas(config.gifWelcome.width, config.gifWelcome.height);
            const ctx = canvas.getContext('2d');

            // Arka Planı Yükle
            const bgPath = path.join(__dirname, '../../assets/cardbackround.png');
            const background = await Canvas.loadImage(bgPath);
            ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

            // --- AYARLAR ---
            const avatarSize = 250;
            const avatarX = 50;
            const avatarY = (canvas.height - avatarSize) / 2;

            // --- YARI SAYDAM KUTU (PANEL) ---
            // Yazıların okunması için arkaya siyahımsı bir şerit çekiyoruz (Satır/Sütun mantığı)
            ctx.fillStyle = 'rgba(0, 0, 0, 0.6)'; // %60 Saydam Siyah
            // Yuvarlak köşeli dikdörtgen fonksiyonu (Basitçe)
            const boxX = 320;
            const boxY = 50;
            const boxWidth = 450;
            const boxHeight = 350;
            ctx.fillRect(boxX, boxY, boxWidth, boxHeight);

            // Kutuya ince bir çerçeve
            ctx.lineWidth = 2;
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);


            // --- YUVARLAK AVATAR ---
            ctx.save();
            ctx.beginPath();
            ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2, true);
            ctx.closePath();
            ctx.clip();

            const avatarURL = member.displayAvatarURL({ extension: 'png', size: 512 });
            const avatar = await Canvas.loadImage(avatarURL);
            ctx.drawImage(avatar, avatarX, avatarY, avatarSize, avatarSize);

            ctx.restore();

            // --- AVATAR ÇERÇEVESİ ---
            ctx.beginPath();
            ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2, true);
            ctx.lineWidth = 8;
            ctx.strokeStyle = '#ffffff';
            ctx.stroke();

            // --- YAZI AYARLARI ---
            const centerX = boxX + (boxWidth / 2); // Kutunun ortası
            ctx.textAlign = 'center'; // Yazıları ortala

            const textY_Welcome = boxY + 80;
            const textY_Name = boxY + 180;
            const textY_Sub = boxY + 280;

            // 1. "HOŞ GELDİN"
            ctx.font = 'bold 45px sans-serif';
            ctx.fillStyle = '#FFD700'; // Altın
            ctx.shadowColor = "rgba(0,0,0,1)";
            ctx.shadowBlur = 5;
            ctx.fillText("ARAMIZA HOŞ GELDİN!", centerX, textY_Welcome);

            // 2. KULLANICI ADI
            ctx.font = 'bold 60px sans-serif';
            ctx.fillStyle = '#ffffff';
            ctx.shadowBlur = 10;

            let displayName = member.displayName.toUpperCase();
            if (displayName.length > 12) {
                ctx.font = 'bold 40px sans-serif';
            }
            if (displayName.length > 20) displayName = displayName.substring(0, 18) + "...";

            ctx.fillText(displayName, centerX, textY_Name);

            // 3. ALT MESAJ
            ctx.font = 'italic 25px sans-serif';
            ctx.fillStyle = '#cccccc';
            ctx.shadowBlur = 0;
            ctx.fillText("Sensiz bir kişi eksiğiz... 💖", centerX, textY_Sub);

            const attachment = new AttachmentBuilder(canvas.toBuffer(), { name: 'welcome-image.png' });
            channel.send({ content: `Sunucuya hoş geldin <@${member.id}>!`, files: [attachment] });

        } catch (error) {
            console.error('[IMAGE WELCOME ERROR]', error);
        }
    }
};
