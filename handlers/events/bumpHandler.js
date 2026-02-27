const { Events, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const db = require('../../utils/database.js');

// Ayarlar
const BUMP_CHANNEL_ID = '1287077374336307272'; // GERÇEK BUMP KANALI
const DISBOARD_BOT_ID = '302050872383242240'; // Disboard Bot ID (ORİJİNAL)
const REMINDER_DURATION = 2 * 60 * 60 * 1000; // 2 Saat (NORMAL)

let activeTimeout = null;
let nagInterval = null;
let lastBumpMessage = null; // Son onay mesajını tutmak için

// 1. BAŞARILI BUMP MESAJLARI (Teşekkür + Onay)
const successMessages = [
    { title: "Harikasın {user}! 💖", body: "Sayacı kurdum, 2 saat sonra sendeyim." },
    { title: "Eline sağlık {user}! 🚀", body: "Sunucu seninle yükseliyor. 2 saat sonra görüşürüz." },
    { title: "Süpersin {user}! ✨", body: "Notumu aldım, 2 saat dolunca haber vereceğim." },
    { title: "Kralsın {user}! 👑", body: "Bump başarıyla atıldı. 2 saat sonra hatırlatırım." },
    { title: "Teşekkürler {user}! 🌸", body: "Sen bu işi biliyorsun. 2 saat sonra buradayım." },
    { title: "Harika iş çıkardın {user}! 🔥", body: "2 saatlik geri sayım başladı." },
    { title: "Mükemmelsin {user}! 💎", body: "Sunucuya can verdin. 2 saat sonra hatırlatacağım." },
    { title: "Çok iyisin {user}! 🍬", body: "Bump için teşekkürler, 2 saat sonra görüşmek üzere." },
    { title: "Asilsin {user}! 🦁", body: "2 saat sonra sana seslenirim." },
    { title: "Büyüksün {user}! ⚡", body: "Enerjine hayranız. 2 saat sonra hatırlatma gelir." }
];

// 2. HATIRLATMA MESAJLARI (Zaman Doldu)
const reminderMessages = [
    { title: "Hey {user}, **Bump Zamanı!** ⏰", body: "Hadi komutu yapıştır ve bizi öne çıkar!" },
    { title: "{user} Geri sayım bitti! 🚀", body: "Sahne senin, `/bump` ile şovunu yap." },
    { title: "Uyan {user}! 🔔", body: "Bump sırası geldi, sunucu seni bekliyor!" },
    { title: "{user} tatlım, süre doldu! ✨", body: "Hadi sihirli parmaklarını konuştur: `/bump`" },
    { title: "Dikkat {user}! ⚠️", body: "Bump vakti geldi çattı. Görevin: Sunucuyu uçurmak!" },
    { title: "{user} Neredesin? 👀", body: "Bump sırası geldi, hadi bizi zirveye taşı!" },
    { title: "Hadi {user}, göster gücünü! 💪", body: "**Bump zamanı!** Bekletme bizi." },
    { title: "{user} Duyduk duymadık demeyin! 📢", body: "Bump vakti! Yapıştır komutu." },
    { title: "Vakit tamam {user}! ⏳", body: "Şimdi `/bump` atıp ödülleri kapma zamanı." },
    { title: "{user} Asil majesteleri, tahtınız sizi bekliyor! 🦁", body: "**Bump** zamanı!" }
];

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        // DEBUG LOG
        // DEBUG LOG
        console.log(`[BUMP-DEBUG] Msg in ${message.channel.id} from ${message.author.id} (${message.author.tag}): "${message.content}"`);

        // 1. Kanal Kontrolü
        if (message.channel.id !== BUMP_CHANNEL_ID) {
            console.log(`[BUMP-DEBUG] Channel Mismatch: ${message.channel.id} vs ${BUMP_CHANNEL_ID}`);
            return;
        }

        console.log("[BUMP-DEBUG] Channel Match! Checking content...");
        if (message.embeds.length > 0) {
            console.log("[BUMP-DEBUG] Embed Description:", message.embeds[0].description);
        }



        // 2. Normal Disboard (veya Diğer Bot) Kontrolü
        if (message.author.id === DISBOARD_BOT_ID) {
            // Embed veya Düz Yazı Kontrolü
            const content = message.content.toLowerCase();
            const embed = message.embeds[0];
            const desc = embed && embed.description ? embed.description.toLowerCase() : "";

            // Tetikleyici Kelimeler
            if (desc.includes('başarılı') || desc.includes('successful') || desc.includes('patlatma') ||
                desc.includes('öne çıkarma başarılı') ||
                content.includes('öne çıkarma başarılı') || content.includes('başarılı')) {

                await handleBumpSuccess(message);
            }
        }
    },
    initialize // EXPORT INITIALIZE FUNCTION
};

