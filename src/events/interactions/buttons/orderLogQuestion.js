const {
  Client,
  Events,
  ButtonInteraction,
  ModalBuilder,
  ActionRowBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require('discord.js');

const ticketsSchema = require('../../../schemas/tickets.js');
const { config } = require('../../../util/config.js');

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
      interaction.customId !== 'gethertickets-order-log-question'
    )
      return;

    const result = await ticketsSchema.findOne({
      logMessageId: interaction.message.id,
    });

    if (!result) {
      await interaction.reply({
        content: 'To zamówienie zostało zamknięte!',
        ephemeral: true,
      });

      return interaction.message.delete();
    }

    const ticketConfig = config.tickets.types.find(
      (ticketType) => ticketType.id === result.type
    );

    if (!interaction.member.roles.cache.has(ticketConfig.roleId))
      return interaction.reply({
        content: 'Nie masz uprawnień do zarządzania tym zamówieniem',
        ephemeral: true,
      });

    const orderChannel = await interaction.guild.channels.fetch(
      result.channelId
    );

    if (!orderChannel) {
      await interaction.reply({
        content: 'To zamówienie zostało zamknięte!',
        ephemeral: true,
      });

      return interaction.message.delete();
    }

    const questionModal = new ModalBuilder()
      .setCustomId('gethertickets-order-log-question-modal')
      .setTitle('Dodaj pytanie do zamówienia')
      .setComponents(
        new ActionRowBuilder().setComponents(
          new TextInputBuilder()
            .setCustomId('gethertickets-order-log-question-modal-input1')
            .setLabel('Pytanie:')
            .setMaxLength(300)
            .setRequired(true)
            .setStyle(TextInputStyle.Paragraph)
        )
      );

    interaction.showModal(questionModal);
  },
};
