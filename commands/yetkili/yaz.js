const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('yaz')
        .setDescription('Botun ağzından mesaj yazar. (Komut veya Form)')
        .addChannelOption(option =>
            option.setName('kanal')
                .setDescription('Mesajın gönderileceği kanal')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('mesaj')
                .setDescription('Mesajı buraya yaz (Boş bırakırsan Form açılır)')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('yanitla_id')
                .setDescription('Yanıtlanacak Mesaj ID (Opsiyonel)')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

    async execute(interaction) {
        // Yetki Kontrolü
        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
            return interaction.reply({ content: '❌ Bu komutu kullanmak için yetkiniz yok!', ephemeral: true });
        }

        const channel = interaction.options.getChannel('kanal');
        const content = interaction.options.getString('mesaj');
        const replyId = interaction.options.getString('yanitla_id');

        // Kanalın metin kanalı olup olmadığını kontrol et
        if (!channel.isTextBased()) {
            return interaction.reply({ content: '❌ Seçilen kanal bir metin kanalı değil!', ephemeral: true });
        }

        // --- SENARYO 1: FORM (MODAL) AÇ (Mesaj yoksa) ---
        if (!content) {
            const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

            // CustomID format: yaz_modal:kanalID
            const modal = new ModalBuilder()
                .setCustomId(`yaz_modal:${channel.id}`)
                .setTitle('Bot Mesajı Yaz');

            const messageInput = new TextInputBuilder()
                .setCustomId('message_content')
                .setLabel("Mesaj İçeriği")
                .setStyle(TextInputStyle.Paragraph)
                .setPlaceholder("Mesajını buraya yaz...")
                .setRequired(true);

            // Yanıt ID (Opsiyonel) - Eğer komutta girildiyse onu forma taşıyabiliriz ama 
            // modal API'si value set etmeye izin veriyor.
            const replyInput = new TextInputBuilder()
                .setCustomId('message_reply_id')
                .setLabel("Yanıtlanacak Mesaj ID (Opsiyonel)")
                .setStyle(TextInputStyle.Short)
                .setPlaceholder("ID yapıştırabilirsin")
                .setRequired(false);

            if (replyId) replyInput.setValue(replyId); // Varsa doldur

            modal.addComponents(
                new ActionRowBuilder().addComponents(messageInput),
                new ActionRowBuilder().addComponents(replyInput)
            );

            await interaction.showModal(modal);
            return;
        }

        // --- SENARYO 2: DİREKT GÖNDERİM (Mesaj varsa) ---
        try {
            const payload = { content: content };

            // Yanıtlama Mantığı
            if (replyId) {
                try {
                    const targetMsg = await channel.messages.fetch(replyId);
                    if (targetMsg) await targetMsg.reply(payload);
                    else await channel.send(payload);
                } catch (e) {
                    await channel.send(payload);
                }
            } else {
                await channel.send(payload);
            }

            // Geri Bildirim
            return interaction.reply({ content: `✅ Mesaj <#${channel.id}> kanalına gönderildi.`, ephemeral: true });

        } catch (error) {
            console.error(error);
            return interaction.reply({ content: '❌ Mesaj gönderilirken bir hata oluştu.', ephemeral: true });
        }
    },
};
