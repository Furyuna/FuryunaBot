const { Events } = require('discord.js');
const fs = require('fs');
const path = require('path');
const config = require('../commands/etkinlik/config.js').boostAnnounce;

const STATE_FILE = path.join(__dirname, '../data/boostState.json');

function loadState() {
    try { return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8')); } catch (e) { return null; }
}
function saveState(s) {
    try {
        fs.mkdirSync(path.dirname(STATE_FILE), { recursive: true });
        fs.writeFileSync(STATE_FILE, JSON.stringify(s, null, 2));
    } catch (e) { console.error('[BOOST-SADAKAT] state kaydedilemedi:', e.message); }
}

// premiumSince tarihinden bugüne kadar geçen TAM ay sayısı
function monthsSince(since) {
    const now = new Date();
    let m = (now.getFullYear() - since.getFullYear()) * 12 + (now.getMonth() - since.getMonth());
    if (now.getDate() < since.getDate()) m--; // aylık gün henüz gelmediyse bir eksik say
    return Math.max(0, m);
}

// Aylık takviye sadakatini kutlar. Her kişi, kesintisiz takviyesinin her aylık
// dönümünde (1., 2., 3. ay ...) yalnızca BİR kez kutlanır (state ile takip).
module.exports = (client) => {
    if (!config || !config.enabled || !config.loyaltyEnabled) return;

    async function check() {
        try {
            const channel = client.channels.cache.get(config.channelId);
            if (!channel || !channel.guild) return;

            const guild = channel.guild;
            const members = await guild.members.fetch();
            const msgs = config.loyaltyMessages || [];
            if (msgs.length === 0) return;

            let state = loadState();
            const firstRun = state === null; // İlk çalıştırma: geçmişi susarak tohumla
            if (state === null) state = {};

            for (const [id, member] of members) {
                if (!member.premiumSince) { delete state[id]; continue; } // takviye basmıyor
                const months = monthsSince(member.premiumSince);
                if (months < 1) continue;

                if ((state[id] || 0) >= months) continue; // bu ay zaten kutlandı
                state[id] = months;

                if (firstRun) continue; // ilk çalıştırmada duyurma, sadece tohumla

                const text = msgs[Math.floor(Math.random() * msgs.length)]
                    .replace(/{user}/g, `<@${id}>`)
                    .replace(/{months}/g, months)
                    .replace(/{count}/g, guild.premiumSubscriptionCount || 0);
                await channel.send(text).catch(e => console.error('[BOOST-SADAKAT] mesaj:', e.message));
            }

            saveState(state);
        } catch (e) {
            console.error('[BOOST-SADAKAT] kontrol hatası:', e.message);
        }
    }

    client.once(Events.ClientReady, () => {
        check();                                   // başlangıçta bir kez (ilk sefer sessiz tohumlar)
        setInterval(check, 24 * 60 * 60 * 1000);   // günde bir kez kontrol
        console.log('[BOOST-SADAKAT] Aktif — günlük aylık-sadakat kontrolü kuruldu.');
    });
};
