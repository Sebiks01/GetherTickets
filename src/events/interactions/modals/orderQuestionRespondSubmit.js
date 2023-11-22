const {
  Client,
  Events,
  ModalSubmitInteraction,
  EmbedBuilder
} = require('discord.js');

const ticketsSchema = require('../../../schemas/tickets.js');
const { config } = require('../../../util/config.js');

// Event
module.exports = {
  name: Events.InteractionCreate,

  /**
   * @param { Client } _
   * @param { ModalSubmitInteraction } interaction
   */

  async execute(_, interaction) {
    if (
      !interaction.isModalSubmit() ||
      !interaction.customId.startsWith('gethertickets-order-modal-answer-')
    )
      return;

    await interaction.deferUpdate();

    const result = await ticketsSchema.findOne({
      userId: interaction.user.id,
      channelId: interaction.channel.id,
    });

    const ticketConfig = config.tickets.types.find(
      (ticketType) => ticketType.id === result.type
    );

    const logChannel = await interaction.guild.channels.fetch(
      ticketConfig.logChannelId
    );

    if (!logChannel) {
      console.log(
        chalk.yellow(
          `[WARN] Log channel not found for "${ticketConfig.id}" tickets!`
        )
      );

      return interaction.followUp({
        content: 'Nie znaleziono kanału logów. Skontaktuj się z administracją.',
        ephemeral: true,
      });
    }

    const questionIndex = interaction.customId.split('-').pop();
    const answer = interaction.fields.getTextInputValue(
      'gethertickets-order-modal-answer-input'
    );

    result.questions[questionIndex].answer = answer;

    await result.save();

    const logMessage = await logChannel.messages.fetch(result.logMessageId);

    const orderLogEmbed = EmbedBuilder.from(logMessage.embeds[0]).setFields(
      result.questions
        .map(({ question, answer }) => [
          {
            name: 'Pytanie',
            value: question,
            inline: true,
          },
          {
            name: 'Odpowiedź',
            value: answer,
            inline: true,
          },
          {
            name: '** **',
            value: '** **',
            inline: false,
          },
        ])
        .flat()
    );

    await interaction.message.delete();

    await logMessage.edit({
      embeds: [orderLogEmbed],
      components: logMessage.components,
    });

    await interaction.followUp({
      content: 'Pomyślnie odpowiedziano na pytanie!',
      ephemeral: true,
    });

    const orderSummaryEmbed = new EmbedBuilder()
      .setTitle('Podsumowanie zamówienia')
      .setDescription(orderLogEmbed.data.description)
      .setFields(orderLogEmbed.data.fields)
      .setColor('#00ff00');

    const firstMessage = await interaction.channel.messages.fetch({
      before: interaction.message.id,
    });

    firstMessage.last().edit({
      embeds: [orderSummaryEmbed],
    });
  },
};
