const { SlashCommandBuilder } = require('discord.js');
const localConfig = require('./config.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName(localConfig.commands.dogrulamaSil.slash)
        .setDescription(localConfig.commands.dogrulamaSil.description)
        .addUserOption(option => option.setName('kullanici').setDescription('Kullanıcı').setRequired(true))
        .setDefaultMemberPermissions(0),

    aliases: localConfig.commands.dogrulamaSil.aliases,

    async execute(interaction) {
        const memberRoles = interaction.member.roles.cache;
        if (!localConfig.staffRoles.some(r => memberRoles.has(r)) && !interaction.member.permissions.has('Administrator') && !interaction.member.permissions.has('ManageRoles'))
            return interaction.reply({ content: localConfig.messages.yetkiYok, ephemeral: true });

        const targetUser = interaction.options.getUser('kullanici');
        if (targetUser.bot) return interaction.reply({ content: localConfig.messages.bot, ephemeral: true });

        const targetMember = await interaction.guild.members.fetch(targetUser.id).catch(() => null);
        if (!targetMember) return interaction.reply({ content: "Kullanıcı bulunamadı/erişilemiyor.", ephemeral: true });

        // --- DOĞRULAMA SİL ---
        if (!targetMember.roles.cache.has(localConfig.roles.verifiedMember)) {
            // Hangi role sahip olduğunu bul (Öncelik: Verified > New > Unregistered)
            // Ancak verified olmadığı için zaten buradayız. O yüzden New > Unregistered.
            let currentRoleId = null;
            if (targetMember.roles.cache.has(localConfig.roles.newMember)) currentRoleId = localConfig.roles.newMember;
            else if (targetMember.roles.cache.has(localConfig.roles.unregistered)) currentRoleId = localConfig.roles.unregistered;

            const roleName = currentRoleId ? interaction.guild.roles.cache.get(currentRoleId)?.name : "Rol Bulunamadı";
            return interaction.reply({ content: localConfig.messages.zatenDogrulanmamis(targetUser.id, roleName), ephemeral: true });
        }

        await targetMember.roles.remove(localConfig.roles.verifiedMember);
        await targetMember.roles.add(localConfig.roles.newMember);
        await interaction.reply({ content: localConfig.messages.dogrulamaSilindi(targetUser.id, interaction.user.id) });
    },

    async executePrefix(message, args) {
        const memberRoles = message.member.roles.cache;
        if (!localConfig.staffRoles.some(r => memberRoles.has(r)) && !message.member.permissions.has('Administrator') && !message.member.permissions.has('ManageRoles'))
            return message.reply(localConfig.messages.yetkiYok);

        const targetUser = message.mentions.users.first();
        if (!targetUser) return message.reply(localConfig.messages.kullanimHatasi);
        if (targetUser.bot) return message.reply(localConfig.messages.bot);

        const targetMember = await message.guild.members.fetch(targetUser.id).catch(() => null);
        if (!targetMember) return message.reply("Kullanıcı bulunamadı/erişilemiyor.");

        if (!targetMember.roles.cache.has(localConfig.roles.verifiedMember)) {
            let currentRoleId = null;
            if (targetMember.roles.cache.has(localConfig.roles.newMember)) currentRoleId = localConfig.roles.newMember;
            else if (targetMember.roles.cache.has(localConfig.roles.unregistered)) currentRoleId = localConfig.roles.unregistered;

            const roleName = currentRoleId ? message.guild.roles.cache.get(currentRoleId)?.name : "Rol Bulunamadı";
            return message.reply(localConfig.messages.zatenDogrulanmamis(targetUser.id, roleName));
        }

        await targetMember.roles.remove(localConfig.roles.verifiedMember);
        await targetMember.roles.add(localConfig.roles.newMember);
        message.reply(localConfig.messages.dogrulamaSilindi(targetUser.id, message.author.id));
    }
};
