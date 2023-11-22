const {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  Client,
  EmbedBuilder,
  PermissionFlagsBits,
} = require('discord.js');
const transcipts = require('discord-html-transcripts');
const chalk = require('chalk');
const fs = require('fs');

const { config } = require('../../util/config.js');
const ticketsSchema = require('../../schemas/tickets.js');

// Command
module.exports = {
  data: new SlashCommandBuilder()
    .setName('close')
    .setDescription('Closes the ticket.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  /**
   * @param { ChatInputCommandInteraction } interaction
   * @param { Client } _
   */

  async execute(_, interaction) {
    await interaction.deferReply();

    const result = await ticketsSchema.findOne({
      channelId: interaction.channel.id,
    });

    if (!result)
      return interaction.editReply({
        content: 'Ten kanał nie jest zamówieniem!',
        ephemeral: true,
      });

    const ticketConfig = config.tickets.types.find(
      (ticketType) => ticketType.id === result.type
    );

    if (!interaction.member.roles.cache.has(ticketConfig.roleId))
      return interaction.editReply({
        content: 'Nie masz uprawnień do zarządzania tym zamówieniem',
        ephemeral: true,
      });

    const closeEmbed = new EmbedBuilder()
      .setTitle('Zamówienie zamknięte!')
      .setColor('#ff0000')
      .setTimestamp()
      .setAuthor({
        name: `Zamknięte przez ${interaction.user.username}`,
        iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
      });

    await interaction.editReply({
      embeds: [closeEmbed],
    });

    const transcipt = await transcipts.createTranscript(interaction.channel, {
      saveImages: true,
      returnType: transcipts.ExportReturnType.Buffer,
      fileName: 'transcript.html',
      poweredBy: false,
    });

    if (!fs.existsSync(`transcripts/${result.userId}`)) {
      fs.mkdirSync(`transcripts/${result.userId}`);
      console.log(
        chalk.green(
          `[INFO] Transcript directory created for user with id ${result.userId}.`
        )
      );
    }

    await interaction.channel.delete();

    fs.writeFile(
      `transcripts/${result.userId}/${result.type}-${result.channelId}-transcript.html`,
      transcipt,
      (err) => {
        if (err) {
          console.log(chalk.yellow('[WARN] Could not save transcript file.'));
          console.log(err);
          return;
        }

        console.log(chalk.green('[INFO] Transcript file saved!'));
      }
    );
  },
};
