const {
  Client,
  Events,
  ButtonInteraction,
  EmbedBuilder,
} = require('discord.js');

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
      interaction.customId !== 'gethertickets-order-log-accept'
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

    const ticketConfig = config.tickets.types.find(
      (ticketType) => ticketType.id === result.type
    );

    if (!interaction.member.roles.cache.has(ticketConfig.roleId))
      return interaction.followUp({
        content: 'Nie masz uprawnień do zarządzania tym zamówieniem',
        ephemeral: true,
      });

    const orderChannel = await interaction.guild.channels.fetch(
      result.channelId
    );

    if (!orderChannel) {
      await interaction.followUp({
        content: 'To zamówienie zostało zamknięte!',
        ephemeral: true,
      });

      return interaction.message.delete();
    }

    if (result.awaitingAnswer) {
      await ticketsSchema.updateOne(
        {
          logMessageId: interaction.message.id,
        },
        {
          awaitingAnswer: false,
        }
      );

      const messages = await orderChannel.messages.fetch();
      await orderChannel.bulkDelete(messages);

      const orderLogEmbed = EmbedBuilder.from(
        interaction.message.embeds[0]
      ).setTitle('Podsumowanie zamówienia');

      await orderChannel.send({
        embeds: [orderLogEmbed],
      });
    }

    await interaction.message.edit({
      embeds: [
        EmbedBuilder.from(interaction.message.embeds[0])
          .setTitle(`Zamówienie przyjęte!`)
          .setColor('#008000')
          .setAuthor({
            name: interaction.user.username,
            iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
          }),
      ],
      components: [],
    });

    const orderAcceptedEmbed = new EmbedBuilder()
      .setTitle('Zamówienie zostało przyjęte!')
      .setDescription(`Zamówienie zostało przyjęte przez ${interaction.user}!`)
      .setColor('#008000');

    await orderChannel.send({
      content: `<@${result.userId}>`,
      embeds: [orderAcceptedEmbed],
    });

    await orderChannel.permissionOverwrites.create(interaction.user, {
      ViewChannel: true,
      ReadMessageHistory: true,
      SendMessages: true,
      AttachFiles: true,
    });

    orderChannel.permissionOverwrites.edit(result.userId, {
      SendMessages: true,
      AttachFiles: true,
    });
  },
};
