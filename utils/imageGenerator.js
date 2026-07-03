const { createCanvas, loadImage } = require('canvas');

// Yuvarlak köşeli dikdörtgen yolu (canvas sürümünden bağımsız çalışsın diye elde)
function roundRectPath(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
}

// Emoji/simge karakterlerini kaldır: sistem fontu renkli emoji içermediği için
// aksi halde "tofu" (kutu) olarak çizilir. Türkçe harfler Latin aralığında, güvende.
function stripEmoji(str) {
    return String(str)
        .replace(/([\u{1F000}-\u{1FAFF}]|[\u{2600}-\u{27BF}]|[\u{2B00}-\u{2BFF}]|[\u{2190}-\u{21FF}]|[\u{1F1E6}-\u{1F1FF}]|[\u{FE00}-\u{FE0F}]|[\u{20D0}-\u{20FF}]|\u{200D}|\u{FE0F})/gu, '')
        .replace(/\s+/g, ' ')
        .trim();
}

// #RRGGBB / #RGB -> {r,g,b}
function hexToRgb(hex) {
    const m = String(hex).replace('#', '');
    const full = m.length === 3 ? m.split('').map(c => c + c).join('') : m;
    const n = parseInt(full, 16);
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

/**
 * Canvas tabanlı hoş geldin / güle güle kartı (Ortalanmış "cam panel" tasarımı)
 * @param {object} opts
 * @param {string} opts.userName
 * @param {string} opts.avatarUrl
 * @param {string} opts.mainText   Büyük başlık (örn. "HOŞ GELDİN")
 * @param {string} opts.subText    Alt satır (örn. "Aramıza katıldın!")
 * @param {string} opts.backgroundPath
 * @param {string} [opts.titleColor='#FFD700']  Vurgu rengi (başlık, halka, çizgi, rozet)
 * @param {number} [opts.width=800]
 * @param {number} [opts.height=450]
 * @param {string|null} [opts.footerText=null]  Alt rozet metni (örn. "42. üyemiz")
 */
async function generateWelcomeImage({ userName, avatarUrl, mainText, subText, backgroundPath, titleColor = '#FFD700', width = 800, height = 450, footerText = null }) {
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    const accent = titleColor;
    const { r, g, b } = hexToRgb(accent);
    const cx = width / 2;

    // Çizilecek metinlerden emojileri temizle (tofu kutusu olmasın)
    userName = stripEmoji(userName) || 'Üye';
    mainText = stripEmoji(mainText);
    subText = stripEmoji(subText);
    footerText = footerText ? stripEmoji(footerText) : footerText;

    // 1. ARKA PLAN (cover-fit: boşluk bırakmadan kaplar)
    try {
        const bg = await loadImage(backgroundPath);
        const scale = Math.max(width / bg.width, height / bg.height);
        const bw = bg.width * scale, bh = bg.height * scale;
        ctx.drawImage(bg, (width - bw) / 2, (height - bh) / 2, bw, bh);
    } catch (e) {
        const grad = ctx.createLinearGradient(0, 0, width, height);
        grad.addColorStop(0, '#141420');
        grad.addColorStop(1, '#20142a');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);
    }

    // Karartma + radyal vinyet (yazılar okunur olsun)
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(0, 0, width, height);
    const vg = ctx.createRadialGradient(cx, height * 0.42, 80, cx, height / 2, width * 0.75);
    vg.addColorStop(0, 'rgba(0,0,0,0)');
    vg.addColorStop(1, 'rgba(0,0,0,0.55)');
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, width, height);

    // 2. CAM PANEL
    const pad = 30;
    roundRectPath(ctx, pad, pad, width - 2 * pad, height - 2 * pad, 28);
    ctx.fillStyle = 'rgba(18,18,26,0.5)';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = `rgba(${r},${g},${b},0.55)`;
    ctx.stroke();

    // 3. AVATAR (üst-orta)
    const avSize = 132;
    const avX = cx - avSize / 2;
    const avY = 48;
    const avCenterY = avY + avSize / 2;

    // Dış parıltı
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, avCenterY, avSize / 2 + 6, 0, Math.PI * 2);
    ctx.shadowColor = accent;
    ctx.shadowBlur = 28;
    ctx.fillStyle = `rgba(${r},${g},${b},0.20)`;
    ctx.fill();
    ctx.restore();

    // Avatarı yuvarlak kırp ve çiz
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, avCenterY, avSize / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    try {
        const av = await loadImage(avatarUrl);
        ctx.drawImage(av, avX, avY, avSize, avSize);
    } catch (e) {
        ctx.fillStyle = '#2b2b36';
        ctx.fillRect(avX, avY, avSize, avSize);
    }
    ctx.restore();

    // Halkalar: kalın vurgu + ince beyaz
    ctx.beginPath();
    ctx.arc(cx, avCenterY, avSize / 2, 0, Math.PI * 2);
    ctx.lineWidth = 5;
    ctx.strokeStyle = accent;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx, avCenterY, avSize / 2 - 5, 0, Math.PI * 2);
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(255,255,255,0.85)';
    ctx.stroke();

    // 4. METİNLER (ortalı)
    ctx.textAlign = 'center';

    // Başlık
    let y = avY + avSize + 46;
    ctx.shadowColor = 'rgba(0,0,0,0.85)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 2;
    ctx.font = '800 38px sans-serif';
    ctx.fillStyle = accent;
    ctx.fillText(String(mainText).toUpperCase(), cx, y, width - 120);

    // Vurgu çizgisi
    y += 14;
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    ctx.fillStyle = `rgba(${r},${g},${b},0.9)`;
    roundRectPath(ctx, cx - 45, y, 90, 4, 2);
    ctx.fill();

    // Kullanıcı adı (sığmazsa küçült, sonra kısalt)
    y += 50;
    const maxW = width - 130;
    let nameSize = 46;
    let name = String(userName);
    ctx.font = `900 ${nameSize}px sans-serif`;
    while (ctx.measureText(name).width > maxW && nameSize > 24) {
        nameSize -= 2;
        ctx.font = `900 ${nameSize}px sans-serif`;
    }
    if (ctx.measureText(name).width > maxW) {
        while (name.length && ctx.measureText(name + '…').width > maxW) name = name.slice(0, -1);
        name += '…';
    }
    ctx.shadowColor = 'rgba(0,0,0,0.9)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 2;
    ctx.fillStyle = '#ffffff';
    ctx.fillText(name, cx, y);

    // Alt mesaj
    y += 38;
    ctx.font = 'italic 22px sans-serif';
    ctx.fillStyle = '#d8d8e0';
    ctx.shadowBlur = 5;
    ctx.fillText(String(subText), cx, y, width - 140);

    // 5. ALT ROZET (opsiyonel — üye sayısı vb.)
    if (footerText) {
        ctx.font = '600 18px sans-serif';
        const tw = ctx.measureText(String(footerText)).width;
        const pw = tw + 36, ph = 32;
        const px = cx - pw / 2, py = height - pad - 42;
        ctx.shadowBlur = 0;
        ctx.shadowOffsetY = 0;
        roundRectPath(ctx, px, py, pw, ph, ph / 2);
        ctx.fillStyle = `rgba(${r},${g},${b},0.18)`;
        ctx.fill();
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = `rgba(${r},${g},${b},0.7)`;
        ctx.stroke();
        ctx.fillStyle = '#ffffff';
        ctx.textBaseline = 'middle';
        ctx.fillText(String(footerText), cx, py + ph / 2 + 1);
        ctx.textBaseline = 'alphabetic';
    }

    return canvas.toBuffer();
}

module.exports = { generateWelcomeImage };
