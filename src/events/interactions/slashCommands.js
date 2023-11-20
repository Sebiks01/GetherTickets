const {
  ChatInputCommandInteraction,
  AutocompleteInteraction,
  Client,
  Events,
} = require('discord.js');
const chalk = require('chalk');

const { config } = require('../../util/config.js');

// Event
module.exports = {
  name: Events.InteractionCreate,

  /**
   * @param { ChatInputCommandInteraction | AutocompleteInteraction } interaction
   * @param { Client } client
   */

  async execute(client, interaction) {
    // Checking if interaction is a command interaction
    if (!interaction.isChatInputCommand() && !interaction.isAutocomplete())
      return;

    // Fetching the command from the client commands collection
    const command = client.commands.get(interaction.commandName);

    // Checking if the command exists
    if (!command) {
      console.log(
        chalk.yellow(`[WARN] Command ${interaction.commandName} is outdated.`)
      );

      return interaction.reply({
        content: 'This command is outdated.',
        ephemeral: true,
      });
    }

    if (interaction.isAutocomplete()) {
      // Executing autocomplete for the command
      try {
        command.autocomplete(client, interaction);
      } catch (err) {
        console.log(
          chalk.yellow(
            `[WARN] Error with autocomplete in ${interaction.commandName} command.`
          )
        );
        console.log(err);
      }

      return;
    }

    // Checking if the command is developer only and the user isn't a developer
    if (command.dev && !config.client.devs.includes(interaction.user.id)) {
      return interaction.reply({
        content: 'This command is only available to the developer.',
        ephemeral: true,
      });
    }

    // Executing the command
    try {
      command.execute(client, interaction);
    } catch (err) {
      console.log(
        chalk.yellow(
          `[WARN] Error executing ${interaction.commandName} command.`
        )
      );
      console.log(err);
    }
  },
};
