const { ContextMenuCommandBuilder, ApplicationCommandType, PermissionFlagsBits } = require('discord.js');
const localConfig = require('./config.js');

module.exports = {
    data: new ContextMenuCommandBuilder()
        .setName(localConfig.commands.kayitSil.menuName)
        .setType(ApplicationCommandType.User)
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

    async execute(interaction) {
        const memberRoles = interaction.member.roles.cache;
        if (!localConfig.staffRoles.some(r => memberRoles.has(r)) && !interaction.member.permissions.has('Administrator') && !interaction.member.permissions.has('ManageRoles'))
            return interaction.reply({ content: localConfig.messages.yetkiYok, ephemeral: false });

        const targetMember = await interaction.guild.members.fetch(interaction.targetId).catch(() => null);
        if (!targetMember) return interaction.reply({ content: "Kullanıcı bulunamadı/erişilemiyor.", ephemeral: false });
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