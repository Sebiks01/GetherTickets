const {
  Client,
  Events,
  StringSelectMenuInteraction,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');
const chalk = require('chalk');

const { config } = require('../../../util/config.js');
const ticketsSchema = require('../../../schemas/tickets.js');

// Event
module.exports = {
  name: Events.InteractionCreate,

  /**
   * @param { Client } _
   * @param { StringSelectMenuInteraction } interaction
   */

  async execute(_, interaction) {
    if (!interaction.isStringSelectMenu() || interaction.customId !== 'gethertickets-category-selector') return;

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

    const category = interaction.values[0].split('-')[2];
    const ticketConfig = config.tickets.types.find((ticketType) => ticketType.id === category);
    const logChannel = await interaction.guild.channels.fetch(ticketConfig.logChannelId);

    if (!logChannel) {
      console.log(chalk.yellow(`[WARN] Log channel not found for "${ticketConfig.id}" tickets!`));

      return interaction.followUp({
        content: 'Nie znaleziono kanału logów. Skontaktuj się z administracją.',
        ephemeral: true,
      });
    }

    await ticketsSchema.updateOne({
      userId: interaction.user.id,
      channelId: interaction.channel.id,
    }, {
      type: category,
    });

    await interaction.message.delete();

    await interaction.channel.permissionOverwrites.edit(interaction.user, {
        SendMessages: true,
        AttachFiles: true
    })

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
