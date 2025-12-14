module.exports = {
    // --- YETKİLİ ROLLERİ ---
    staffRoles: [
        "1224075999474618368",
        "1327899730860183572",
        "1282278419517931553",

        "1394383194282790923",
    ],

    // --- KULLANICI ROLLERİ ---
    roles: {
        verifiedMember: "1447493960669855825", 	// Doğrulanmış Üye
        newMember: "1447493899735007253",  // Yeni Üye (Kayıtlı sayılır)
        unregistered: "1447493853467770972",  // Kayıtsız
    },

    // --- KOMUT İSİMLERİ VE PREFİX TAKMA ADLARI ---
    // slash: Discord'da görünecek /komut adı (Küçük harf, boşluksuz, Türkçe karakter YOK)
    // aliases: Prefix ile kullanılabilecek alternatifler (Türkçe serbest)
    // menuName: Sağ tık menüsünde görünecek isim
    commands: {
        kayit: {
            slash: "kayıt",
            aliases: ["kayıt", "k", "kaydol", "register"],
            description: "Kullanıcıyı kayıt eder (Yeni Üye).",
            menuName: "Hızlı Kayıt Et"
        },
        kayitSil: {
            slash: "kayıt-sil",
            aliases: ["kayıt sil", "kayıtsil", "ks", "unregister"],
            description: "Kullanıcının kaydını siler.",
            menuName: "Hızlı Kayıt Sil"
        },
        dogrula: {
            slash: "doğrula",
            aliases: ["doğrula", "dogrula", "d"],
            description: "Kullanıcıyı doğrular.",
            menuName: "Hızlı Doğrula"
        },
        dogrulamaSil: {
            slash: "doğrulama-sil",
            aliases: ["doğrulama sil", "doğrulamaal", "unverify", "doğrulamasil", "doğrulasil", "dsil", "doğrula sil",],
            description: "Kullanıcının doğrulamasını alır.",
            menuName: "Hızlı Doğrulama Sil"
        },

    },

    // --- MESAJLAR ---
    messages: {
        // Hatalar
        yetkiYok: "⛔ **Erişim Reddedildi:** Bu komutu kullanmak için **yetkili değilsin**.",
        kullanimHatasi: "⚠️ **Eksik Kullanım:** Lütfen bir kullanıcı etiketleyin.",
        kendisi: "⚠️ **İşlem Geçersiz:** Kendi üzerinizde işlem yapamazsınız.",
        bot: "⚠️ **Bot İşlemi:** Botlara işlem yapamazsınız.",

        // Durum Kontrolleri
        zatenKayitli: (target, roleName) => `⚠️ <@${target}> kullanıcısı **zaten kayıtlı** (**${roleName}** rolü var).`,
        zatenKayitsiz: (target, roleName) => `⚠️ <@${target}> kullanıcısı **zaten kayıtsız** (**${roleName}** rolü var).`,
        zatenDogrulanmis: (target, roleName) => `⚠️ <@${target}> kullanıcısı **zaten doğrulanmış** (**${roleName}** rolü var).`,
        zatenDogrulanmamis: (target, roleName) => `⚠️ <@${target}> kullanıcısı **zaten doğrulanmamış** (**${roleName}** rolü var).`,

        // Başarılı İşlemler
        kayitBasarili: (target, staff) =>
            `✅ <@${target}> başarıyla **Kayıt Edildi**!\n` +
            `👮 **İşlemi Yapan:** <@${staff}>`,

        kayitSilindi: (target, staff) =>
            `🗑️ <@${target}> kullanıcısının kaydı silindi ve **Kayıtsız**'a atıldı.\n` +
            `👮 **İşlemi Yapan:** <@${staff}>`,

        dogrulamaBasarili: (target, staff) =>
            `🛡️ <@${target}> kullanıcısının hesabı **Doğrulandı**.\n` +
            `👮 **Yetkili:** <@${staff}>`,

        dogrulamaSilindi: (target, staff) =>
            `🚫 <@${target}> kullanıcısının doğrulaması **Kaldırıldı**.\n` +
            `👮 **İşlemi Yapan:** <@${staff}>`
    }
};
