const { ContextMenuCommandBuilder, ApplicationCommandType, PermissionFlagsBits } = require('discord.js');
const localConfig = require('./config.js');

module.exports = {
    data: new ContextMenuCommandBuilder()
        .setName(localConfig.commands.dogrulamaSil.menuName)
        .setType(ApplicationCommandType.Message)
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

    async execute(interaction) {
        const memberRoles = interaction.member.roles.cache;
        if (!localConfig.staffRoles.some(r => memberRoles.has(r)) && !interaction.member.permissions.has('Administrator') && !interaction.member.permissions.has('BanMembers'))
            return interaction.reply({ content: localConfig.messages.yetkiYok, ephemeral: false });

        // MESAJ BAĞLAMI
        if (!interaction.targetMessage) return interaction.reply({ content: "Hata: Mesaj verisine ulaşılamadı.", ephemeral: false });
        const targetUserId = interaction.targetMessage.author.id;
        console.log(`[DEBUG] Hızlı Doğrulama Sil Mesaj: AuthorID=${targetUserId}`);

        const targetMember = await interaction.guild.members.fetch(targetUserId).catch(() => null);

        if (!targetMember) return interaction.reply({ content: `Kullanıcı bulunamadı/erişilemiyor. (ID: ${targetUserId})`, ephemeral: false });
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
