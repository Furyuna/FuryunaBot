const { SlashCommandBuilder } = require('discord.js');
const localConfig = require('./config.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName(localConfig.commands.kayit.slash)
        .setDescription(localConfig.commands.kayit.description)
        .addUserOption(option => option.setName('kullanici').setDescription('Kullanıcı').setRequired(true))
        .setDefaultMemberPermissions(0),

    aliases: localConfig.commands.kayit.aliases,

    async execute(interaction) {
        const memberRoles = interaction.member.roles.cache;
        if (!localConfig.staffRoles.some(r => memberRoles.has(r)) && !interaction.member.permissions.has('Administrator') && !interaction.member.permissions.has('ManageRoles'))
            return interaction.reply({ content: localConfig.messages.yetkiYok, ephemeral: false });

        const targetUser = interaction.options.getUser('kullanici');
        if (targetUser.bot) return interaction.reply({ content: localConfig.messages.bot, ephemeral: false });

        const targetMember = await interaction.guild.members.fetch(targetUser.id).catch(() => null);
        if (!targetMember) return interaction.reply({ content: "Kullanıcı bulunamadı/erişilemiyor.", ephemeral: false });

        if (targetMember.roles.cache.has(localConfig.roles.newMember) || targetMember.roles.cache.has(localConfig.roles.verifiedMember)) {
            const currentRoleId = targetMember.roles.cache.has(localConfig.roles.verifiedMember) ? localConfig.roles.verifiedMember : localConfig.roles.newMember;
            const roleName = interaction.guild.roles.cache.get(currentRoleId)?.name || "Bilinmiyor";
            return interaction.reply({ content: localConfig.messages.zatenKayitli(targetUser.id, roleName), ephemeral: false });
        }

        await targetMember.roles.remove(localConfig.roles.unregistered);
        await targetMember.roles.add(localConfig.roles.newMember);

        await interaction.reply({ content: localConfig.messages.kayitBasarili(targetUser.id, interaction.user.id) });
    },

    async executePrefix(message, args) {
        // !kayıt @user
        const memberRoles = message.member.roles.cache;
        if (!localConfig.staffRoles.some(r => memberRoles.has(r)) && !message.member.permissions.has('Administrator') && !message.member.permissions.has('ManageRoles'))
            return message.reply(localConfig.messages.yetkiYok);

        const targetUser = message.mentions.users.first();
        if (!targetUser) return message.reply(localConfig.messages.kullanimHatasi);

        const targetMember = await message.guild.members.fetch(targetUser.id).catch(() => null);
        if (!targetMember) return message.reply("Kullanıcı bulunamadı.");

        if (targetMember.roles.cache.has(localConfig.roles.newMember) || targetMember.roles.cache.has(localConfig.roles.verifiedMember)) {
            const currentRoleId = targetMember.roles.cache.has(localConfig.roles.verifiedMember) ? localConfig.roles.verifiedMember : localConfig.roles.newMember;
            const roleName = message.guild.roles.cache.get(currentRoleId)?.name || "Bilinmiyor";
            return message.reply(localConfig.messages.zatenKayitli(targetUser.id, roleName));
        }

        await targetMember.roles.remove(localConfig.roles.unregistered);
        await targetMember.roles.add(localConfig.roles.newMember);

        message.reply(localConfig.messages.kayitBasarili(targetUser.id, message.author.id));
    }
};