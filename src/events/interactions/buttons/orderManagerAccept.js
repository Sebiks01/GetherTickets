const {
  Client,
  Events,
  ButtonInteraction,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');
const chalk = require('chalk');

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
      interaction.customId !== 'gethertickets-order-summary-accept'
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

    const ticketConfig = config.tickets.types.find(
      (ticketType) => ticketType.id === result.type
    );

    const logChannel = await interaction.guild.channels.fetch(
      ticketConfig.logChannelId
    );

    if (!logChannel) {
      console.log(
        chalk.yellow(
          `[WARN] Log channel not found for "${ticketConfig.id}" tickets!`
        )
      );

      return interaction.followUp({
        content: 'Nie znaleziono kanału logów. Skontaktuj się z administracją.',
        ephemeral: true,
      });
    }

    await interaction.message.edit({
      embeds: [interaction.message.embeds[0]],
      components: [],
    });

    const orderLogEmbed = new EmbedBuilder()
      .setTitle('Zamówienie')
      .setDescription(interaction.message.embeds[0].description)
      .setColor('#00ff00');

    const orderLogActionRow = new ActionRowBuilder().setComponents(
      new ButtonBuilder()
        .setCustomId('gethertickets-order-log-accept')
        .setLabel('Przyjmij')
        .setStyle(ButtonStyle.Success),

      new ButtonBuilder()
        .setCustomId('gethertickets-order-log-question')
        .setLabel('Dopytaj')
        .setStyle(ButtonStyle.Secondary)
    );

    const logMessage = await logChannel.send({
      embeds: [orderLogEmbed],
      components: [orderLogActionRow],
    });

    await ticketsSchema.updateOne(
      {
        userId: interaction.user.id,
        channelId: interaction.channel.id,
      },
      {
        logMessageId: logMessage.id,
      }
    );
  },
};
