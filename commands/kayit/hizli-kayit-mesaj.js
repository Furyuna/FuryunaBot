const { ContextMenuCommandBuilder, ApplicationCommandType, PermissionFlagsBits } = require('discord.js');
const localConfig = require('./config.js');

module.exports = {
    data: new ContextMenuCommandBuilder()
        .setName(localConfig.commands.kayit.menuName)
        .setType(ApplicationCommandType.Message)
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

    async execute(interaction) {
        const memberRoles = interaction.member.roles.cache;
        if (!localConfig.staffRoles.some(r => memberRoles.has(r)) && !interaction.member.permissions.has('Administrator') && !interaction.member.permissions.has('ManageRoles'))
            return interaction.reply({ content: localConfig.messages.yetkiYok, ephemeral: true });

        // MESAJ BAĞLAMI: Mesajın sahibini alıyoruz
        if (!interaction.targetMessage) {
            console.log(`[DEBUG] targetMessage is undefined! TargetId: ${interaction.targetId}`);
            return interaction.reply({ content: "Hata: Mesaj verisine ulaşılamadı.", ephemeral: true });
        }

        const targetUserId = interaction.targetMessage.author.id;
        console.log(`[DEBUG] Hızlı Kayıt Mesaj: MsgID=${interaction.targetId}, AuthorID=${targetUserId}`);

        const targetMember = await interaction.guild.members.fetch(targetUserId).catch(err => {
            console.error('[DEBUG] Member Fetch Error:', err);
            return null;
        });

        if (!targetMember) return interaction.reply({ content: `Kullanıcı bulunamadı/erişilemiyor. (ID: ${targetUserId})`, ephemeral: true });
        if (targetMember.user.bot) return interaction.reply({ content: localConfig.messages.bot, ephemeral: true });

        if (targetMember.roles.cache.has(localConfig.roles.newMember) || targetMember.roles.cache.has(localConfig.roles.verifiedMember)) {
            const currentRoleId = targetMember.roles.cache.has(localConfig.roles.verifiedMember) ? localConfig.roles.verifiedMember : localConfig.roles.newMember;
            const roleName = interaction.guild.roles.cache.get(currentRoleId)?.name || "Bilinmiyor";
            return interaction.reply({ content: localConfig.messages.zatenKayitli(targetMember.id, roleName), ephemeral: false });
        }

        await targetMember.roles.add(localConfig.roles.newMember);
        await targetMember.roles.remove(localConfig.roles.unregistered);
        await interaction.reply({ content: localConfig.messages.kayitBasarili(targetMember.id, interaction.user.id), ephemeral: false });
    }
};
