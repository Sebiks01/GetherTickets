const {
  Client,
  Events,
  ModalSubmitInteraction,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');

const ticketsSchema = require('../../../schemas/tickets.js');

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
      interaction.customId !== 'gethertickets-order-log-question-modal'
    )
      return;

    await interaction.deferUpdate();

    const result = await ticketsSchema.findOne({
      logMessageId: interaction.message.id,
    });

    if (!result) {
      await interaction.followUp({
        content: 'To zamówienie zostało zamknięte!',
        ephemeral: true,
      });

      return interaction.message.delete();
    }

    const ticketChannel = await interaction.guild.channels.fetch(
      result.channelId
    );

    if (!ticketChannel) {
      await interaction.followUp({
        content: 'To zamówienie zostało zamknięte!',
        ephemeral: true,
      });

      return interaction.message.delete();
    }

    const question = interaction.fields.getTextInputValue(
      'gethertickets-order-log-question-modal-input1'
    );

    if (!result.questions) {
      result.questions = [];
    }

    result.questions.push({ question, answer: null });

    const orderLogEmbed = EmbedBuilder.from(
      interaction.message.embeds[0]
    ).setFields(
      result.questions.map(({ question, answer }) => [
        {
          name: 'Pytanie',
          value: question,
          inline: true,
        },
        {
          name: 'Odpowiedź',
          value: answer || 'Brak odpowiedzi',
          inline: true,
        },
        {
          name: '** **',
          value: '** **',
          inline: false,
        }
      ]).flat()
    );

    await interaction.message.edit({
      embeds: [orderLogEmbed],
      components: interaction.message.components,
    });

    await ticketsSchema.updateOne(
      {
        logMessageId: interaction.message.id,
      },
      {
        questions: result.questions,
        awaitingAnswer: true,
      }
    );

    await interaction.followUp({
      content: 'Pytanie zostało wysłane!',
      ephemeral: true,
    });

    const questionEmbed = new EmbedBuilder()
      .setTitle('Pytanie do zamówienia')
      .setDescription(question)
      .setColor('#FF0000')
      .setAuthor({
        name: interaction.user.username,
        iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
      });

    const questionActionRow = new ActionRowBuilder().setComponents(
      new ButtonBuilder()
        .setCustomId(`gethertickets-order-question-answer-${result.questions.length - 1}`)
        .setLabel('Odpowiedz')
        .setStyle(ButtonStyle.Secondary)
    );

    ticketChannel.send({
      embeds: [questionEmbed],
      components: [questionActionRow],
    });
  },
};
