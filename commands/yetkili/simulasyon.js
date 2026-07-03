const { PermissionsBitField } = require('discord.js');
const welcomeHandler = require('../../handlers/events/imageWelcomeHandler');
const goodbyeHandler = require('../../handlers/events/imageGoodbyeHandler');

module.exports = {
    name: 'simulasyon',
    aliases: ['gir', 'çık', 'cik'], // !gir, !çık tetikleyicileri
    description: 'Giriş/Çıkış simülasyonu yapar.',

    async executePrefix(message, args) {
        // Yetki Kontrolü
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply('Bu komutu kullanmak için Yönetici yetkisine sahip olmalısın.');
        }

        // Hangi komut kullanıldı?
        // message.content'ten veya args'dan değil, commandHandler'dan gelen bilgiyi kullanmak lazım ama
        // buraya gelen args sadece argümanlar. message.content'i parse edelim.

        const prefix = require('../../config.json').prefix; // Veya globalConfig'den
        // Basitçe: Mesajın ilk kelimesine bak
        const commandName = message.content.slice(1).split(' ')[0].toLowerCase(); // !gir -> gir

        let targetMember = message.member;

        // ID Girilmişse onu bul
        if (args[0]) {
            try {
                const targetId = args[0].replace(/[<@!>]/g, '');
                targetMember = await message.guild.members.fetch(targetId);
            } catch (e) {
                return message.reply(`Kullanıcı bulunamadı: ${args[0]}`);
            }
        }

        if (commandName === 'gir') {
            await message.reply(`▶️ **${targetMember.user.tag}** için GİRİŞ simülasyonu başlatılıyor...`);
            // Not: execute() artık (oldMember, newMember) bekliyor (kayıt event'i).
            // Simülasyon kayıt kontrolünü atlayıp kartı doğrudan üretsin diye sendWelcomeCard kullanıyoruz.
            await welcomeHandler.sendWelcomeCard(targetMember);
        }
        else if (commandName === 'çık' || commandName === 'cik') {
            await message.reply(`◀️ **${targetMember.user.tag}** için ÇIKIŞ simülasyonu başlatılıyor...`);
            await goodbyeHandler.execute(targetMember); // Goodbye handler'ı çağır
        }
    }
};
