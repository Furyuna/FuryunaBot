const config = require('../../commands/kayit/config.js');

module.exports = {
    init: (client) => {
        console.log('[SECURITY] Güvenlik Modülü (Link/Medya Koruması) Aktif!');

        client.on('messageCreate', async (message) => {
            // 1. Botları ve DM'leri yoksay
            if (message.author.bot || !message.guild) return;

            // 2. Yetkilileri Yoksay (Staff Roller veya Yönetici Yetkisi)
            const isStaff = config.staffRoles.some(roleId => message.member.roles.cache.has(roleId)) ||
                message.member.permissions.has('ManageMessages') ||
                message.member.permissions.has('Administrator');

            if (isStaff) return;

            // 3. Güvenli Rolü (Verified Member) veya Kayıtsız (Unregistered) Kontrolü
            // Kayıtsızların (ref sheet atmaları için) ve Doğrulanmışların atmasına izin ver.
            const isVerified = message.member.roles.cache.has(config.roles.verifiedMember);
            const isUnregistered = message.member.roles.cache.has(config.roles.unregistered);

            if (isVerified || isUnregistered) return;

            // --- YASAKLAMA MANTIĞI (Doğrulanmamışlar İçin) ---

            // A) Link Kontrolü (http, https, discord.gg, vs.)
            // Regex: Protokol içeren (http://) veya bilinen uzantılar
            const linkRegex = /(https?:\/\/[^\s]+)|(www\.[^\s]+)|(discord\.gg\/[^\s]+)/gi;
            const hasLink = linkRegex.test(message.content);

            // B) Dosya/Medya Kontrolü (Attachments)
            const hasAttachment = message.attachments.size > 0;

            if (hasLink || hasAttachment) {
                try {
                    // Mesajı Sil (Herkesin Önünden Kaldır)
                    if (message.deletable) {
                        await message.delete();
                    }

                    // Kullanıcıya DM At (Gizli ve Kalıcı)
                    try {
                        await message.author.send({
                            content: `👋 Selam <@${message.author.id}>! Güvenliğimiz için link ve dosya paylaşımını sadece **Doğrulanmış Üyeler** yapabiliyor. 💖\n\n🔓 **Kilidi Açmak İçin:**\n- Sohbet ederek **1. Seviye** olabilirsin,\n\n**VEYA**\n\n- **@W4zel** gibi bir yetkiliden seni **manuel olarak doğrulamasını** isteyebilirsin.\n\nAnlayışın için teşekkürler! ✨`
                        });
                    } catch (dmError) {
                        // DM Kapalıysa yapacak bir şey yok, kanalı kirletmeyelim.
                        console.log(`[SECURITY] DM atılamadı (Kapalı): ${message.author.tag}`);
                    }

                    // Loglama
                    console.log(`[SECURITY] Engellendi: ${message.author.tag} | Link: ${hasLink} | Dosya: ${hasAttachment}`);

                } catch (err) {
                    console.error('[SECURITY] Hata:', err);
                }
            }
        });
    }
};
