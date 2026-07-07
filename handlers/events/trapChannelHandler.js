const { Events } = require('discord.js');
const config = require('../../commands/etkinlik/config.js').trapChannel;
const kayitConfig = require('../../commands/kayit/config.js');

// Aynı anda işlenen kullanıcıları takip et (spam burst'te tek uyarı, tek işlem)
const pending = new Set();

// --- SPAM İMZASI & TÜM KANALLARDAN TEMİZLEME ---
function normalizeText(str) {
    return String(str || '').toLowerCase().replace(/\s+/g, ' ').trim();
}

// Tuzak mesajının imzası: metin + ek dosyaların ad/boyutu (resim olsa bile eşleşir)
function captureSignature(message) {
    return {
        text: message.content ? normalizeText(message.content) : null,
        attachments: [...message.attachments.values()].map(a => ({ name: a.name, size: a.size }))
    };
}

function matchesSignature(m, sig) {
    if (sig.text && m.content && normalizeText(m.content) === sig.text) return true;
    if (sig.attachments.length && m.attachments.size) {
        for (const a of m.attachments.values()) {
            if (sig.attachments.some(s => s.name === a.name && s.size === a.size)) return true;
        }
    }
    return false;
}

// Tek bir kanalı tara: eşleşme buldukça daha eskiye iner; bir sayfada hiç
// eşleşme çıkmazsa o kanalda spam bitmiştir -> durur.
async function purgeChannel(ch, userId, sig, pageCap) {
    let deleted = 0;
    let before;
    for (let page = 0; page < pageCap; page++) {
        let msgs;
        try {
            msgs = await ch.messages.fetch({ limit: 100, before });
        } catch (e) { break; } // kanal okunamadı
        if (msgs.size === 0) break; // kanal bitti

        const bad = msgs.filter(m => m.author.id === userId && matchesSignature(m, sig));
        if (bad.size === 0) break; // eşleşme yok -> daha derine inme

        const del = await ch.bulkDelete(bad, true).catch(() => null); // 14 günden eskiyi atlar
        deleted += del ? del.size : 0;
        before = msgs.last().id; // bir sonraki (daha eski) sayfa
    }
    return deleted;
}

// Kişinin, tuzak mesajıyla eşleşen mesajlarını tüm (erişilebilir) kanallardan sil.
// Kanallar PARALEL taranır (her kanal ayrı rate-limit kovası; discord.js yönetir)
// -> 50 kanal bile saniyeler sürer. Sabit tarama limiti yok; maxPages sadece
// kilitlenmeyi önleyen güvenlik tavanı.
async function purgeMatchingSpam(guild, userId, sig, maxPages) {
    if (!sig.text && sig.attachments.length === 0) return 0; // imza yoksa tarama yok

    const me = guild.members.me;
    if (!me) return 0;
    const pageCap = maxPages || 10;

    const channels = [...guild.channels.cache.values()].filter(ch =>
        ch.isTextBased() &&
        ch.permissionsFor(me)?.has(['ViewChannel', 'ReadMessageHistory', 'ManageMessages'])
    );

    const results = await Promise.all(channels.map(ch => purgeChannel(ch, userId, sig, pageCap)));
    return results.reduce((a, b) => a + b, 0);
}

// Cezayı uygula, uygulanan işlemin etiketini döndür
async function applyAction(member) {
    const action = config.action || 'unregister';
    const reason = 'Tuzak kanala yazdı (honeypot)';

    if (action === 'unregister') {
        // Kaydı düşür: Yeni Üye + Doğrulanmış Üye rollerini al, Kayıtsız rolünü ekle
        // (commands/kayit/kayitsil.js ile aynı mantık)
        await member.roles.remove([kayitConfig.roles.newMember, kayitConfig.roles.verifiedMember]).catch(() => { });
        await member.roles.add(kayitConfig.roles.unregistered, reason);
        return 'kaydı düşürüldü (Kayıtsız)';
    }

    if (action === 'kick') {
        await member.kick(reason);
        return 'sunucudan atıldı';
    }

    if (action === 'quarantine') {
        if (config.removeRolesOnQuarantine) {
            // Tüm rolleri kaldır, sadece karantina rolünü bırak (tek çağrıda)
            await member.roles.set(config.quarantineRoleId ? [config.quarantineRoleId] : [], reason);
        } else if (config.quarantineRoleId) {
            await member.roles.add(config.quarantineRoleId, reason);
        }
        return 'karantinaya alındı';
    }

    // Varsayılan: timeout (susturma)
    const days = config.timeoutDays || 7;
    await member.timeout(days * 24 * 60 * 60 * 1000, reason);
    return `${days} gün susturuldu`;
}

