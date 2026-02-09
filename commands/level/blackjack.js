const { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, EmbedBuilder } = require('discord.js');
const db = require('../../utils/database.js');
const config = require('../etkinlik/config.js');

module.exports = {
    name: 'blackjack',
    aliases: ['bj', '21'],
    description: 'Blackjack (21) oyunu oynar.',
    async executePrefix(message, args) {
        // 1. Kanal Kontrolü
        if (config.gambling.allowedChannelId && message.channel.id !== config.gambling.allowedChannelId) {
            return;
        }

        const userId = message.author.id;
        const user = db.getUser(userId);

        // 2. Bahis Miktarı
        let bet = args[0];

        if (bet === 'hepsi' || bet === 'all') {
            bet = user.money;
        } else {
            bet = parseInt(bet);
        }

        if (isNaN(bet) || bet <= 0) {
            return message.reply('❌ Geçerli bir bahis miktarı girmelisin. (Örn: `!bj 100`)');
        }

        if (bet < config.gambling.minBet) {
            return message.reply(`❌ Minimum bahis miktarı: **${config.gambling.minBet} FCoin**`);
        }
        if (bet > config.gambling.maxBet) {
            return message.reply(`❌ Maksimum bahis miktarı: **${config.gambling.maxBet} FCoin**`);
        }
        if (user.money < bet) {
            return message.reply(`❌ Yetersiz bakiye! Cüzdanında sadece **${user.money} FCoin** var.`);
        }

        // Parayı çek (Başlangıç)
        db.addMoney(userId, -bet);
        let currentBet = bet;

        // --- OYUN MANTIĞI ---
        const suits = ['♠️', '♥️', '♦️', '♣️'];
        const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

        // Deste Oluştur
        let deck = [];
        for (const suit of suits) {
            for (const value of values) {
                deck.push({ suit, value });
            }
        }

        // Karıştır
        for (let i = deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }

        function drawCard() {
            return deck.pop();
        }

        function calculateScore(hand) {
            let score = 0;
            let aces = 0;

            for (const card of hand) {
                if (['J', 'Q', 'K'].includes(card.value)) {
                    score += 10;
                } else if (card.value === 'A') {
                    aces += 1;
                    score += 11;
                } else {
                    score += parseInt(card.value);
                }
            }

            while (score > 21 && aces > 0) {
                score -= 10;
                aces -= 1;
            }

            return score;
        }

        // Kart Formatı (Emoji)
        function formatHand(hand, hideFirst = false) {
            if (hideFirst) {
                // Diğer kartları göster, ilkini gizle
                const visibleCards = hand.slice(1).map(c => `[${c.suit} ${c.value}]`).join(' ');
                return `[ ☁️ ] ${visibleCards}`;
            }
            return hand.map(c => `[${c.suit} ${c.value}]`).join(' ');
        }

        let playerHand = [drawCard(), drawCard()];
        let dealerHand = [drawCard(), drawCard()];

        let playerScore = calculateScore(playerHand);
        let dealerScore = calculateScore(dealerHand);

        // Embed Güncelleme Fonksiyonu
        const updateEmbed = (isGameOver = false, resultText = null, color = '#2b2d31') => {
            const embed = new EmbedBuilder()
                .setTitle(`🃏 Blackjack | Bahis: ${currentBet} FCoin`)
                .setColor(color)
                .addFields(
                    {
                        name: '🕴️ Krupiye',
                        value: isGameOver
                            ? `⚪ ${dealerScore}\n${formatHand(dealerHand)}`
                            : `⚪ ?\n${formatHand(dealerHand, true)}`,
                        inline: false
                    },
                    {
                        name: `👤 ${message.author.username}`,
                        value: `🟢 ${playerScore}\n${formatHand(playerHand)}`,
                        inline: false
                    }
                )
                .setFooter({ text: 'Furyuna Casino', iconURL: message.guild.iconURL() });

            if (resultText) {
                embed.setDescription(`## ${resultText}`);
            }

            return embed;
        };

        // Instant Blackjack Check
        if (playerScore === 21) {
            let winAmount = 0;
            let resultText = "";
            let color = '#2b2d31';

            if (dealerScore === 21) {
                db.addMoney(userId, currentBet); // İade
                resultText = "🤝 Berabere! (Push)";
                color = '#FFFF00'; // Sarı
            } else {
                winAmount = Math.floor(currentBet * 2.5);
                db.addMoney(userId, winAmount);
                resultText = `🎉 BLACKJACK! **+${winAmount}** FCoin!`;
                color = '#00FF00'; // Yeşil
            }

            return message.reply({ embeds: [updateEmbed(true, resultText, color)] });
        }

        // Butonlar
        const getButtons = (canDouble = true) => {
            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder().setCustomId('hit').setLabel('Hit').setStyle(ButtonStyle.Success),
                    new ButtonBuilder().setCustomId('stand').setLabel('Stand').setStyle(ButtonStyle.Secondary)
                );

            if (canDouble) {
                row.addComponents(
                    new ButtonBuilder().setCustomId('double').setLabel('Double').setStyle(ButtonStyle.Danger)
                );
            }
            return row;
        };

        const gameMsg = await message.reply({
            embeds: [updateEmbed(false)],
            components: [getButtons(user.money >= currentBet)] // Double için para yetiyor mu?
        });

        const filter = i => i.user.id === userId;
        const collector = gameMsg.createMessageComponentCollector({ componentType: ComponentType.Button, filter, time: 60000 });

        collector.on('collect', async i => {
            if (i.customId === 'hit') {
                playerHand.push(drawCard());
                playerScore = calculateScore(playerHand);

                if (playerScore > 21) {
                    await i.update({ embeds: [updateEmbed(true, `💀 PATLADIN! (Bust) -${currentBet}`, '#FF0000')], components: [] });
                    collector.stop();
                } else if (playerScore === 21) {
                    collector.stop('auto_stand');
                } else {
                    await i.update({ embeds: [updateEmbed(false)], components: [getButtons(false)] }); // Artık double yapamaz
                }

            } else if (i.customId === 'stand') {
                collector.stop('stand');
            } else if (i.customId === 'double') {
                // Para çek
                if (user.money < currentBet) { // Kontrol (her ihtimale karşı)
                    return i.reply({ content: '❌ Yetersiz bakiye!', ephemeral: true });
                }

                db.addMoney(userId, -currentBet);
                currentBet *= 2; // Bahsi 2'ye katla

                // 1 Kart Çek ve Dur
                playerHand.push(drawCard());
                playerScore = calculateScore(playerHand);

                if (playerScore > 21) {
                    await i.update({ embeds: [updateEmbed(true, `💀 DOUBLE & BUST! -${currentBet}`, '#FF0000')], components: [] });
                    collector.stop();
                } else {
                    collector.stop('auto_stand');
                }
            }
        });

        collector.on('end', async (collected, reason) => {
            if (reason === 'time') {
                gameMsg.edit({ components: [] });
            }

            if (playerScore > 21) return; // Zaten bitti

            // Dealer Oynuyor
            // Eğer oyuncu Stand dediyse veya Double yapıp patlamadıysa
            // Basit animasyon efekti verilemediği için direkt sonucu gösteriyoruz.

            while (dealerScore < 17) {
                dealerHand.push(drawCard());
                dealerScore = calculateScore(dealerHand);
            }

            let resultText = "";
            let color = '#2b2d31';
            let winAmount = 0;

            if (dealerScore > 21) {
                winAmount = currentBet * 2;
                db.addMoney(userId, winAmount);
                resultText = `🎉 Krupiye Patladı! **+${winAmount}** FCoin`;
                color = '#00FF00';
            } else if (playerScore > dealerScore) {
                winAmount = currentBet * 2;
                db.addMoney(userId, winAmount);
                resultText = `🎉 Kazandın! **+${winAmount}** FCoin`;
                color = '#00FF00';
            } else if (dealerScore > playerScore) {
                resultText = `💀 Kaybettin... -${currentBet}`;
                color = '#FF0000';
            } else {
                db.addMoney(userId, currentBet);
                resultText = `🤝 Berabere (Push) +${currentBet}`;
                color = '#FFFF00';
            }

            // Sonucu Yaz (Eğer mesaj duruyorsa)
            try {
                // Eğer son interactiyon butonsa update değilse edit
                // Karmaşıklığı önlemek için direkt edit deniyoruz, collector bittiği için güvenli
                // Bakiyeyi güncellemek için tekrar çek
                const finalUser = db.getUser(userId);

                // Embedi güncelle (Bakiye ekle)
                const finalEmbed = updateEmbed(true, `${resultText}\n💰 Bakiye: **${finalUser.money} FCoin**`, color);

                await gameMsg.edit({ embeds: [finalEmbed], components: [] });
            } catch (e) { console.error(e); }
        });
    }
};
