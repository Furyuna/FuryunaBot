const { ContextMenuCommandBuilder, ApplicationCommandType, PermissionFlagsBits } = require('discord.js');
const localConfig = require('./config.js');

module.exports = {
    data: new ContextMenuCommandBuilder()
        .setName(localConfig.commands.dogrulamaSil.menuName)
        .setType(ApplicationCommandType.User)
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

    async execute(interaction) {
        const memberRoles = interaction.member.roles.cache;
        if (!localConfig.staffRoles.some(r => memberRoles.has(r)) && !interaction.member.permissions.has('Administrator') && !interaction.member.permissions.has('ManageRoles'))
            return interaction.reply({ content: localConfig.messages.yetkiYok, ephemeral: false });

        const targetMember = await interaction.guild.members.fetch(interaction.targetId).catch(() => null);
        if (!targetMember) return interaction.reply({ content: "Kullanıcı bulunamadı/erişilemiyor.", ephemeral: false });
        if (targetMember.user.bot) return interaction.reply({ content: localConfig.messages.bot, ephemeral: false });

        if (!targetMember.roles.cache.has(localConfig.roles.verifiedMember)) {
            let currentRoleId = null;
            if (targetMember.roles.cache.has(localConfig.roles.newMember)) currentRoleId = localConfig.roles.newMember;
            else if (targetMember.roles.cache.has(localConfig.roles.unregistered)) currentRoleId = localConfig.roles.unregistered;

            const roleName = currentRoleId ? interaction.guild.roles.cache.get(currentRoleId)?.name : "Rol Bulunamadı";
            return interaction.reply({ content: localConfig.messages.zatenDogrulanmamis(targetMember.id, roleName), ephemeral: false });
        }

        await targetMember.roles.remove(localConfig.roles.verifiedMember);
        await targetMember.roles.add(localConfig.roles.newMember);
        await interaction.reply({ content: localConfig.messages.dogrulamaSilindi(targetMember.id, interaction.user.id), ephemeral: false });
    }
};