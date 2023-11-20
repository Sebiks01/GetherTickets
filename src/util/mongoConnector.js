const mongoose = require('mongoose');
const chalk = require('chalk');

async function mongoConnect() {
  // Creating and returning a new database connection
  console.log(chalk.blue('[INFO] Connecting to the database...'));

  return await new Promise((resolve) => {
    mongoose
      .connect(process.env.MONGO_URI)
      .then((mongoose) => {
        console.log(
          chalk.green('[INFO] Successfully connected to the database.')
        );

        resolve(mongoose);
      })
      .catch((err) => {
        console.log(chalk.red('[ERROR] Invalid mongo uri provided.'));
        console.log(err);

        // Ending the process if the connection fails
        process.exit(1);
      });
  });
}

module.exports = { mongoConnect };
