const {
  Client,
  Events,
  ButtonInteraction,
  ChannelType,
  PermissionFlagsBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');
const chalk = require('chalk');

const { config } = require('../../../util/config.js');
const ticketsSchema = require('../../../schemas/tickets.js');

const { ViewChannel, ReadMessageHistory, SendMessages, AttachFiles } = PermissionFlagsBits;

// Event
module.exports = {
  name: Events.InteractionCreate,

  /**
   * @param { Client } _
   * @param { ButtonInteraction } interaction
   */

  async execute(_, interaction) {
    if (!interaction.isButton() || interaction.customId !== 'gethertickets-create') return;

    const results = await ticketsSchema.find({ userId: interaction.user.id });

    if (results.length >= config.tickets.limit) return interaction.reply({
      content: `Osiągnięto limit ticketów.`,
      ephemeral: true,
    });

    const categories = config.tickets.categories;

    const ticketChannel = await interaction.guild.channels.create({
      name: `zamowienie-${interaction.user.username}`,
      type: ChannelType.GuildText,
      reason: `Ticket created by ${interaction.user.username}`,
    });

    for (const categoryId of categories) {
      try {
        await ticketChannel.setParent(categoryId);
        break;
      } catch (err) {
        console.log(chalk.yellow('[WARN] Invalid categoryId or category is full.'));
        continue;
      }
    }

    await ticketChannel.permissionOverwrites.set([
      {
        id: interaction.guild.roles.everyone.id,
        deny: [ViewChannel],
      },
      {
        id: interaction.user.id,
        allow: [ViewChannel, ReadMessageHistory],
        deny: [SendMessages, AttachFiles],
      },
    ]);

    await interaction.reply({
      content: `Stworzono ticket ${ticketChannel}.`,
      ephemeral: true,
    });

    await ticketsSchema.create({
      userId: interaction.user.id,
      channelId: ticketChannel.id,
      type: "none",
      claimed: false
    })

    const regulationsEmbed = new EmbedBuilder()
      .setTitle('Regulamin')
      .setDescription('Czy akceptujesz [regulamin](https://discord.com/channels/1175881177391955998/1175918170154995834/1175918242963927091)?')
      .setColor('#00ff00')

    const regulationsActionRow = new ActionRowBuilder().setComponents(
      new ButtonBuilder()
      .setCustomId('gethertickets-regulations-accept')
      .setLabel('Akceptuję')
      .setStyle(ButtonStyle.Success),

      new ButtonBuilder()
      .setCustomId('gethertickets-regulations-decline')
      .setLabel('Odrzucam')
      .setStyle(ButtonStyle.Danger),
    )

    ticketChannel.send({
      embeds: [regulationsEmbed],
      components: [regulationsActionRow]
    });
  },
};
