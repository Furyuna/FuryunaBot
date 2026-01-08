const { ContextMenuCommandBuilder, ApplicationCommandType, PermissionFlagsBits } = require('discord.js');
const localConfig = require('./config.js');

module.exports = {
    data: new ContextMenuCommandBuilder()
        .setName(localConfig.commands.kayitSil.menuName)
        .setType(ApplicationCommandType.Message)
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

    async execute(interaction) {
        const memberRoles = interaction.member.roles.cache;
        if (!localConfig.staffRoles.some(r => memberRoles.has(r)) && !interaction.member.permissions.has('Administrator') && !interaction.member.permissions.has('ManageRoles'))
            return interaction.reply({ content: localConfig.messages.yetkiYok, ephemeral: false });

        // MESAJ BAĞLAMI
        if (!interaction.targetMessage) return interaction.reply({ content: "Hata: Mesaj verisine ulaşılamadı.", ephemeral: false });
        const targetUserId = interaction.targetMessage.author.id;
        console.log(`[DEBUG] Hızlı Kayıt Sil Mesaj: AuthorID=${targetUserId}`);

        const targetMember = await interaction.guild.members.fetch(targetUserId).catch(() => null);

        if (!targetMember) return interaction.reply({ content: `Kullanıcı bulunamadı/erişilemiyor. (ID: ${targetUserId})`, ephemeral: false });
        if (targetMember.user.bot) return interaction.reply({ content: localConfig.messages.bot, ephemeral: false });

        if (targetMember.roles.cache.has(localConfig.roles.unregistered)) {
            const roleName = interaction.guild.roles.cache.get(localConfig.roles.unregistered)?.name || "Bilinmiyor";
            return interaction.reply({ content: localConfig.messages.zatenKayitsiz(targetMember.id, roleName), ephemeral: false });
        }

        await targetMember.roles.remove([localConfig.roles.newMember, localConfig.roles.verifiedMember]);
        await targetMember.roles.add(localConfig.roles.unregistered);
        await interaction.reply({ content: localConfig.messages.kayitSilindi(targetMember.id, interaction.user.id), ephemeral: false });
    }
};
