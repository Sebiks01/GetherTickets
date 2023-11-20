const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChatInputCommandInteraction,
  Client,
  ChannelType,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');

// Command
module.exports = {
  data: new SlashCommandBuilder()
    .setName('setup')
    .setDescription('Sends the ticket message to the specified channel.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addChannelOption((option) =>
      option
        .setName('channel')
        .setDescription('The channel to send the ticket message to.')
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true)
    ),

  /**
   * @param { ChatInputCommandInteraction } interaction
   * @param { Client } _
   */

  async execute(_, interaction) {
    const channel = interaction.options.getChannel('channel');

    const ticketEmbed = new EmbedBuilder()
      .setTitle('Ticket')
      .setDescription('React with 🎫 to open a ticket.')
      .setColor('#000000');

    const ticketActionRow = new ActionRowBuilder().setComponents(
      new ButtonBuilder()
        .setCustomId('gethertickets-create')
        .setLabel('Stwórz ticket')
        .setEmoji('🎫')
        .setStyle(ButtonStyle.Success)
    );

    await channel.send({
      embeds: [ticketEmbed],
      components: [ticketActionRow],
    });

    interaction.reply({ content: 'Ticket message sent!', ephemeral: true });
  },
};
