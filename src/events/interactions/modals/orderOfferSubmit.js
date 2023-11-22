const {
  Client,
  Events,
  ModalSubmitInteraction,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');

const ticketsSchema = require('../../../schemas/tickets.js');
const offersSchema = require('../../../schemas/offers.js');

// Event
module.exports = {
  name: Events.InteractionCreate,

  /**
   * @param { Client } _
   * @param { ModalSubmitInteraction } interaction
   */

  async execute(_, interaction) {
    if (
      !interaction.isModalSubmit() ||
      interaction.customId !== 'gethertickets-order-offer-modal'
    )
      return;

    await interaction.deferUpdate();

    const result = await ticketsSchema.findOne({
      logMessageId: interaction.message.id,
    });

    if (!result) {
      await interaction.followUp({
        content: 'To zamówienie zostało zamknięte!',
        ephemeral: true,
      });

      return interaction.message.delete();
    }

    const ticketChannel = await interaction.guild.channels.fetch(
      result.channelId
    );

    if (!ticketChannel) {
      await interaction.followUp({
        content: 'To zamówienie zostało zamknięte!',
        ephemeral: true,
      });

      return interaction.message.delete();
    }

    const offerEmbed = new EmbedBuilder()
      .setTitle('Nowa oferta!')
      .setDescription(
        interaction.fields.getTextInputValue(
          'gethertickets-order-offer-modal-input1'
        )
      )
      .setColor('#008000')
      .setAuthor({
        name: interaction.user.username,
        iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
      });

    const offerActionRow = new ActionRowBuilder().setComponents(
      new ButtonBuilder()
        .setCustomId(`gethertickets-order-offer-accept-${interaction.user.id}`)
        .setLabel('Akceptuj')
        .setStyle(ButtonStyle.Success),

      new ButtonBuilder()
        .setCustomId(`gethertickets-order-offer-decline-${interaction.user.id}`)
        .setLabel('Odrzuć')
        .setStyle(ButtonStyle.Danger)
    );

    await offersSchema.updateOne(
      {
        userId: interaction.user.id,
        channelId: ticketChannel.id,
      },
      {
        userId: interaction.user.id,
        channelId: ticketChannel.id,
      },
      {
        upsert: true,
        new: true,
      }
    );

    ticketChannel.send({
      embeds: [offerEmbed],
      components: [offerActionRow],
    });
  },
};
