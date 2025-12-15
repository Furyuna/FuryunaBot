const { Events } = require('discord.js');
const db = require('../../utils/database');
const levelConfig = require('../../commands/level/config.js').levelSystem;

// Ses kanallarına giriş zamanlarını tutmak için Map
// Key: userId, Value: Timestamp
const voiceStateMap = new Map();

module.exports = {
    name: Events.VoiceStateUpdate,
    once: false, // Her olayda çalışsın
    async execute(oldState, newState) {
        const userId = newState.member.id;
        const now = Date.now();

        // 1. Kullanıcı kanaldan çıktı mı veya kanal değiştirdi mi?
        // (Eski state'de kanal var ama yeni state'de yok -> Çıkış)
        // (Eski ve yeni farklı -> Kanal değişimi -> Hesapla ve Sıfırla)
        if (oldState.channelId && (!newState.channelId || oldState.channelId !== newState.channelId)) {
            if (voiceStateMap.has(userId)) {
                const joinTime = voiceStateMap.get(userId);
                const durationMs = now - joinTime;

                // En az 1 dakika durduysa ödül ver
                if (durationMs >= 60000) {
                    const minutes = Math.floor(durationMs / 60000);

                    // Hesapla
                    const earningsXP = minutes * levelConfig.voice.xpPerMinute;
                    const earningsCoin = minutes * levelConfig.voice.coinPerMinute;

                    // Veritabanına işle
                    db.addXp(userId, earningsXP);
                    db.addMoney(userId, earningsCoin);

                    // Aktiflik Puanı (Rank Sistemi)
                    if (levelConfig.rankSystem && levelConfig.rankSystem.enabled) {
                        const activityGain = minutes * levelConfig.rankSystem.activityPerVoiceMinute;
                        db.addActivity(userId, activityGain);

                        // Rütbe kontrolü burada yapılmıyor, kullanıcı mesaj atınca veya decay çalışınca güncellenir
                        // (Performans için her dakika tüm seste olanlara role kontrolü yapmayalım)
                    }

                    // Seviye kontrolü (Ses ile level atlama burada da yapılabilir ama
                    // şimdilik sadece XP ekliyoruz, bir sonraki mesajda level atlar.
                    // Veya burada da db.getUser ile kontrol edip level atlatılabilir.)

                    // console.log(`${userId} seste ${minutes} dk durdu. +${earningsXP} XP, +${earningsCoin} Coin.`);
                }

                // Map'ten sil (Çıktıysa silelim, kanal değiştirdiyse aşağıda tekrar eklenecek)
                voiceStateMap.delete(userId);
            }
        }

        // 2. Kullanıcı kanala girdi mi?
        // (Yeni state'de kanal var ve (eski yok veya farklı) -> Giriş)
        if (newState.channelId && (oldState.channelId !== newState.channelId || !oldState.channelId)) {
            // Botları ve AFK kanallarını yoksay
            if (newState.member.user.bot) return;
            if (levelConfig.voice.ignoredChannels.includes(newState.channelId)) return;
            if (newState.selfMute || newState.selfDeaf) return; // Susturulmuşsa sayma (Opsiyonel)

            voiceStateMap.set(userId, now);
        }
    }
};
