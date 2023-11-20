const { Client } = require('discord.js');
const chalk = require('chalk');

const { loadFiles } = require('../util/fileLoader.js');
const { config } = require('../util/config.js');

/**
 * @param {Client} client
 */

async function loadCommands(client) {
  console.log(chalk.blue('[INFO] Loading commands...'));

  // Logging commands loading time
  console.time(chalk.green('[INFO] Loaded commands in'));

  // Creating a new client commands map
  client.commands = new Map();

  const commandsTable = new Array();
  const applicationCommands = new Array();
  const devCommands = new Array();

  // Loading commands files
  const files = await loadFiles('src/commands');

  // Loooping through commands files
  for (const file of files) {
    try {
      // Importing command file
      const command = require(file);

      // Adding command to client commands collection
      client.commands.set(command.data.name, command);

      // Checking if command is developer only
      command.dev
        ? devCommands.push(command.data.toJSON())
        : applicationCommands.push(command.data.toJSON());

      // Adding command to commands table
      commandsTable.push({
        Command: command.data.name,
        Status: '✅',
      });
    } catch (err) {
      // Adding errored command file to commands table
      commandsTable.push({
        Command: file.split('/').pop().slice(0, -3),
        Status: '🛑',
      });

      console.log(
        chalk.yellow(
          `[WARN] Error loading command "${file
            .split('/')
            .pop()
            .slice(0, -3)}".`
        )
      );
      console.log(err);
    }
  }

  // Registering application commands
  client.application.commands.set(applicationCommands);

  // Registering developer commands
  for (const testServerId of config.client.testServers) {
    let testServer;

    try {
      testServer = await client.guilds.fetch(testServerId);
    } catch (err) {
      console.log(
        chalk.yellow(
          `[WARN] Error fetching test server with id "${testServerId}".`
        )
      );
      console.log(err);

      continue;
    }

    testServer.commands.set(devCommands);
  }

  // Logging commands table
  console.table(commandsTable);
  console.timeEnd(chalk.green('[INFO] Loaded commands in'));
}

module.exports = { loadCommands };
