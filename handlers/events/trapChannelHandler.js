const { Events, PermissionsBitField } = require('discord.js');
const config = require('../../commands/etkinlik/config.js').trapChannel;

// Aynı anda işlenen kullanıcıları takip et (spam burst'te tek uyarı, tek işlem)
const pending = new Set();

// Cezayı uygula, uygulanan işlemin etiketini döndür
async function applyAction(member) {
    const action = config.action || 'timeout';
    const reason = 'Tuzak kanala yazdı (honeypot)';

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

        // Uyarı at (kişi silip kurtulabilsin diye)
        let warnMsg = null;
        try {
            warnMsg = await message.channel.send(
                config.warnMessage
                    .replace('{user}', `<@${userId}>`)
                    .replace('{seconds}', config.graceSeconds)
            );
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
                    // Yanlışlıkla yazmış ve düzeltmiş -> ceza yok
                    if (warnMsg) warnMsg.delete().catch(() => { });
                    return;
                }

                // Ceza zamanı: mesajı sil + işlem uygula
                await message.delete().catch(() => { });

                let label;
                try {
                    label = await applyAction(member);
                } catch (e) {
                    console.error('[TUZAK] Ceza uygulanamadı (yetki/hiyerarşi?):', e.message);
                    label = 'işlenemedi (yetki hatası)';
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
                console.log(`[TUZAK] ${message.author.tag} tuzak kanala yazdı -> ${label}`);

                if (warnMsg) warnMsg.delete().catch(() => { });
            } finally {
                pending.delete(userId);
            }
        }, (config.graceSeconds || 10) * 1000);
    }
};
