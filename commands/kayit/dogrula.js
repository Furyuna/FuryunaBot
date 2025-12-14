const { SlashCommandBuilder } = require('discord.js');
const localConfig = require('./config.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName(localConfig.commands.dogrula.slash)
        .setDescription(localConfig.commands.dogrula.description)
        .addUserOption(option => option.setName('kullanici').setDescription('Kullanıcı').setRequired(true))
        .setDefaultMemberPermissions(0),

    aliases: localConfig.commands.dogrula.aliases,

    async execute(interaction) {
        const memberRoles = interaction.member.roles.cache;
        if (!localConfig.staffRoles.some(r => memberRoles.has(r)) && !interaction.member.permissions.has('Administrator'))
            return interaction.reply({ content: localConfig.messages.yetkiYok, ephemeral: true });

        const targetUser = interaction.options.getUser('kullanici');
        if (targetUser.bot) return interaction.reply({ content: localConfig.messages.bot, ephemeral: true });

        const targetMember = await interaction.guild.members.fetch(targetUser.id).catch(() => null);
        if (!targetMember) return interaction.reply({ content: "Kullanıcı bulunamadı/erişilemiyor.", ephemeral: true });

        // --- DOĞRULAMA (YAP) ---
        if (targetMember.roles.cache.has(localConfig.roles.verifiedMember)) {
            const roleName = interaction.guild.roles.cache.get(localConfig.roles.verifiedMember)?.name || "Bilinmiyor";
            return interaction.reply({ content: localConfig.messages.zatenDogrulanmis(targetUser.id, roleName), ephemeral: true });
        }

        await targetMember.roles.remove([localConfig.roles.newMember, localConfig.roles.unregistered]);
        await targetMember.roles.add(localConfig.roles.verifiedMember);
        await interaction.reply({ content: localConfig.messages.dogrulamaBasarili(targetUser.id, interaction.user.id) });
    },

    async executePrefix(message, args) {
        const memberRoles = message.member.roles.cache;
        if (!localConfig.staffRoles.some(r => memberRoles.has(r)) && !message.member.permissions.has('Administrator'))
            return message.reply(localConfig.messages.yetkiYok);

        const targetUser = message.mentions.users.first();
        if (!targetUser) return message.reply(localConfig.messages.kullanimHatasi);
        if (targetUser.bot) return message.reply(localConfig.messages.bot);

        const targetMember = await message.guild.members.fetch(targetUser.id).catch(() => null);
        if (!targetMember) return message.reply("Kullanıcı bulunamadı/erişilemiyor.");

        if (targetMember.roles.cache.has(localConfig.roles.verifiedMember)) {
            const roleName = message.guild.roles.cache.get(localConfig.roles.verifiedMember)?.name || "Bilinmiyor";
            return message.reply(localConfig.messages.zatenDogrulanmis(targetUser.id, roleName));
        }

        await targetMember.roles.remove([localConfig.roles.newMember, localConfig.roles.unregistered]);
        await targetMember.roles.add(localConfig.roles.verifiedMember);
        message.reply(localConfig.messages.dogrulamaBasarili(targetUser.id, message.author.id));
    }
};