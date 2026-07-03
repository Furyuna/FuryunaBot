const { createCanvas } = require('canvas');
let loadImage;
try { ({ loadImage } = require('canvas')); } catch (e) { /* opsiyonel */ }

// ---------- yardımcılar ----------

// Yuvarlak köşeli dikdörtgen yolu
function roundRectPath(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
}

// #RRGGBB / #RGB -> {r,g,b}
function hexToRgb(hex) {
    const m = String(hex).replace('#', '');
    const full = m.length === 3 ? m.split('').map(c => c + c).join('') : m;
    const n = parseInt(full, 16);
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}
const rgba = (c, a) => `rgba(${c.r},${c.g},${c.b},${a})`;

// Emoji/simge karakterlerini kaldır (sistem fontu emojiyi "tofu" kutusu yapıyor)
function stripEmoji(str) {
    return String(str)
        .replace(/([\u{1F000}-\u{1FAFF}]|[\u{2600}-\u{27BF}]|[\u{2B00}-\u{2BFF}]|[\u{2190}-\u{21FF}]|[\u{1F1E6}-\u{1F1FF}]|[\u{FE00}-\u{FE0F}]|[\u{20D0}-\u{20FF}]|\u{200D}|\u{FE0F})/gu, '')
        .replace(/\s+/g, ' ')
        .trim();
}

// Yumuşak radyal ışık lekesi (aurora hissi)
function glowBlob(ctx, x, y, radius, color, alpha) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, radius);
    g.addColorStop(0, rgba(color, alpha));
    g.addColorStop(1, rgba(color, 0));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}

// Ortalanmış, iki renk degradeli metin
function centeredGradientText(ctx, text, cx, y, c1, c2, maxWidth) {
    const tw = Math.min(ctx.measureText(text).width, maxWidth || Infinity);
    const grad = ctx.createLinearGradient(cx - tw / 2, 0, cx + tw / 2, 0);
    grad.addColorStop(0, c1);
    grad.addColorStop(1, c2);
    ctx.fillStyle = grad;
    ctx.fillText(text, cx, y, maxWidth);
}

/**
 * Prosedürel arka planlı hoş geldin / güle güle kartı.
 * @param {object} opts
 * @param {string} opts.userName
 * @param {string} opts.avatarUrl
 * @param {string} opts.mainText
 * @param {string} opts.subText
 * @param {string} [opts.titleColor='#FFD86B']  Birincil vurgu
 * @param {string} [opts.accent2]               İkincil vurgu (degrade/aurora); yoksa birincil kullanılır
 * @param {number} [opts.width=800]
 * @param {number} [opts.height=450]
 * @param {string|null} [opts.footerText=null]
 * @param {string|null} [opts.backgroundPath=null]  (opsiyonel, artık kullanılmıyor)
 */
