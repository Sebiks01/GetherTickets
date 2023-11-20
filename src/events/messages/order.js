const { Client, Events, Message, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

const ticketsSchema = require('../../schemas/tickets.js');
const { config } = require('../../util/config.js');

// Event
module.exports = {
  name: Events.MessageCreate,

  /**
   * @param { Client } _
   * @param { Message } message
   */

  async execute(_, message) {
    if (!message.inGuild()) return;

    const result = await ticketsSchema.findOne({
        userId: message.author.id,
        channelId: message.channel.id,
    });

    if (!result) return;

    const ticketConfig = config.tickets.types.find((ticketType) => ticketType.id === result.type);

    if (result.orderDescription === undefined || result.orderDescription === "") {
        await ticketsSchema.updateOne({
            userId: message.author.id,
            channelId: message.channel.id,
        }, {
            orderDescription: message.content,
        });

        const orderBudgetEmbed = new EmbedBuilder()
            .setTitle('Budżet zamówienia')
            .setDescription(ticketConfig.orderBudgetEmbed)
            .setColor('#00ff00');

        return message.channel.send({
            embeds: [orderBudgetEmbed],
        });
    };

    if (result.orderBudget === undefined || result.orderBudget === "") {
        await ticketsSchema.updateOne({
            userId: message.author.id,
            channelId: message.channel.id,
        }, {
            orderBudget: message.content,
        });

        const orderDeadlineEmbed = new EmbedBuilder()
            .setTitle('Termin zamówienia')
            .setDescription(ticketConfig.orderDeadlineEmbed)
            .setColor('#00ff00');

        return message.channel.send({
            embeds: [orderDeadlineEmbed],
        });
    }

    if (result.orderDeadline === undefined || result.orderDeadline === "") {
        await ticketsSchema.updateOne({
            userId: message.author.id,
            channelId: message.channel.id,
        }, {
            orderDeadline: message.content,
        });

        const messages = await message.channel.messages.fetch();
        messages.forEach(async (msg) => await msg.delete())

        let orderSummaryDescription = "";

        orderSummaryDescription += `**Opis zamówienia:** ${result.orderDescription}\n`;
        orderSummaryDescription += `**Budżet zamówienia:** ${result.orderBudget}\n`;
        orderSummaryDescription += `**Termin zamówienia:** ${result.orderDeadline}\n`;

        const orderSummaryEmbed = new EmbedBuilder()
            .setTitle('Podsumowanie zamówienia')
            .setDescription(orderSummaryDescription)
            .setColor('#00ff00');

        const orderSummaryActionRow = new ActionRowBuilder().setComponents(
            new ButtonBuilder()
              .setCustomId('gethertickets-order-summary-accept')
              .setLabel('Wyślij')
              .setStyle(ButtonStyle.Success),

            new ButtonBuilder()
              .setCustomId('gethertickets-order-summary-edit')
              .setLabel('Edytuj')
              .setStyle(ButtonStyle.Primary),

            new ButtonBuilder()
              .setCustomId('gethertickets-order-summary-cancel')
              .setLabel('Anuluj')
              .setStyle(ButtonStyle.Danger),
        );

        message.channel.send({
            embeds: [orderSummaryEmbed],
            components: [orderSummaryActionRow]
        })
    }
  },
};
