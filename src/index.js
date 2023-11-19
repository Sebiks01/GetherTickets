const { Client, GatewayIntentBits, Collection } = require('discord.js');
const chalk = require('chalk');
require('dotenv/config.js');

const { loadEvents } = require('./handlers/eventsHandler.js');
const { mongoConnect } = require('./util/mongoConnector.js');

const { Guilds } = GatewayIntentBits;

// Creating the client
const client = new Client({
  intents: [Guilds],
});

// Creating a new collection of commands
client.commands = new Collection();

// Creating a new collection of events
client.events = new Collection();

// Connecting to the database
mongoConnect();

// Loading client events
loadEvents(client);

// Login into the client
client.login(process.env.TOKEN).catch((err) => {
  console.log(chalk.red('[ERROR] Inavlid token provided.'));
  console.log(err);

  // Ending the process if the login fails
  process.exit(1);
});

