const { Events } = require('discord.js');

module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {
		// BUTON ETKİLEŞİMLERİ
		if (interaction.isButton()) {
			const db = require('../utils/database.js');
			const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

			const customId = interaction.customId;

			try {
				// 1. "Bana da Hatırlat" Butonu
				if (customId === 'bump_remind_me') {
					db.addToBumpQueue(interaction.user.id);
					await interaction.reply({
						content: '✅ **Listeye Eklendin!**\nBir sonraki Bump zamanı geldiğinde seni etiketleyerek haber vereceğim.',
						ephemeral: true
					});
				}

				// 2. "Ayarlar" Butonu (Menüyü Göster)
				else if (customId === 'bump_settings') {
					const settings = db.getBumpSettings(interaction.user.id);
					await showBumpSettingsMenu(interaction, settings);
				}

				// 3. Ayar Değiştirme: "Bump Yaptığımda Beni Pingle" (Eski Toggle, menüden)
				else if (customId === 'bump_toggle_action') {
					const settings = db.getBumpSettings(interaction.user.id);
					const newValue = settings.ping_on_bump_action === 1 ? 0 : 1;
					db.setBumpSetting(interaction.user.id, 'ping_on_bump_action', newValue);

					// Menüyü Güncelle
					settings.ping_on_bump_action = newValue; // local update for display
					await showBumpSettingsMenu(interaction, settings, true); // update
				}

				const funnyWarns = [
					"Hop hemşerim nereye? Bu buton senin değil! 🛑",
					"Elini oradan çek yoksa polis çağırırım! 👮",
					"Başkalarının ayarlarıyla oynamak ayıptır, günahtır... 😤",
					"Sadece ilgili kişi basabilir buna. Sen basamazsın! 😝",
					"Yanlış butona bastın, kendini imha başlatılıyor... 3.. 2.. 1.. 💥 (Şaka şaka)",
					"Burası senin çöplüğün değil evlat. 🤠"
				];

				// 3.1 Hızlı Toggle: "Beni Pingleme" (Kırmızı Buton) -> Yeşile Dön
				if (customId.startsWith('bump_toggle_ping_off_')) {
					const targetId = customId.replace('bump_toggle_ping_off_', '');
					if (interaction.user.id !== targetId) {
						const randomWarn = funnyWarns[Math.floor(Math.random() * funnyWarns.length)];
						return interaction.reply({ content: randomWarn, ephemeral: true });
					}

					db.setBumpSetting(interaction.user.id, 'ping_on_bump_action', 0);

					// YENİ BUTON: Yeşil (Aç)
					const newRow = new ActionRowBuilder().addComponents(
						new ButtonBuilder()
							.setCustomId(`bump_toggle_ping_on_${targetId}`)
							.setLabel('🔔 Beni Etiketlemeyi Aç')
							.setStyle(ButtonStyle.Success)
					);

					// Butonu güncelle + Bilgi ver
					await interaction.update({ components: [newRow] });
					await interaction.followUp({ content: 'Tamamdır, seni bir daha pinglemiyorum. 🔕', ephemeral: true });
				}

				// 3.2 Hızlı Toggle: "Beni Pingle" (Yeşil Buton) -> Kırmızıya Dön
				else if (customId.startsWith('bump_toggle_ping_on_')) {
					const targetUserId = customId.split('bump_toggle_ping_on_')[1];

					// Doğrulama: Sadece ilgili kişi basabilir
					if (interaction.user.id !== targetUserId) {
						const randomWarn = funnyWarns[Math.floor(Math.random() * funnyWarns.length)];
						return interaction.reply({
							content: randomWarn,
							ephemeral: true
						});
					}

					db.setBumpSetting(interaction.user.id, 'ping_on_bump_action', 1);

					// YENİ BUTON: Kırmızı (Kapat)
					const newRow = new ActionRowBuilder().addComponents(
						new ButtonBuilder()
							.setCustomId(`bump_toggle_ping_off_${targetUserId}`)
							.setLabel('🔕 Beni Etiketlemeyi Kapat')
							.setStyle(ButtonStyle.Danger)
					);

					// Butonu güncelle + Bilgi ver
					await interaction.update({ components: [newRow] });
					await interaction.followUp({ content: 'Süper! Artık hatırlatmalarda seni etiketleyeceğim. 🔔', ephemeral: true });
				}

				// 4. İTİRAF SİSTEMİ - Ana Modal Açıcı
				else if (customId === 'btn_confess') {
					const modal = new ModalBuilder()
						.setCustomId('modal_confess')
						.setTitle('Gizli İtiraf');

					const confessionInput = new TextInputBuilder()
						.setCustomId('input_confession')
						.setLabel("İtirafın nedir?")
						.setPlaceholder("İçini dök... Her şey aramızda kalacak.")
						.setStyle(TextInputStyle.Paragraph)
						.setMinLength(3)
						.setMaxLength(3000)
						.setRequired(true);

					const actionRow = new ActionRowBuilder().addComponents(confessionInput);
					modal.addComponents(actionRow);

					await interaction.showModal(modal);
				}

				// 4.5 İTİRAF SİSTEMİ - Yanıt Modal Açıcı
				else if (customId === 'btn_reply_confess') {
					const modal = new ModalBuilder()
						.setCustomId(`modal_reply_confess:${interaction.message.id}`)
						.setTitle('Anonim Yanıt');

					const replyInput = new TextInputBuilder()
						.setCustomId('input_reply')
						.setLabel("Yanıtın nedir?")
						.setPlaceholder("Cevabını yaz. Her şey gizli.")
						.setStyle(TextInputStyle.Paragraph)
						.setMinLength(3)
						.setMaxLength(3000)
						.setRequired(true);

					const actionRow = new ActionRowBuilder().addComponents(replyInput);
					modal.addComponents(actionRow);

					await interaction.showModal(modal);
				}

			} catch (error) {
				console.error("Buton Hatası:", error);
				await interaction.reply({ content: 'Bir hata oluştu.', ephemeral: true }).catch(() => { });
			}
			return;
		}


		// MODAL KLAVYEDEN GİRİŞ
		if (interaction.isModalSubmit()) {
			// YAZ MODALI (Basit Versiyon)
			if (interaction.customId.startsWith('yaz_modal:')) {
				const parts = interaction.customId.split(':');
				const channelId = parts[1];

				const content = interaction.fields.getTextInputValue('message_content');
				const replyIdInput = interaction.fields.getTextInputValue('message_reply_id');

				const channel = interaction.client.channels.cache.get(channelId);
				if (!channel) return interaction.reply({ content: '❌ Kanal bulunamadı!', ephemeral: true });

				try {
					const payload = { content: content };

					if (replyIdInput && replyIdInput.length > 10) {
						try {
							const targetMsg = await channel.messages.fetch(replyIdInput.trim());
							if (targetMsg) await targetMsg.reply(payload);
							else await channel.send(payload);
						} catch (e) {
							await channel.send(payload);
						}
					} else {
						await channel.send(payload);
					}

					await interaction.reply({ content: `✅ Mesaj <#${channelId}> kanalına gönderildi.`, ephemeral: true });

				} catch (error) {
					console.error(error);
					await interaction.reply({ content: '❌ Gönderim sırasında hata oluştu.', ephemeral: true });
				}
				return;
			}

			// BUMP NAG MODALI
			if (interaction.customId === 'bump_nag_modal') {
				const db = require('../utils/database.js');
				const inputValue = interaction.fields.getTextInputValue('nag_count_input');
				let count = parseInt(inputValue);

				if (isNaN(count)) {
					return interaction.reply({ content: '❌ Lütfen geçerli bir sayı girin!', ephemeral: true });
				}

				db.setBumpSetting(interaction.user.id, 'nag_limit', count);

				const settings = db.getBumpSettings(interaction.user.id);
				await interaction.deferReply({ ephemeral: true });
				await showBumpSettingsMenu(interaction, settings, false);
				return;
			}

			// İTİRAF SİSTEMİ - Ana Modal Gönderimi
			if (interaction.customId === 'modal_confess') {
				await interaction.deferUpdate().catch(() => { });

				const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
				const confessionText = interaction.fields.getTextInputValue('input_confession');
				const targetChannelId = '1490335418426589427';
				const targetChannel = interaction.client.channels.cache.get(targetChannelId);

				if (!targetChannel) return;

				const embed = new EmbedBuilder()
					.setTitle('💭 Yeni Bir İtiraf Geldi!')
					.setDescription(`"${confessionText}"`)
					.setColor('#ff4757');

				// Resim eklentisi (varsa)
				const imageRegex = /https?:\/\/[^\s]+\.(png|jpg|jpeg|gif|webp)(\?.*)?/i;
				const match = confessionText.match(imageRegex);
				if (match) {
					embed.setImage(match[0]);
				}

				const row = new ActionRowBuilder().addComponents(
					new ButtonBuilder()
						.setCustomId('btn_confess')
						.setLabel('Yeni İtiraf 🤫')
						.setStyle(ButtonStyle.Primary)
						.setEmoji('✉️'),
					new ButtonBuilder()
						.setCustomId('btn_reply_confess')
						.setLabel('Yanıtla 💬')
						.setStyle(ButtonStyle.Secondary)
				);

				const sentMessage = await targetChannel.send({ embeds: [embed], components: [row] }).catch(console.error);

				// Log Sistemi (Adminler İçin)
				const logChannelId = '1462555623328710907';
				const logChannel = interaction.client.channels.cache.get(logChannelId);
				if (logChannel && sentMessage) {
					const logEmbed = new EmbedBuilder()
						.setTitle('🚨 Yeni İtiraf Logu')
						.setColor('#2b2d31')
						.setDescription(`**Mesaj İçeriği:**\n\`\`\`text\n${confessionText}\n\`\`\``)
						.setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) });

					// Sadece Metin/Link Olarak Tespit Edilen Görseli Alt Başlığa Yaz (Logun içinde renderlanmaz)
					if (match) logEmbed.addFields({ name: '🖼️ Tespit Edilen Görsel', value: match[0], inline: false });

					logEmbed.addFields(
						{ name: '👤 Gönderen', value: `<@${interaction.user.id}> (\`${interaction.user.id}\`)`, inline: false },
						{ name: '📄 İşlem Tipi', value: 'Yeni İtiraf', inline: false },
						{ name: '🔗 İtiraf Linki', value: `[Mesaja Git](${sentMessage.url})`, inline: false }
					).setTimestamp();

					await logChannel.send({ embeds: [logEmbed] }).catch(console.error);
				}

				return;
			}

			// İTİRAF SİSTEMİ - Yanıt (Reply) Modal Gönderimi
			if (interaction.customId.startsWith('modal_reply_confess:')) {
				await interaction.deferUpdate().catch(() => { });

				const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
				const messageId = interaction.customId.split(':')[1];
				const replyText = interaction.fields.getTextInputValue('input_reply');
				const targetChannelId = '1490335418426589427';
				const targetChannel = interaction.client.channels.cache.get(targetChannelId);

				if (!targetChannel) return;

				const replyEmbed = new EmbedBuilder()
					.setTitle('💬 İtirafa Yanıt Geldi!')
					.setDescription(`"${replyText}"`)
					.setColor('#3498db');

				// Resim eklentisi (varsa)
				const imageRegex = /https?:\/\/[^\s]+\.(png|jpg|jpeg|gif|webp)(\?.*)?/i;
				const match = replyText.match(imageRegex);
				if (match) {
					replyEmbed.setImage(match[0]);
				}

				const row = new ActionRowBuilder().addComponents(
					new ButtonBuilder()
						.setCustomId('btn_confess')
						.setLabel('Yeni İtiraf 🤫')
						.setStyle(ButtonStyle.Primary)
						.setEmoji('✉️'),
					new ButtonBuilder()
						.setCustomId('btn_reply_confess')
						.setLabel('Yanıtla 💬')
						.setStyle(ButtonStyle.Secondary)
				);

				const sentMessage = await targetChannel.send({
					embeds: [replyEmbed],
					components: [row],
					reply: { messageReference: messageId }
				}).catch(console.error);

				// Log Sistemi (Adminler İçin)
				const logChannelId = '1462555623328710907';
				const logChannel = interaction.client.channels.cache.get(logChannelId);
				if (logChannel && sentMessage) {
					const logEmbed = new EmbedBuilder()
						.setTitle('🚨 İtiraf Yanıt Logu')
						.setColor('#3498db')
						.setDescription(`**Mesaj İçeriği:**\n\`\`\`text\n${replyText}\n\`\`\``)
						.setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) });

					// Sadece Metin/Link Olarak Tespit Edilen Görseli Alt Başlığa Yaz (Logun içinde renderlanmaz)
					if (match) logEmbed.addFields({ name: '🖼️ Tespit Edilen Görsel', value: match[0], inline: false });

					logEmbed.addFields(
						{ name: '👤 Gönderen', value: `<@${interaction.user.id}> (\`${interaction.user.id}\`)`, inline: false },
						{ name: '📄 İşlem Tipi', value: `Yanıt (Hedef Mesaj: \`${messageId}\`)`, inline: false },
						{ name: '🔗 İtiraf Linki', value: `[Mesaja Git](${sentMessage.url})`, inline: false }
					).setTimestamp();

					await logChannel.send({ embeds: [logEmbed] }).catch(console.error);
				}

				return;
			}

			return;
		}

		// SLASH KOMUTLARI
		if (!interaction.isChatInputCommand() && !interaction.isContextMenuCommand()) return;

		let commandKey = interaction.commandName;

		if (interaction.isContextMenuCommand()) {
			commandKey = `${interaction.commandName}_${interaction.commandType}`;
		}

		const command = interaction.client.commands.get(commandKey);

		if (!command) {
			console.error(`${interaction.commandName} komutu bulunamadı.`);
			return;
		}

		try {
			await command.execute(interaction);
		} catch (error) {
			console.error(error);
			if (interaction.replied || interaction.deferred) {
				await interaction.followUp({ content: 'Bu komutu çalıştırırken bir hata oluştu!', ephemeral: true });
			} else {
				await interaction.reply({ content: 'Bu komutu çalıştırırken bir hata oluştu!', ephemeral: true });
			}
		}
	},
};

// Yardımcı Fonksiyon: Ayar Menüsünü Göster/Güncelle
async function showBumpSettingsMenu(interaction, settings, isUpdate = false) {
	const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');

	const embed = new EmbedBuilder()
		.setTitle('⚙️ Bump Hatırlatıcı Ayarları')
		.setDescription('Kişisel tercihlerinizi buradan yapılandırabilirsiniz.')
		.setColor('#2B2D31')
		.addFields(
			{
				name: '📢 Bump Yaptığımda',
				value: settings.ping_on_bump_action ? '✅ **Beni Etiketle**' : '❌ **Sessiz Kal**',
				inline: true
			}
		);

	const row1 = new ActionRowBuilder().addComponents(
		new ButtonBuilder()
			.setCustomId('bump_toggle_action')
			.setLabel(settings.ping_on_bump_action ? 'Etiketlemeyi Kapat' : 'Etiketlemeyi Aç')
			.setStyle(settings.ping_on_bump_action ? ButtonStyle.Danger : ButtonStyle.Success)
	);

	if (isUpdate) {
		await interaction.update({ embeds: [embed], components: [row1] });
	} else {
		await interaction.reply({ embeds: [embed], components: [row1], ephemeral: true });
	}
}
