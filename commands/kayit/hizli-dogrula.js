const { ContextMenuCommandBuilder, ApplicationCommandType, PermissionFlagsBits } = require('discord.js');
const localConfig = require('./config.js');

module.exports = {
    data: new ContextMenuCommandBuilder()
        .setName(localConfig.commands.dogrula.menuName)
        .setType(ApplicationCommandType.User)
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

    async execute(interaction) {
        const memberRoles = interaction.member.roles.cache;
        if (!localConfig.staffRoles.some(r => memberRoles.has(r)) && !interaction.member.permissions.has('Administrator') && !interaction.member.permissions.has('ManageRoles'))
            return interaction.reply({ content: localConfig.messages.yetkiYok, ephemeral: true });

        const targetMember = await interaction.guild.members.fetch(interaction.targetId).catch(() => null);
        if (!targetMember) return interaction.reply({ content: "Kullanıcı bulunamadı/erişilemiyor.", ephemeral: true });
        if (targetMember.user.bot) return interaction.reply({ content: localConfig.messages.bot, ephemeral: true });

        if (targetMember.roles.cache.has(localConfig.roles.verifiedMember)) {
            const roleName = interaction.guild.roles.cache.get(localConfig.roles.verifiedMember)?.name || "Bilinmiyor";
            return interaction.reply({ content: localConfig.messages.zatenDogrulanmis(targetMember.id, roleName), ephemeral: false });
        }

        const wasUnregistered = targetMember.roles.cache.has(localConfig.roles.unregistered);

        await targetMember.roles.remove([localConfig.roles.newMember, localConfig.roles.unregistered]);
        await targetMember.roles.add(localConfig.roles.verifiedMember);

        if (wasUnregistered) {
            await interaction.reply({ content: localConfig.messages.kayitVeDogrulamaBasarili(targetMember.id, interaction.user.id), ephemeral: false });
        } else {
            await interaction.reply({ content: localConfig.messages.dogrulamaBasarili(targetMember.id, interaction.user.id), ephemeral: false });
        }
    }
};