const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const localConfig = require('./config.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName(localConfig.commands.kayitSil.slash)
        .setDescription(localConfig.commands.kayitSil.description)
        .addUserOption(option => option.setName('kullanici').setDescription('Kullanıcı').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

    aliases: localConfig.commands.kayitSil.aliases,

    async execute(interaction) {
        const memberRoles = interaction.member.roles.cache;
        if (!localConfig.staffRoles.some(r => memberRoles.has(r)) && !interaction.member.permissions.has('Administrator') && !interaction.member.permissions.has('BanMembers'))
            return interaction.reply({ content: localConfig.messages.yetkiYok, ephemeral: false });

        const targetUser = interaction.options.getUser('kullanici');
        if (targetUser.bot) return interaction.reply({ content: localConfig.messages.bot, ephemeral: false });

        const targetMember = await interaction.guild.members.fetch(targetUser.id).catch(() => null);
        if (!targetMember) return interaction.reply({ content: "Kullanıcı bulunamadı/erişilemiyor.", ephemeral: false });

        if (!targetMember.roles.cache.has(localConfig.roles.newMember) && !targetMember.roles.cache.has(localConfig.roles.verifiedMember)) {
            const currentRoleId = targetMember.roles.cache.has(localConfig.roles.unregistered) ? localConfig.roles.unregistered : "Bilinmiyor";
            //const roleName = interaction.guild.roles.cache.get(currentRoleId)?.name || "Bilinmiyor";
            return interaction.reply({ content: localConfig.messages.zatenKayitsiz(targetUser.id, "Kayıtsız/Bilinmiyor"), ephemeral: false });
        }


        await targetMember.roles.remove([localConfig.roles.newMember, localConfig.roles.verifiedMember]);
        await targetMember.roles.add(localConfig.roles.unregistered);

        await interaction.reply({ content: localConfig.messages.kayitSilindi(targetUser.id, interaction.user.id) });
    },

    async executePrefix(message, args) {
        const memberRoles = message.member.roles.cache;
        if (!localConfig.staffRoles.some(r => memberRoles.has(r)) && !message.member.permissions.has('Administrator') && !message.member.permissions.has('BanMembers'))
            return message.reply(localConfig.messages.yetkiYok);

        const targetUser = message.mentions.users.first();
        if (!targetUser) return message.reply(localConfig.messages.kullanimHatasi);

        const targetMember = await message.guild.members.fetch(targetUser.id).catch(() => null);
        if (!targetMember) return message.reply("Kullanıcı bulunamadı/erişilemiyor.");

        if (targetMember.roles.cache.has(localConfig.roles.unregistered)) {
            const roleName = message.guild.roles.cache.get(localConfig.roles.unregistered)?.name || "Bilinmiyor";
            return message.reply(localConfig.messages.zatenKayitsiz(targetUser.id, roleName));
        }

        await targetMember.roles.remove([localConfig.roles.newMember, localConfig.roles.verifiedMember]);
        await targetMember.roles.add(localConfig.roles.unregistered);

        message.reply(localConfig.messages.kayitSilindi(targetUser.id, message.author.id));
    }
};
