const {
  Client,
  Events,
  ButtonInteraction,
  ModalBuilder,
  TextInputBuilder,
  ActionRowBuilder,
  TextInputStyle,
} = require('discord.js');

const ticketsSchema = require('../../../schemas/tickets.js');

// Event
module.exports = {
  name: Events.InteractionCreate,

  /**
   * @param { Client } _
   * @param { ButtonInteraction } interaction
   */

  async execute(_, interaction) {
    if (
      !interaction.isButton() ||
      !interaction.customId.startsWith('gethertickets-order-question-answer-')
    )
      return;

    const questionIndex = interaction.customId.split('-').pop();

    const result = await ticketsSchema.findOne({
      userId: interaction.user.id,
      channelId: interaction.channel.id,
    });

    if (!result)
      return interaction.reply({
        content: 'Nie masz uprawnień do zarządzania tym urządzeniem!',
        ephemeral: true,
      });

    const answerModal = new ModalBuilder()
      .setCustomId(`gethertickets-order-modal-answer-${questionIndex}`)
      .setTitle('Odpowiedz na pytanie')
      .setComponents(
        new ActionRowBuilder().setComponents(
          new TextInputBuilder()
            .setCustomId(
              `gethertickets-order-modal-answer-input`
            )
            .setLabel('Odpowiedź')
            .setPlaceholder('Wpisz tutaj odpowiedź...')
            .setRequired(true)
            .setStyle(TextInputStyle.Paragraph)
            .setMaxLength(300)
        )
      );

      interaction.showModal(answerModal);
  },
};
