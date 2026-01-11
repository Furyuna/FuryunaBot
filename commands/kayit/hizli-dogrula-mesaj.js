const { ContextMenuCommandBuilder, ApplicationCommandType, PermissionFlagsBits } = require('discord.js');
const localConfig = require('./config.js');

module.exports = {
    data: new ContextMenuCommandBuilder()
        .setName(localConfig.commands.dogrula.menuName)
        .setType(ApplicationCommandType.Message)
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

    async execute(interaction) {
        const memberRoles = interaction.member.roles.cache;
        if (!localConfig.staffRoles.some(r => memberRoles.has(r)) && !interaction.member.permissions.has('Administrator') && !interaction.member.permissions.has('BanMembers'))
            return interaction.reply({ content: localConfig.messages.yetkiYok, ephemeral: false });

        // MESAJ BAĞLAMI
        if (!interaction.targetMessage) return interaction.reply({ content: "Hata: Mesaj verisine ulaşılamadı.", ephemeral: false });
        const targetUserId = interaction.targetMessage.author.id;
        console.log(`[DEBUG] Hızlı Doğrula Mesaj: AuthorID=${targetUserId}`);

        const targetMember = await interaction.guild.members.fetch(targetUserId).catch(() => null);

        if (!targetMember) return interaction.reply({ content: `Kullanıcı bulunamadı/erişilemiyor. (ID: ${targetUserId})`, ephemeral: false });
        if (targetMember.user.bot) return interaction.reply({ content: localConfig.messages.bot, ephemeral: false });

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
