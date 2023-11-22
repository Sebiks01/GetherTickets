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
      !interaction.customId.startsWith('gethertickets-order-offer-decline-')
    )
      return;

    const result = await ticketsSchema.findOne({
      userId: interaction.user.id,
      channelId: interaction.channel.id,
    });

    if (!result)
      return interaction.reply({
        content: 'Ten ticket nie należy do ciebie!',
        ephemeral: true,
      });

    const userId = interaction.customId.split('-').pop();

    const modal = new ModalBuilder()
      .setCustomId(`gethertickets-order-offer-decline-modal-${userId}`)
      .setTitle('Odrzuć ofertę')
      .setComponents(
        new ActionRowBuilder().setComponents(
          new TextInputBuilder()
            .setCustomId('gethertickets-order-offer-decline-input1')
            .setPlaceholder('Wpisz powód tutaj...')
            .setLabel('Powód odrzucenia oferty')
            .setMaxLength(100)
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true)
        )
      );

    interaction.showModal(modal);
  },
};
