const { Client, Events, ButtonInteraction } = require('discord.js');


// Event
module.exports = {
  name: Events.InteractionCreate,

  /**
   * @param { Client } _
   * @param { ButtonInteraction } interaction
   */

  async execute(_, interaction) {
    if (!interaction.isButton() || interaction.customId !== "gethertickets-create") return;

    await interaction.deferUpdate();

    
  },
};