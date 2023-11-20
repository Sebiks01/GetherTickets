const { Client } = require('discord.js');
const chalk = require('chalk');

const { loadFiles } = require('../util/fileLoader.js');

/**
 * @param {Client} client
 */

async function loadEvents(client) {
  console.log(chalk.blue('[INFO] Loading events...'));

  // Logging events loading time
  console.time(chalk.green('[INFO] Loaded events in'));

  // Creating a new client events map
  client.events = new Map();

  const eventsTable = new Array();

  // Loading events files
  const files = await loadFiles('src/events');

  // Looping through events files
  for (const file of files) {
    try {
      // Importing event file
      const event = require(file);

      // Defining execute function params
      const execute = (...args) => event.execute(client, ...args);

      // Checking target
      const target = event.rest ? client.rest : client;

      // Adding listener
      target[event.once ? 'once' : 'on'](event.name, execute);

      // Adding event to client events map
      client.events.set(event.name, execute);

      // Adding event to events table
      eventsTable.push({
        Event: file.split('/').pop().slice(0, -3),
        Type: event.name,
        Status: '✅',
      });
    } catch (err) {
      // Adding errored event file to events table
      eventsTable.push({
        Event: file.split('/').pop().slice(0, -3),
        Type: '✖',
        Status: '🛑',
      });

      console.log(
        chalk.yellow(
          `[WARN] Error loading event "${file.split('/').pop().slice(0, -3)}".`
        )
      );
      console.log(err);
    }
  }

  // Logging events table
  console.table(eventsTable);
  console.timeEnd(chalk.green('[INFO] Loaded events in'));
}

module.exports = { loadEvents };
