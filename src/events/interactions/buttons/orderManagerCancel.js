const { Client, Events, ButtonInteraction } = require('discord.js');

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
      (interaction.customId !== 'gethertickets-order-manager-cancel' &&
        interaction.customId !== 'gethertickets-order-summary-cancel' &&
        interaction.customId !== 'gethertickets-regulations-decline')
    )
      return;

    await interaction.deferUpdate();

    const result = await ticketsSchema.findOne({
      userId: interaction.user.id,
      channelId: interaction.channel.id,
    });

    if (!result)
      return interaction.followUp({
        content: 'Ten ticket nie należy do ciebie!',
        ephemeral: true,
      });

    interaction.channel.delete();
  },
};