async function generateWelcomeImage({ userName, avatarUrl, mainText, subText, titleColor = '#FFD86B', accent2, width = 800, height = 450, footerText = null }) {
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    const cx = width / 2;

    const A = hexToRgb(titleColor);
    const B = hexToRgb(accent2 || titleColor);
    const accentHex = titleColor;
    const accent2Hex = accent2 || titleColor;

    userName = stripEmoji(userName) || 'Üye';
    mainText = stripEmoji(mainText);
    subText = stripEmoji(subText);
    footerText = footerText ? stripEmoji(footerText) : footerText;

    // 1. ZEMİN — koyu diyagonal degrade
    const base = ctx.createLinearGradient(0, 0, width, height);
    base.addColorStop(0, '#12131b');
    base.addColorStop(0.55, '#0d0e15');
    base.addColorStop(1, '#08080d');
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, width, height);

    // 2. AURORA — iki renkli yumuşak ışık lekeleri
    glowBlob(ctx, width * 0.80, height * 0.12, width * 0.55, A, 0.30);
    glowBlob(ctx, width * 0.15, height * 0.92, width * 0.55, B, 0.24);
    glowBlob(ctx, cx, height * 0.42, width * 0.30, A, 0.10);

    // 3. İNCE NOKTA DOKUSU
    ctx.fillStyle = 'rgba(255,255,255,0.035)';
    for (let gy = 26; gy < height; gy += 26) {
        for (let gx = 26; gx < width; gx += 26) {
            ctx.beginPath();
            ctx.arc(gx, gy, 1, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // 4. VİNYET
    const vg = ctx.createRadialGradient(cx, height * 0.45, 90, cx, height / 2, width * 0.72);
    vg.addColorStop(0, 'rgba(0,0,0,0)');
    vg.addColorStop(1, 'rgba(0,0,0,0.55)');
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, width, height);

    // 5. CAM PANEL
    const pad = 26;
    const pw = width - 2 * pad, ph = height - 2 * pad;
    roundRectPath(ctx, pad, pad, pw, ph, 30);
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.45)';
    ctx.shadowBlur = 24;
    ctx.shadowOffsetY = 8;
    ctx.fillStyle = 'rgba(14,15,22,0.55)';
    ctx.fill();
    ctx.restore();
    // panel kenarı (degrade)
    const border = ctx.createLinearGradient(pad, pad, pad + pw, pad + ph);
    border.addColorStop(0, rgba(A, 0.75));
    border.addColorStop(1, rgba(B, 0.55));
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = border;
    roundRectPath(ctx, pad, pad, pw, ph, 30);
    ctx.stroke();
    // üst iç parlama çizgisi (cam hissi)
    ctx.strokeStyle = 'rgba(255,255,255,0.10)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(pad + 24, pad + 1.5);
    ctx.lineTo(pad + pw - 24, pad + 1.5);
    ctx.stroke();

    // 6. AVATAR (üst-orta)
    const avSize = 128;
    const avY = 44;
    const avCY = avY + avSize / 2;

    // dış glow
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, avCY, avSize / 2 + 7, 0, Math.PI * 2);
    ctx.shadowColor = accentHex;
    ctx.shadowBlur = 30;
    ctx.fillStyle = rgba(A, 0.25);
    ctx.fill();
    ctx.restore();

    // avatarı yuvarlak kırp
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, avCY, avSize / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    let drew = false;
    if (loadImage) {
        try {
            const av = await loadImage(avatarUrl);
            ctx.drawImage(av, cx - avSize / 2, avY, avSize, avSize);
            drew = true;
        } catch (e) { /* aşağıda placeholder */ }
    }
    if (!drew) {
        ctx.fillStyle = '#2b2b36';
        ctx.fillRect(cx - avSize / 2, avY, avSize, avSize);
    }
    ctx.restore();

    // degrade halka + ince beyaz iç halka
    const ring = ctx.createLinearGradient(cx - avSize / 2, avY, cx + avSize / 2, avY + avSize);
    ring.addColorStop(0, accentHex);
    ring.addColorStop(1, accent2Hex);
    ctx.beginPath();
    ctx.arc(cx, avCY, avSize / 2, 0, Math.PI * 2);
    ctx.lineWidth = 5;
    ctx.strokeStyle = ring;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx, avCY, avSize / 2 - 5, 0, Math.PI * 2);
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(255,255,255,0.85)';
    ctx.stroke();

    // 7. METİNLER
    ctx.textAlign = 'center';
    try { ctx.letterSpacing = '2px'; } catch (e) { /* eski sürüm */ }

    // başlık (degrade)
    let y = avY + avSize + 44;
    ctx.font = '800 40px sans-serif';
    ctx.shadowColor = 'rgba(0,0,0,0.6)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 2;
    centeredGradientText(ctx, String(mainText).toUpperCase(), cx, y, accentHex, accent2Hex, width - 120);
    try { ctx.letterSpacing = '0px'; } catch (e) { }

    // vurgu çizgisi (degrade)
    y += 14;
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    const lineGrad = ctx.createLinearGradient(cx - 48, 0, cx + 48, 0);
    lineGrad.addColorStop(0, rgba(A, 0.15));
    lineGrad.addColorStop(0.5, accentHex);
    lineGrad.addColorStop(1, rgba(B, 0.15));
    ctx.fillStyle = lineGrad;
    roundRectPath(ctx, cx - 48, y, 96, 4, 2);
    ctx.fill();

    // kullanıcı adı (otomatik sığdır)
    y += 50;
    const maxW = width - 130;
    let nameSize = 46, name = String(userName);
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

    // alt mesaj
    y += 38;
    ctx.font = 'italic 22px sans-serif';
    ctx.fillStyle = '#cfd0da';
    ctx.shadowBlur = 5;
    ctx.fillText(String(subText), cx, y, width - 150);

    // 8. ALT ROZET
    if (footerText) {
        ctx.font = '600 18px sans-serif';
        const tw = ctx.measureText(String(footerText)).width;
        const bw = tw + 38, bh = 32;
        const bx = cx - bw / 2, by = height - pad - 42;
        ctx.shadowBlur = 0;
        ctx.shadowOffsetY = 0;
        roundRectPath(ctx, bx, by, bw, bh, bh / 2);
        ctx.fillStyle = rgba(A, 0.16);
        ctx.fill();
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = rgba(A, 0.75);
        ctx.stroke();
        ctx.fillStyle = '#ffffff';
        ctx.textBaseline = 'middle';
        ctx.fillText(String(footerText), cx, by + bh / 2 + 1);
        ctx.textBaseline = 'alphabetic';
    }

    return canvas.toBuffer();
}

module.exports = { generateWelcomeImage };
