const { createCanvas, loadImage, registerFont } = require('canvas');
const fs = require('fs');

/**
 * Canvas tabanlı görsel üretici (Kutusuz, Temiz Tasarım)
 * @param {string} userName
 * @param {string} avatarUrl
 * @param {string} mainText
 * @param {string} subText
 * @param {string} backgroundPath
 * @param {string} titleColor
 * @param {number} width
 * @param {number} height
 */
async function generateWelcomeImage({ userName, avatarUrl, mainText, subText, backgroundPath, titleColor = '#FFD700', width = 800, height = 450 }) {
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // 1. ARKA PLAN VE VİNYET EFEKTİ
    try {
        const background = await loadImage(backgroundPath);
        ctx.drawImage(background, 0, 0, width, height);
    } catch (e) {
        ctx.fillStyle = '#1a1a24';
        ctx.fillRect(0, 0, width, height);
    }

    // Ekranın tamamına hafif karanlık bir vinyet aydınlatması verelim (Yazıları okunur kılar)
    const vignette = ctx.createRadialGradient(width / 2, height / 2, 100, width / 2, height / 2, width * 0.8);
    vignette.addColorStop(0, 'rgba(0,0,0,0.1)');
    vignette.addColorStop(1, 'rgba(0,0,0,0.7)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, width, height);

    // 2. AVATAR EKLENTİSİ (Solda Ortada)
    const avatarSize = 200;
    const avatarX = 60; // Soldan 60px içeri
    const avatarY = (height - avatarSize) / 2; // Dikeyde tam ortala

    ctx.save();
    ctx.beginPath();
    ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.clip();

    try {
        const avatar = await loadImage(avatarUrl);
        ctx.drawImage(avatar, avatarX, avatarY, avatarSize, avatarSize);
    } catch (e) {
        console.error("Avatar yüklenemedi", e);
    }
    ctx.restore();

    // Avatar Çerçevesi (Kademeli Neon Glow)
    function drawGlowingRing(blur, lineWidth, opacity) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2, true);
        ctx.lineWidth = lineWidth;
        ctx.strokeStyle = titleColor;
        ctx.globalAlpha = opacity;
        ctx.shadowColor = titleColor;
        ctx.shadowBlur = blur;
        ctx.stroke();
        ctx.restore();
    }

    drawGlowingRing(25, 10, 0.4);
    drawGlowingRing(15, 6, 0.7);
    drawGlowingRing(0, 3, 1.0);

    // 3. METİN BÖLÜMÜ 
    const textStartX = avatarX + avatarSize + 50; // Avatar'dan 50px sağda başlar
    const maxTextWidth = width - textStartX - 50; // Sağdan da 50px boşluk

    const titleSize = 40;
    const nameSize = 65;
    const subSize = 28;

    const gap = 15;
    const totalTextHeight = titleSize + nameSize + subSize + (gap * 2);
    let startY = (height - totalTextHeight) / 2 + titleSize;

    // Gölgelendirme (Yazıların Arka Plandan Kopması İçin Şart)
    ctx.shadowColor = "rgba(0,0,0,0.9)";
    ctx.shadowBlur = 8;
    ctx.shadowOffsetX = 3;
    ctx.shadowOffsetY = 3;

    // BAŞLIK
    ctx.font = "800 " + titleSize + "px sans-serif";
    ctx.fillStyle = titleColor;
    ctx.textAlign = 'left';
    ctx.fillText(mainText, textStartX, startY, maxTextWidth);

    // KULLANICI ADI
    startY += titleSize + gap;

    let usernameFit = userName;
    let measure = ctx.measureText(usernameFit);
    let currentNameSize = nameSize;

    if (measure.width > maxTextWidth) {
        const scale = maxTextWidth / measure.width;
        currentNameSize = Math.max(35, Math.floor(nameSize * scale));
        ctx.font = "900 " + currentNameSize + "px sans-serif";

        if (ctx.measureText(usernameFit).width > maxTextWidth) {
            while (ctx.measureText(usernameFit + '...').width > maxTextWidth && usernameFit.length > 0) {
                usernameFit = usernameFit.slice(0, -1);
            }
            usernameFit += '...';
        }
    } else {
        ctx.font = "900 " + nameSize + "px sans-serif";
    }

    // İsme beyazdan griye geçiş
    const textGrad = ctx.createLinearGradient(0, startY - currentNameSize, 0, startY);
    textGrad.addColorStop(0, '#ffffff');
    textGrad.addColorStop(1, '#cccccc');
    ctx.fillStyle = textGrad;

    ctx.fillText(usernameFit, textStartX, startY, maxTextWidth);

    // ALT MESAJ
    startY += currentNameSize - 5 + gap;
    ctx.font = "italic " + subSize + "px sans-serif";
    ctx.fillStyle = '#e8e8e8';
    ctx.shadowBlur = 5;
    ctx.fillText(subText, textStartX, startY, maxTextWidth);

    return canvas.toBuffer();
}

module.exports = { generateWelcomeImage };
