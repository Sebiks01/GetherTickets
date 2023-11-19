const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChatInputCommandInteraction,
  Client,
} = require('discord.js');

const { loadCommands } = require('../../handlers/commandsHandler.js');
const { loadEvents } = require('../../handlers/eventsHandler.js');

// Command
module.exports = {
  dev: true,
  data: new SlashCommandBuilder()
    .setName('reload')
    .setDescription('Reloads the bot commands/events.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand((sub) =>
      sub.setName('commands').setDescription('Reloads the bot commands.')
    )
    .addSubcommand((sub) =>
      sub.setName('events').setDescription('Reloads the bot events.')
    ),

  /**
   * @param { ChatInputCommandInteraction } interaction
   * @param { Client } client
   */

  execute(client, interaction) {
    // Getting the used subcommand
    const subCommand = interaction.options.getSubcommand();

    // Checking for the subcommand type
    switch (subCommand) {
      case 'commands': {
        // Loading client commands
        loadCommands(client);

        return interaction.reply({
          content: 'Reloaded commands.',
          ephemeral: true,
        });
      }

      case 'events': {
        // Looping through the client events collection
        for (const [key, value] of client.events) {
          // Removing the event listener
          client.removeListener(`${key}`, value, true);
        }

        // Loading client events
        loadEvents(client);

        return interaction.reply({
          content: 'Reloaded Events.',
          ephemeral: true,
        });
      }

      default: return;
    }
  },
};