// Fonksiyon: Bump Başarılı Olduğunda
async function handleBumpSuccess(message) {
    // Bump'ı kimin attığını bulmaya çalış
    // Disboard mesajında etkileşimi yapan kişi (interaction user) görünüyor mu?
    // Genellikle 'message.interaction' null olabilir ama deneyelim.
    let bumperUser = null;

    // DISBOARD MODU:
    if (message.interaction && message.interaction.user) {
        bumperUser = message.interaction.user;
    } else {
        // Fallback: Belki embed içinde "Bumped by XY" yazıyordur?
        // Disboard bazen yazar, bazen yazmaz. Şimdilik "Birisi" diyelim.
    }

    // Sayaçları Temizle
    if (activeTimeout) clearTimeout(activeTimeout);
    if (nagInterval) clearInterval(nagInterval);

    // Kuyruğu Temizle (Beni bu sefer hatırlat diyenler artık silinmeli çünkü bump atıldı)
    // db.clearBumpQueue(); // HAYIR! Buradaki kullanıcılar, "2 saat sonraki" bump için sıradalar.
    // Mantık: Bump atıldı -> 2 saat sayılıyor -> 2 saat dolunca kuyruktaki herkese haber veriliyor.
    // O yüzden kuyruğu, HABER VERDİKTEN SONRA temizlemeliyiz. Ama şu an yeni bir döngü başladı.
    // Önceki döngüden kalanlar varsa silinmeli mi? Evet. Yeni döngü için yeniden kayıt olunmalı.
    db.clearBumpQueue();

    // 4. Kullanıcı Adı Belirleme (Ping YOK - Sadece İsim)
    let userName = "Birisi";
    if (bumperUser) {
        // Mesajın geldiği sunucudaki üye kaydını bulmaya çalış
        let member = null;
        if (message.guild) {
            try {
                // Cache yerine Fetch kullanarak kesin sunucu ismini alalım
                member = await message.guild.members.fetch(bumperUser.id);
            } catch (e) {
                // Fetch başarısız olursa cache dene
                member = message.guild.members.cache.get(bumperUser.id);
            }
        }
        userName = member ? member.displayName : bumperUser.username;
    }

    // 5. MESAJ İÇERİĞİ OLUŞTURMA (Gelişmiş Format)
    // 10 farklı başarı mesajından birini seç (Obje yapısı)
    const randomSuccessObj = successMessages[Math.floor(Math.random() * successMessages.length)];
    const titleMsg = randomSuccessObj.title.replace('{user}', `**${userName}**`);
    // Kullanıcı isteği: "/bump" yazan yerler kalın olsun
    const bodyMsg = randomSuccessObj.body.replace(/\/bump/g, '**/bump**');

    // TIMESTAMP: Şu an + 2 Saat
    const targetTime = Math.floor((Date.now() + REMINDER_DURATION) / 1000);

    // --- REWARD SYSTEM (ÖDÜLLER) ---
    let rewardText = "";
    if (bumperUser) {
        try {
            // Rastgele Ödüller
            const earnedCoins = Math.floor(Math.random() * (500 - 250 + 1)) + 250; // 250-500 Coin
            const earnedXp = Math.floor(Math.random() * (100 - 50 + 1)) + 50;      // 50-100 XP
            const earnedAp = Math.floor(Math.random() * (40 - 20 + 1)) + 20;       // 20-40 Activity Points

            // Veritabanına İşle
            db.addMoney(bumperUser.id, earnedCoins);
            db.addXp(bumperUser.id, earnedXp);
            db.addActivityPoints(bumperUser.id, earnedAp);

            // Format: 💰 289 Coin ve ✨ 64 XP ödülün verildi!
            rewardText = `💰 **${earnedCoins}** Coin ve ✨ **${earnedXp}** XP ödülün verildi!`;

            console.log(`[BUMP-REWARD] ${bumperUser.tag} -> ${earnedCoins} Coin, ${earnedXp} XP, ${earnedAp} AP`);
        } catch (error) {
            console.error("[BUMP-REWARD] Hata:", error);
        }
    }

    // Mesaj İçeriği (Plain Text - İstenen Format)
    // Satır 1: Başlık (Harikasın {user}! 💖)
    // Satır 2: (Boş)
    // Satır 3: Ödül Bilgisi (💰 ... ödülün verildi!)
    // Satır 4: Gövde (Sayacı kurdum...)
    // Satır 5: (Boş)
    // Satır 6: Zamanlayıcı (⏰ Bir Sonraki Bump...)

    // Not: rewardText varsa 3. satıra gelir, yoksa orası boş kalır (ama kullanıcı "3. satırda ödül vardı" dediği için vardur herhalde)
    const textContent = `${titleMsg}\n\n` +
        (rewardText ? `${rewardText}\n` : "") +
        `${bodyMsg}\n\n` +
        `⏰ **Bir Sonraki Bump:** <t:${targetTime}:R> (<t:${targetTime}:T>)`;

    // Butonlar
    const row = new ActionRowBuilder();

    // BUTON MANTIĞI: Direkt Seçenek (Yeşil/Kırmızı)
    if (bumperUser) {
        const settings = db.getBumpSettings(bumperUser.id);

        if (settings.ping_on_bump_action) {
            // Ping AÇIK -> Kapatmak için Kırmızı Buton
            row.addComponents(
                new ButtonBuilder()
                    .setCustomId(`bump_toggle_ping_off_${bumperUser.id}`)
                    .setLabel('🔕 Beni Etiketlemeyi Kapat')
                    .setStyle(ButtonStyle.Danger)
            );
        } else {
            // Ping KAPALI -> Açmak için Yeşil Buton
            row.addComponents(
                new ButtonBuilder()
                    .setCustomId(`bump_toggle_ping_on_${bumperUser.id}`)
                    .setLabel('🔔 Beni Etiketlemeyi Aç')
                    .setStyle(ButtonStyle.Success)
            );
        }
    }

    // Embed YERİNE sadece content
    lastBumpMessage = await message.channel.send({ content: textContent, components: [row] });

    // DB'ye Global Durumu Kaydet (KALICILIK)
    db.setBumpGlobalState(targetTime * 1000, bumperUser ? bumperUser.id : null, lastBumpMessage.id, message.channel.id);

    // Zamanlayıcıyı Başlat
    activeTimeout = setTimeout(() => {
        // Last Bumper ID'yi gönder
        const lastBumperId = bumperUser ? bumperUser.id : null;
        sendReminder(message.channel, lastBumperId);
    }, REMINDER_DURATION);

    // Kanal Adını GÜNCELLE -> KİLİTLİ
    setChannelNameLocked(message.channel);
}

