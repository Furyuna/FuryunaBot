const { createCanvas } = require('canvas');
let loadImage;
try { ({ loadImage } = require('canvas')); } catch (e) { /* opsiyonel */ }

// ---------- yardımcılar ----------

function roundRectPath(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
}

function hexToRgb(hex) {
    const m = String(hex).replace('#', '');
    const full = m.length === 3 ? m.split('').map(c => c + c).join('') : m;
    const n = parseInt(full, 16);
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}
const rgba = (c, a) => `rgba(${c.r},${c.g},${c.b},${a})`;

function stripEmoji(str) {
    return String(str)
        .replace(/([\u{1F000}-\u{1FAFF}]|[\u{2600}-\u{27BF}]|[\u{2B00}-\u{2BFF}]|[\u{2190}-\u{21FF}]|[\u{1F1E6}-\u{1F1FF}]|[\u{FE00}-\u{FE0F}]|[\u{20D0}-\u{20FF}]|\u{200D}|\u{FE0F})/gu, '')
        .replace(/\s+/g, ' ')
        .trim();
}

function glowBlob(ctx, x, y, radius, color, alpha) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, radius);
    g.addColorStop(0, rgba(color, alpha));
    g.addColorStop(1, rgba(color, 0));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}

// Sola dayalı iki renk degradeli metin
function leftGradientText(ctx, text, x, y, c1, c2, maxWidth) {
    const tw = Math.min(ctx.measureText(text).width, maxWidth || Infinity);
    const grad = ctx.createLinearGradient(x, 0, x + tw, 0);
    grad.addColorStop(0, c1);
    grad.addColorStop(1, c2);
    ctx.fillStyle = grad;
    ctx.fillText(text, x, y, maxWidth);
}

// Metni genişliğe sığdır: fontu küçült, gerekiyorsa "…" ile kırp
function fitText(ctx, text, weight, startSize, minSize, maxWidth) {
    let size = startSize, t = String(text);
    ctx.font = `${weight} ${size}px sans-serif`;
    while (ctx.measureText(t).width > maxWidth && size > minSize) {
        size -= 2;
        ctx.font = `${weight} ${size}px sans-serif`;
    }
    if (ctx.measureText(t).width > maxWidth) {
        while (t.length && ctx.measureText(t + '…').width > maxWidth) t = t.slice(0, -1);
        t += '…';
    }
    return { text: t, size };
}

/**
 * Prosedürel zeminli YATAY BANNER hoş geldin / güle güle kartı.
 * (Avatar solda büyük, metinler sağda; koyu degrade + aurora + cam panel.)
 */
