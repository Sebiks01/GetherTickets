const { Client, Events, ButtonInteraction, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

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
    if (!interaction.isButton() ||interaction.customId !== 'gethertickets-order-manager-restart') return;

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

    await ticketsSchema.updateOne({
      userId: interaction.user.id,
      channelId: interaction.channel.id,
    }, {
      orderDescription: "",
      orderBudget: "",
      orderDeadline: "",
    });

    const messages = await interaction.channel.messages.fetch();
    await interaction.channel.bulkDelete(messages);

    const ticketConfig = config.tickets.types.find((ticketType) => ticketType.id === result.type);

    const orderManagerEmbed = new EmbedBuilder()
      .setTitle('Zamówienie')
      .setDescription('Opisz zamówienie zgodnie z poleceniami poniżej. \nOdpowiedzi na każde pytanie podawaj w jednej wiadomości.')
      .setColor('#00ff00');

    const orderManagerActionRow = new ActionRowBuilder().setComponents(
      new ButtonBuilder()
        .setCustomId('gethertickets-order-manager-restart')
        .setLabel('Restart')
        .setStyle(ButtonStyle.Primary),

      new ButtonBuilder()
        .setCustomId('gethertickets-order-manager-cancel')
        .setLabel('Anuluj')
        .setStyle(ButtonStyle.Danger)
    );

    await interaction.channel.send({
      embeds: [orderManagerEmbed],
      components: [orderManagerActionRow],
    });

    const orderDescriptionEmbed = new EmbedBuilder()
      .setTitle('Opisz zamówienie')
      .setDescription(ticketConfig.orderDescriptionEmbed)
      .setColor('#00ff00');

    interaction.channel.send({
        embeds: [orderDescriptionEmbed]
    });
  },
};