// BUMP ROL ID
const BUMP_ROLE_ID = '1469300216854351966';


// Fonksiyon: Hatırlatma Gönder
async function sendReminder(channel, lastBumperId) {
    try {
        // ÖNCEKİ MESAJI DÜZENLE (Estetik Düzeltme)
        if (lastBumpMessage && lastBumpMessage.editable) {
            try {
                const oldContent = lastBumpMessage.content;
                // Sadece ilgili satırı değiştir
                const newContent = oldContent.replace('⏰ **Bir Sonraki Bump:**', '⏰ **Bump Sırası Geldi:**');
                await lastBumpMessage.edit(newContent);
            } catch (e) {
                console.log("Eski mesaj düzenlenirken hata:", e);
            }
        }

        const row = new ActionRowBuilder();

        // 1. Son Bump Atan Kişiyi Kontrol Et
        let userTarget = "Kullanıcı";
        if (lastBumperId) {
            const settings = db.getBumpSettings(lastBumperId);

            if (settings.ping_on_bump_action) {
                userTarget = `<@${lastBumperId}>`;
                // Ping Kapatma Butonu
                row.addComponents(
                    new ButtonBuilder()
                        .setCustomId(`bump_toggle_ping_off_${lastBumperId}`)
                        .setLabel('🔕 Beni Etiketlemeyi Kapat')
                        .setStyle(ButtonStyle.Danger)
                );
            } else {
                // Ping KAPALI -> İsim bul
                let bumperName = "Kullanıcı";
                try {
                    const member = channel.guild ? await channel.guild.members.fetch(lastBumperId) : null;
                    bumperName = member ? member.displayName : "Kullanıcı";
                } catch (e) { }
                userTarget = `**${bumperName}**`;

                // Ping Açma Butonu
                row.addComponents(
                    new ButtonBuilder()
                        .setCustomId(`bump_toggle_ping_on_${lastBumperId}`)
                        .setLabel('🔔 Beni Etiketlemeyi Aç')
                        .setStyle(ButtonStyle.Success)
                );
            }
        } else {
            userTarget = "Maceracı";
        }

        // 2. Rastgele Mesaj Seç (Obje Yapısı)
        const randomObj = reminderMessages[Math.floor(Math.random() * reminderMessages.length)];
        const titleMsg = randomObj.title.replace('{user}', userTarget);
        const bodyMsg = randomObj.body;

        // 3. Mesajı Birleştir (Mesaj + Rol)
        // Format: Başlık \n\n Gövde \n\n Rol
        let reminderText = `${titleMsg}\n\n${bodyMsg}\n\n<@&${BUMP_ROLE_ID}>`;

        console.log(`[BUMP] Hatırlatma gönderiliyor. Hedef: ${channel.name}`);

        // Mesajı Gönder (Butonlu)
        if (row.components.length > 0) {
            await channel.send({ content: reminderText, components: [row] });
        } else {
            await channel.send({ content: reminderText });
        }

        // DB'ye Hatırlatma Atıldığını İşle (Kalıcılık)
        db.markReminderSent();

        // Kuyruğu Temizle (Kullanılmıyor ama temiz kalsın)
        db.clearBumpQueue();

    } catch (error) {
        console.error("[BUMP] Hatırlatma gönderirken CRITICAL hata:", error);
    } finally {
        // Kanal Adını GÜNCELLE -> AKTİF (Hata olsa bile çalışır)
        setChannelNameUnlocked(channel);

        if (nagInterval) clearInterval(nagInterval);
    }
}

