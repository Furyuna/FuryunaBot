const { PermissionsBitField, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    name: 'itiraf-kur',
    aliases: ['itirafkur', 'itirafsistemi'],
    description: 'İtiraf sistemini (butonlu mesajı) bu kanala kurar.',

    async executePrefix(message, args) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply('Bu komutu kullanmak için Yönetici yetkisine sahip olmalısın.');
        }

        const msgContent = "🕵️‍♂️ **Anonim İtiraf Kutusu**\nİçini dökmek veya kimsenin bilmediği sırrını paylaşmak mı istiyorsun?\nAşağıdaki butona tıklayarak tamamen anonim bir şekilde itirafta bulunabilirsin!\n\n_Kimliğin asla görünmeyecektir._";

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('btn_confess')
                .setLabel('İtiraf Et 🤫')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('✉️')
        );

        await message.delete().catch(() => { });
        await message.channel.send({ content: msgContent, components: [row] });
    },

    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({ content: 'Yönetici yetkisi gerekli.', ephemeral: true });
        }

        const msgContent = "🕵️‍♂️ **Anonim İtiraf Kutusu**\nİçini dökmek veya kimsenin bilmediği sırrını paylaşmak mı istiyorsun?\nAşağıdaki butona tıklayarak tamamen anonim bir şekilde itirafta bulunabilirsin!\n\n_Kimliğin asla görünmeyecektir._";

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('btn_confess')
                .setLabel('İtiraf Et 🤫')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('✉️')
        );

        await interaction.reply({ content: msgContent, components: [row] });
    }
};
