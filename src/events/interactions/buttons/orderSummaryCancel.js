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
    if (!interaction.isButton() ||interaction.customId !== 'gethertickets-order-summary-cancel') return;

    const result = await ticketsSchema.findOne({
      userId: interaction.user.id,
      channelId: interaction.channel.id,
    });

    if (!result)
      return interaction.reply({
        content: 'Ten ticket nie należy do ciebie!',
        ephemeral: true,
      });

    interaction.channel.delete();
  },
};