// BAŞLANGIÇTA ÇALIŞACAK FONKSİYON (Restore State & Catch-up)
async function initialize(client) {
    console.log("[BUMP] Başlatma kontrolü yapılıyor...");
    let state = db.getBumpGlobalState();

    // Kanalı bul
    // Eğer state yoksa bile kanalı bulmaya çalışmalıyız (Ayarlardan veya hardcoded)
    const channelId = state ? state.channel_id : BUMP_CHANNEL_ID;
    const channel = client.channels.cache.get(channelId);

    if (!channel) {
        console.error(`[BUMP] Kanal bulunamadı: ${channelId}`);
        return;
    }

    console.log("[BUMP] Geçmiş mesajlar taranıyor (Bot kapalıyken bump atıldı mı?)...");

    // SON MESAJLARI TARA (Missed Bump Check)
    // Son 50 mesajı çek, Disboard'ın attığı "başarılı" mesajı var mı bak.
    try {
        const messages = await channel.messages.fetch({ limit: 50 });
        const recentBump = messages.find(msg => {
            if (msg.author.id !== DISBOARD_BOT_ID) return false;

            const content = msg.content.toLowerCase();
            const embed = msg.embeds[0];
            const desc = embed && embed.description ? embed.description.toLowerCase() : "";

            return (desc.includes('başarılı') || desc.includes('successful') || desc.includes('patlatma') ||
                desc.includes('öne çıkarma başarılı') ||
                content.includes('öne çıkarma başarılı') || content.includes('başarılı'));
        });

        if (recentBump) {
            // Bulunan bump'ın zamanına göre hesapla
            const bumpTime = recentBump.createdTimestamp;
            const targetTime = bumpTime + REMINDER_DURATION;
            const now = Date.now();

            console.log(`[BUMP] Geçmişte atılmış bir bump bulundu! (${new Date(bumpTime).toLocaleTimeString()})`);

            // Eğer DB'deki kayıttan daha yeniyse veya DB'de kayıt yoksa GÜNCELLE
            if (!state || targetTime > state.next_bump_timestamp) {
                console.log("[BUMP] Veritabanı güncelleniyor (Catch-up)...");

                // Bumper'ı bulmaya çalış (Interaction user yoksa mesajda isim arama vs. yapılabilir ama zor, null geçeceğiz mecburen)
                let bumperId = null;
                if (recentBump.interaction && recentBump.interaction.user) {
                    bumperId = recentBump.interaction.user.id;
                }

                db.setBumpGlobalState(targetTime, bumperId, recentBump.id, channel.id);
                state = db.getBumpGlobalState(); // State'i güncelle
            }
        }
    } catch (e) {
        console.error("[BUMP] Geçmiş taraması sırasında hata:", e);
    }

    if (!state) {
        console.log("[BUMP] Kayıtlı bir durum yok ve geçmişte bump bulunamadı.");
        setChannelNameUnlocked(channel); // Hiç kayıt yoksa demek ki HAZIRDIR
        return;
    }

    // Son mesajı çekmeye çalış (Edit için)
    if (state.last_message_id) {
        try {
            lastBumpMessage = await channel.messages.fetch(state.last_message_id);
        } catch (e) {
            // console.log("[BUMP] Son mesaj bulunamadı.");
        }
    }

    const now = Date.now();
    const target = state.next_bump_timestamp;

    if (now >= target) {
        console.log("[BUMP] Süre dolmuş! Hatırlatma gönderilip gönderilmediği kontrol ediliyor...");

        // Kanal Adını Güncelle (Restart sonrası düzeltme)
        setChannelNameUnlocked(channel);

        // DÜZELTME: Eğer son mesaj zaten bizim attığımız bir hatırlatma mesajıysa TEKRAR ATMA.
        try {
            const recentMessages = await channel.messages.fetch({ limit: 10 });
            const myLastMessage = recentMessages.find(m => m.author.id === client.user.id);

            if (myLastMessage) {
                const content = myLastMessage.content.toLowerCase();
                const keywords = ["Bump Zamanı", "Geri sayım bitti", "Bump sırası geldi", "süre doldu", "vakti geldi çattı", "Vakit tamam", "Asil majesteleri"];
                const isReminder = keywords.some(k => content.includes(k.toLowerCase()));
                // Success Mesajları "2 saat sonra" içerir. Hatırlatma mesajları içermez.
                const isSuccessMsg = content.includes("2 saat sonra");

                if (isReminder && !isSuccessMsg) {
                    console.log("[BUMP] Zaten son mesaj olarak hatırlatma atılmış. Tekrar atılmıyor. 🛑");
                    return;
                }
            }
        } catch (e) {
            console.error("[BUMP] Çifte kontrol sırasında hata:", e);
        }

        console.log("[BUMP] Hatırlatma GÖNDERİLİYOR (Daha önce atılmamış).");
        sendReminder(channel, state.last_bumper_id);
    } else {
        const remaining = target - now;
        console.log(`[BUMP] Hatırlatma geri yüklendi. Kalan süre: ${Math.floor(remaining / 1000)} sn.`);

        // Kanal Adını Güncelle (Restart sonrası düzeltme - Beklemede)
        setChannelNameLocked(channel);

        activeTimeout = setTimeout(() => {
            sendReminder(channel, state.last_bumper_id);
        }, remaining);
    }
}

// --- KANAL ADI VE EMOJİ YÖNETİMİ ---
const BASE_CHANNEL_NAME = "「🤖」bot-komut"; // Kanalın asıl adı

async function setChannelNameLocked(channel) {
    // Amaç: 「🤖」bot-komut-⏳
    // Rate limit yememek için mevcut ismi kontrol et
    const targetName = "「🤖」bot-komut-⏳";
    if (channel.name === targetName) return;

    try {
        await channel.setName(targetName);
        console.log(`[BUMP-CHANNEL] Kanal adı kilitlendi: ${targetName}`);
    } catch (error) {
        console.error(`[BUMP-CHANNEL] İsim değiştirme hatası (Locked):`, error);
    }
}

async function setChannelNameUnlocked(channel) {
    // Amaç: 「🤖」bot-komut-🟢
    const targetName = "「🤖」bot-komut-🟢";
    if (channel.name === targetName) return;

    try {
        await channel.setName(targetName);
        console.log(`[BUMP-CHANNEL] Kanal adı açıldı: ${targetName}`);
    } catch (error) {
        console.error(`[BUMP-CHANNEL] İsim değiştirme hatası (Unlocked):`, error);
    }
}
