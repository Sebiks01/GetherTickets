const {
  Client,
  Events,
  Message,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');

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

    const ticketConfig = config.tickets.types.find(
      (ticketType) => ticketType.id === result.type
    );

    if (
      result.orderDescription === undefined ||
      result.orderDescription === ''
    ) {
      await message.channel.permissionOverwrites.edit(message.author, {
        SendMessages: false,
      });

      const embedMessage = await message.channel.messages.fetch({
        before: message.id,
        limit: 1,
      });
      await message.delete();

      await ticketsSchema.updateOne(
        {
          userId: message.author.id,
          channelId: message.channel.id,
        },
        {
          orderDescription: message.content,
        }
      );

      const orderBudgetEmbed = new EmbedBuilder()
        .setTitle('Budżet zamówienia')
        .setDescription(ticketConfig.orderBudgetEmbed)
        .setColor('#00ff00');

      await message.channel.permissionOverwrites.edit(message.author, {
        SendMessages: true,
      });

      return embedMessage.at(0).edit({
        embeds: [orderBudgetEmbed],
      });
    }

    if (result.orderBudget === undefined || result.orderBudget === '') {
      await message.channel.permissionOverwrites.edit(message.author, {
        SendMessages: false,
      });

      const embedMessage = await message.channel.messages.fetch({
        before: message.id,
        limit: 1,
      });
      await message.delete();

      await ticketsSchema.updateOne(
        {
          userId: message.author.id,
          channelId: message.channel.id,
        },
        {
          orderBudget: message.content,
        }
      );

      const orderDeadlineEmbed = new EmbedBuilder()
        .setTitle('Termin zamówienia')
        .setDescription(ticketConfig.orderDeadlineEmbed)
        .setColor('#00ff00');

      await message.channel.permissionOverwrites.edit(message.author, {
        SendMessages: true,
      });

      return embedMessage.at(0).edit({
        embeds: [orderDeadlineEmbed],
      });
    }

    if (result.orderDeadline === undefined || result.orderDeadline === '') {
      await message.channel.permissionOverwrites.edit(message.author, {
        SendMessages: false,
      });

      await ticketsSchema.updateOne(
        {
          userId: message.author.id,
          channelId: message.channel.id,
        },
        {
          orderDeadline: message.content,
        }
      );

      const messages = await message.channel.messages.fetch();
      await message.channel.bulkDelete(messages);

      let orderSummaryDescription = '';

      orderSummaryDescription += `**Opis zamówienia:** ${result.orderDescription}\n`;
      orderSummaryDescription += `**Budżet zamówienia:** ${result.orderBudget}\n`;
      orderSummaryDescription += `**Termin zamówienia:** ${message.content}\n\n`;
      orderSummaryDescription += `**Pytania i odpowiedzi:**`;

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
          .setStyle(ButtonStyle.Danger)
      );

      return message.channel.send({
        embeds: [orderSummaryEmbed],
        components: [orderSummaryActionRow],
      });
    }

    if (result.awaitingAnswer) {
      await message.channel.permissionOverwrites.edit(message.author, {
        SendMessages: false,
      });

      const logChannel = await message.guild.channels.fetch(
        ticketConfig.logChannelId
      );

      if (!logChannel) {
        console.log(
          chalk.yellow(
            `[WARN] Log channel not found for "${ticketConfig.id}" tickets!`
          )
        );

        return message.channel.send({
          content:
            'Nie znaleziono kanału logów. Skontaktuj się z administracją.',
        });
      }

      const embedMessage = await message.channel.messages.fetch({
        before: message.id,
        limit: 1,
      });

      await embedMessage.at(0).delete();
      await message.delete();

      if (!result.answers) {
        result.answers = [];
      }

      result.answers.push(message.content);

      await ticketsSchema.updateOne(
        {
          userId: message.author.id,
          channelId: message.channel.id,
        },
        {
          answers: result.answers,
          awaitingAnswer: false,
        }
      );

      const logMessage = await logChannel.messages.fetch(result.logMessageId);

      const orderLogEmbed = EmbedBuilder.from(logMessage.embeds[0]);

      orderLogEmbed.setFields([]);

      result.questions.forEach(({ userId, question }, index) => {
        orderLogEmbed.addFields(
          {
            name: 'Pytanie',
            value: question,
            inline: true,
          },
          {
            name: 'Odpowiedź',
            value: result.answers[index],
            inline: true,
          },
          {
            name: 'Zadane przez',
            value: `<@${userId}>`,
            inline: true,
          }
        );
      });

      await logMessage.edit({
        embeds: [orderLogEmbed],
        components: [
          new ActionRowBuilder().setComponents(
            logMessage.components[0].components[0],
            ButtonBuilder.from(
              logMessage.components[0].components[1]
            ).setDisabled(false)
          ),
        ],
      });

      const messages = await message.channel.messages.fetch();
      await message.channel.bulkDelete(messages);

      const orderSummaryEmbed = new EmbedBuilder()
        .setTitle('Podsumowanie zamówienia')
        .setDescription(orderLogEmbed.data.description)
        .setFields(orderLogEmbed.data.fields)
        .setColor('#00ff00');

      return message.channel.send({
        embeds: [orderSummaryEmbed],
      });
    }
  },
};
