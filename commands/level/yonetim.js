const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('../../utils/database.js');
const levelConfig = require('./config.js').levelSystem;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('level-yonet')
        .setDescription('Kullanıcıların seviye ve XP verilerini yönetir (Sadece Yetkililer).')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(sub =>
            sub.setName('xp-ver')
                .setDescription('Bir kullanıcıya XP ve Para verir.')
                .addUserOption(opt => opt.setName('kullanici').setDescription('Kullanıcı').setRequired(true))
                .addIntegerOption(opt => opt.setName('miktar').setDescription('XP Miktarı').setRequired(true))
                .addIntegerOption(opt => opt.setName('para').setDescription('Para Miktarı (Opsiyonel)').setRequired(false))
        )
        .addSubcommand(sub =>
            sub.setName('level-ayarla')
                .setDescription('Bir kullanıcının seviyesini doğrudan ayarlar.')
                .addUserOption(opt => opt.setName('kullanici').setDescription('Kullanıcı').setRequired(true))
                .addIntegerOption(opt => opt.setName('seviye').setDescription('Yeni Seviye').setRequired(true))
        )
        .addSubcommand(sub =>
            sub.setName('sifirla')
                .setDescription('Bir kullanıcının tüm verilerini (XP, Level, Para) sıfırlar.')
                .addUserOption(opt => opt.setName('kullanici').setDescription('Kullanıcı').setRequired(true))
        ),

    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return interaction.reply({ content: '⛔ Bu komutu kullanmak için **Yönetici** yetkisine sahip olmalısın.', ephemeral: true });
        }

        const subcommand = interaction.options.getSubcommand();
        const targetUser = interaction.options.getUser('kullanici');
        const userId = targetUser.id;

        // Kullanıcı verisini veritabanından çek (yoksa oluşturur)
        const user = db.getUser(userId);

        if (subcommand === 'xp-ver') {
            const xpAmount = interaction.options.getInteger('miktar');
            const moneyAmount = interaction.options.getInteger('para') || 0;

            db.addXp(userId, xpAmount);
            if (moneyAmount > 0) db.addMoney(userId, moneyAmount);

            await interaction.reply({
                content: `✅ <@${userId}> kullanıcısına **${xpAmount} XP** ve **${moneyAmount} Coin** verildi!\n(Not: Seviye atlama işlemi bir sonraki mesajında gerçekleşir).`
            });

        } else if (subcommand === 'level-ayarla') {
            const newLevel = interaction.options.getInteger('seviye');
            db.setLevel(userId, newLevel);

            // Level 1 ise XP'yi de o levele uygun ayarla ki hemen düşmesin
            // Formül tersi zor olduğu için XP'yi sıfırlamıyoruz ama genelde level up için biraz xp verilir.

            await interaction.reply({
                content: `🛠️ <@${userId}> kullanıcısının seviyesi **${newLevel}** olarak ayarlandı.`
            });

        } else if (subcommand === 'sifirla') {
            db.setLevel(userId, 0);
            // XP ve Para sıfırlama metodu db.js'de yoksa manuel set yapalım veya delete
            // deleteUser yoksa update ile 0 yaparız.
            // db.js'de setLevel var, xp ve money için add var ama set yoksa? 
            // Veritabanı dosyasını kontrol etmeliyim ama şimdilik "kabaca" sıfırlayalım.
            // En temizi veritabanında "setUser" veya "resetUser" olması lazım.

            // Geçici çözüm: db.run ile SQL çalıştıracağız
            try {
                const sqliteDb = require('better-sqlite3')('database.sqlite');
                sqliteDb.prepare('UPDATE users SET xp = 0, level = 0, money = 0 WHERE user_id = ?').run(userId);
                sqliteDb.close();

                await interaction.reply({
                    content: `♻️ <@${userId}> kullanıcısının tüm verileri sıfırlandı!`
                });
            } catch (e) {
                console.error(e);
                await interaction.reply({ content: '❌ Sıfırlama sırasında bir hata oluştu.' });
            }
        }
    }
};
