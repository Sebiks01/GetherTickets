const { Client, Events, ButtonInteraction, EmbedBuilder } = require('discord.js');

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
      !interaction.customId.startsWith('gethertickets-order-offer-accept-')
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

    const userId = interaction.customId.split('-').pop();

    const messages = await interaction.channel.messages.fetch();
    await interaction.channel.bulkDelete(messages);

    const ticketConfig = config.tickets.types.find(
      (ticketType) => ticketType.id === result.type
    );

    const logChannel = await interaction.guild.channels.fetch(
      ticketConfig.logChannelId
    );
    const logMessage = await logChannel.messages.fetch(result.logMessageId);

    const member = await interaction.guild.members.fetch(userId);

    const embed = EmbedBuilder.from(logMessage.embeds[0])
      .setTitle(`Zamówienie przyjęte!`)
      .setColor('#008000')
      .setAuthor({
        name: member.user.username,
        iconURL: member.user.displayAvatarURL({ dynamic: true }),
      });

    await interaction.channel.send({
      embeds: [embed],
    });

    await logMessage.edit({
      embeds: [embed],
      components: [],
    });

    const orderAcceptedEmbed = new EmbedBuilder()
      .setTitle('Zamówienie zostało przyjęte!')
      .setDescription(`Zamówienie zostało przyjęte przez ${member.user}!`)
      .setColor('#008000');

    await interaction.channel.send({
      content: `${interaction.user}`,
      embeds: [orderAcceptedEmbed],
    });

    await interaction.channel.permissionOverwrites.create(member.user, {
      ViewChannel: true,
      ReadMessageHistory: true,
      SendMessages: true,
      AttachFiles: true,
    });

    interaction.channel.permissionOverwrites.edit(interaction.user, {
      SendMessages: true,
      AttachFiles: true,
    });
  },
};