async function generateWelcomeImage({ userName, avatarUrl, mainText, subText, titleColor = '#FFD86B', accent2, width = 1000, height = 340, footerText = null }) {
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    const A = hexToRgb(titleColor);
    const B = hexToRgb(accent2 || titleColor);
    const accentHex = titleColor;
    const accent2Hex = accent2 || titleColor;

    userName = stripEmoji(userName) || 'Üye';
    mainText = stripEmoji(mainText);
    subText = stripEmoji(subText);
    footerText = footerText ? stripEmoji(footerText) : footerText;

    // 1. ZEMİN
    const base = ctx.createLinearGradient(0, 0, width, height);
    base.addColorStop(0, '#12131b');
    base.addColorStop(0.55, '#0d0e15');
    base.addColorStop(1, '#08080d');
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, width, height);

    // 2. AURORA (avatar tarafından güçlü ışık)
    glowBlob(ctx, width * 0.16, height * 0.20, height * 1.15, A, 0.28);
    glowBlob(ctx, width * 0.92, height * 0.95, height * 1.05, B, 0.22);
    glowBlob(ctx, width * 0.16, height * 0.5, height * 0.75, A, 0.10);

    // 3. NOKTA DOKUSU
    ctx.fillStyle = 'rgba(255,255,255,0.035)';
    for (let gy = 24; gy < height; gy += 24)
        for (let gx = 24; gx < width; gx += 24) {
            ctx.beginPath();
            ctx.arc(gx, gy, 1, 0, Math.PI * 2);
            ctx.fill();
        }

    // 4. VİNYET
    const vg = ctx.createRadialGradient(width * 0.45, height * 0.5, 120, width / 2, height / 2, width * 0.7);
    vg.addColorStop(0, 'rgba(0,0,0,0)');
    vg.addColorStop(1, 'rgba(0,0,0,0.5)');
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, width, height);

    // 5. CAM PANEL
    const pad = 22;
    const pw = width - 2 * pad, ph = height - 2 * pad;
    roundRectPath(ctx, pad, pad, pw, ph, 28);
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.45)';
    ctx.shadowBlur = 26;
    ctx.shadowOffsetY = 8;
    ctx.fillStyle = 'rgba(14,15,22,0.5)';
    ctx.fill();
    ctx.restore();
    const border = ctx.createLinearGradient(pad, pad, pad + pw, pad + ph);
    border.addColorStop(0, rgba(A, 0.75));
    border.addColorStop(1, rgba(B, 0.5));
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = border;
    roundRectPath(ctx, pad, pad, pw, ph, 28);
    ctx.stroke();

    // 6. AVATAR (SOL, büyük, dikey ortalı)
    const avSize = Math.round(height * 0.52);
    const avX = pad + 40;
    const avCX = avX + avSize / 2;
    const avCY = height / 2;
    const avY = avCY - avSize / 2;

    ctx.save();
    ctx.beginPath();
    ctx.arc(avCX, avCY, avSize / 2 + 8, 0, Math.PI * 2);
    ctx.shadowColor = accentHex;
    ctx.shadowBlur = 34;
    ctx.fillStyle = rgba(A, 0.25);
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.beginPath();
    ctx.arc(avCX, avCY, avSize / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    let drew = false;
    if (loadImage) {
        try {
            const av = await loadImage(avatarUrl);
            ctx.drawImage(av, avX, avY, avSize, avSize);
            drew = true;
        } catch (e) { /* placeholder */ }
    }
    if (!drew) { ctx.fillStyle = '#2b2b36'; ctx.fillRect(avX, avY, avSize, avSize); }
    ctx.restore();

    const ring = ctx.createLinearGradient(avX, avY, avX + avSize, avY + avSize);
    ring.addColorStop(0, accentHex);
    ring.addColorStop(1, accent2Hex);
    ctx.beginPath();
    ctx.arc(avCX, avCY, avSize / 2, 0, Math.PI * 2);
    ctx.lineWidth = 6;
    ctx.strokeStyle = ring;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(avCX, avCY, avSize / 2 - 6, 0, Math.PI * 2);
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(255,255,255,0.85)';
    ctx.stroke();

    // 7. METİNLER (SAĞ, sola dayalı, dikey ortalı)
    const tx = avX + avSize + 46;
    const tMaxW = width - pad - 44 - tx;
    ctx.textAlign = 'left';

    // Başlık
    ctx.save();
    try { ctx.letterSpacing = '2px'; } catch (e) { }
    ctx.font = '800 34px sans-serif';
    ctx.shadowColor = 'rgba(0,0,0,0.55)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 2;
    const titleY = avCY - 46;
    leftGradientText(ctx, String(mainText).toUpperCase(), tx, titleY, accentHex, accent2Hex, tMaxW);
    ctx.restore();

    // Vurgu çizgisi
    const lineY = titleY + 14;
    const lg = ctx.createLinearGradient(tx, 0, tx + 120, 0);
    lg.addColorStop(0, accentHex);
    lg.addColorStop(1, rgba(B, 0.1));
    ctx.fillStyle = lg;
    roundRectPath(ctx, tx, lineY, 120, 4, 2);
    ctx.fill();

    // İsim
    const nameFit = fitText(ctx, userName, '900', 54, 26, tMaxW);
    ctx.font = `900 ${nameFit.size}px sans-serif`;
    ctx.shadowColor = 'rgba(0,0,0,0.9)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 2;
    ctx.fillStyle = '#ffffff';
    const nameY = avCY + 30;
    ctx.fillText(nameFit.text, tx, nameY);

    // Alt mesaj
    ctx.font = 'italic 22px sans-serif';
    ctx.fillStyle = '#cfd0da';
    ctx.shadowBlur = 5;
    ctx.fillText(String(subText), tx, nameY + 36, tMaxW);

    // 8. ROZET (sağ üst köşe)
    if (footerText) {
        ctx.font = '600 17px sans-serif';
        const tw = ctx.measureText(String(footerText)).width;
        const bw = tw + 34, bh = 30;
        const bx = width - pad - 22 - bw, by = pad + 20;
        ctx.shadowBlur = 0;
        ctx.shadowOffsetY = 0;
        roundRectPath(ctx, bx, by, bw, bh, bh / 2);
        ctx.fillStyle = rgba(A, 0.16);
        ctx.fill();
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = rgba(A, 0.75);
        ctx.stroke();
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(String(footerText), bx + bw / 2, by + bh / 2 + 1);
        ctx.textBaseline = 'alphabetic';
        ctx.textAlign = 'left';
    }

    return canvas.toBuffer();
}

module.exports = { generateWelcomeImage };