module.exports = {
    name: Events.MessageCreate,
    once: false,
    async execute(message) {
        if (!config || !config.enabled) return;
        if (message.channel.id !== config.channelId) return;
        if (message.author.bot || !message.guild) return;

        const member = message.member;
        if (!member) return;

        // Muaf roller (güvenilir/yetkili)
        if (config.exemptRoleIds?.some(r => member.roles.cache.has(r))) return;

        const userId = message.author.id;

        // Zaten işleniyorsa: ekstra (spam) mesajları sessizce sil
        if (pending.has(userId)) {
            message.delete().catch(() => { });
            return;
        }
        pending.add(userId);

        const graceSec = config.graceSeconds || 10;
        const deadline = Math.floor((Date.now() + graceSec * 1000) / 1000); // canlı geri sayım için

        // Uyarıyı kullanıcının mesajına YANIT olarak at (canlı geri sayımlı)
        let warnMsg = null;
        try {
            warnMsg = await message.reply({
                content: config.warnMessage
                    .replace('{user}', `<@${userId}>`)
                    .replace('{countdown}', `<t:${deadline}:R>`)
                    .replace('{seconds}', graceSec),
                allowedMentions: { repliedUser: true }
            });
        } catch (e) { /* önemsiz */ }

        setTimeout(async () => {
            try {
                // Kişi mesajını sildi mi? (fetch başarısızsa silinmiştir -> iptal)
                let deleted = false;
                try {
                    await message.channel.messages.fetch(message.id);
                } catch (e) {
                    deleted = true;
                }

                if (deleted) {
                    // Yanlışlıkla yazmış ve silmiş -> ceza yok; uyarıyı güvence mesajına çevir
                    if (warnMsg) {
                        warnMsg.edit({
                            content: config.safeMessage.replace('{user}', `<@${userId}>`),
                            allowedMentions: { users: [userId] }
                        }).catch(() => { });
                    }
                    return;
                }

                // Ceza zamanı: önce spam imzasını al (silmeden önce), mesajı sil, işlem uygula
                const sig = captureSignature(message);
                await message.delete().catch(() => { });

                let label, actionOk = true;
                try {
                    label = await applyAction(member);
                } catch (e) {
                    actionOk = false;
                    console.error('[TUZAK] Ceza uygulanamadı (yetki/hiyerarşi?):', e.message);
                    label = 'işlenemedi (yetki hatası)';
                }

                // Kişiye DM: neden kaydının düştüğü (DM'i kapalıysa sessizce geçilir)
                if (actionOk && config.dmEnabled && config.dmMessage) {
                    await message.author.send(config.dmMessage).catch(() => { });
                }

                // Tüm kanallardaki AYNI mesajı (metin/resim) temizle
                let purged = 0;
                if (config.purgeEnabled) {
                    purged = await purgeMatchingSpam(message.guild, userId, sig, config.purgeMaxPages);
                }

                // Yetkili bildirimi
                if (config.alertChannelId) {
                    const alertCh = message.guild.channels.cache.get(config.alertChannelId);
                    if (alertCh) {
                        alertCh.send(
                            config.alertMessage
                                .replace('{user}', `<@${userId}>`)
                                .replace('{action}', label)
                        ).catch(() => { });
                    }
                }
                console.log(`[TUZAK] ${message.author.tag} tuzak kanala yazdı -> ${label} | ${purged} spam mesajı temizlendi`);

                if (warnMsg) warnMsg.delete().catch(() => { });
            } finally {
                pending.delete(userId);
            }
        }, graceSec * 1000);
    }
};
