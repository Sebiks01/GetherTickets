const { Client, Events, ButtonInteraction, ActionRowBuilder, ButtonBuilder, EmbedBuilder } = require('discord.js');

const ticketsSchema = require('../../../schemas/tickets.js');
const { config } = require('../../../util/config.js')

// Event
module.exports = {
  name: Events.InteractionCreate,

  /**
   * @param { Client } _
   * @param { ButtonInteraction } interaction
   */

  async execute(_, interaction) {
    if (!interaction.isButton() || interaction.customId !== 'gethertickets-order-summary-edit') return;

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

    await interaction.message.edit({
        embeds: [interaction.message.embeds[0]],
        components: [new ActionRowBuilder().setComponents(
            ButtonBuilder.from(interaction.message.components[0].components[0]).setDisabled(true),
            ButtonBuilder.from(interaction.message.components[0].components[1]).setDisabled(true),
            ButtonBuilder.from(interaction.message.components[0].components[2]),
        )]
    })

    await ticketsSchema.updateOne({
      userId: interaction.user.id,
      channelId: interaction.channel.id,
    }, {
      orderDescription: "",
      orderBudget: "",
      orderDeadline: "",
    });

    const ticketConfig = config.tickets.types.find((ticketType) => ticketType.id === result.type);

    const orderDescriptionEmbed = new EmbedBuilder()
      .setTitle('Opisz zamówienie')
      .setDescription(ticketConfig.orderDescriptionEmbed)
      .setColor('#00ff00');

    await interaction.channel.send({
        embeds: [orderDescriptionEmbed]
    });

    interaction.channel.permissionOverwrites.edit(interaction.user, {
        SendMessages: true
    })
  },
};