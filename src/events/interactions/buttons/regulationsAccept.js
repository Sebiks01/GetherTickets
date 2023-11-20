const {
  Client,
  Events,
  ButtonInteraction,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} = require('discord.js');

const { config } = require('../../../util/config.js');
const ticketsSchema = require('../../../schemas/tickets.js');

// Event
module.exports = {
  name: Events.InteractionCreate,

  /**
   * @param { Client } _
   * @param { ButtonInteraction } interaction
   */

  async execute(_, interaction) {
    if (!interaction.isButton() ||interaction.customId !== 'gethertickets-regulations-accept') return;

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

    const categorySelectorEmbed = new EmbedBuilder()
      .setTitle('Wybierz kategorię')
      .setDescription('Wybierz kategorię, do której chcesz utworzyć ticket.')
      .setColor('#00ff00');

    const categorySelectorMenu = new StringSelectMenuBuilder()
      .setCustomId('gethertickets-category-selector')
      .setPlaceholder('Wybierz kategorię')
      .setMaxValues(1);

    config.tickets.types.forEach((ticketType) => {
      categorySelectorMenu.addOptions(
        new StringSelectMenuOptionBuilder()
          .setLabel(ticketType.label)
          .setDescription(ticketType.description)
          .setEmoji(ticketType.emoji)
          .setValue(`gethertickets-category-${ticketType.id}`)
      );
    });

    const categorySelectorActionRow = new ActionRowBuilder().setComponents(categorySelectorMenu);

    interaction.message.edit({
        embeds: [categorySelectorEmbed],
        components: [categorySelectorActionRow]
    })
  },
};
