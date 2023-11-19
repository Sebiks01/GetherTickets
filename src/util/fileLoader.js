const { glob } = require('glob');
const path = require('path');
const chalk = require('chalk');

// Deleting cached files function
async function deleteCachedFile(file) {
  // Resolving for absolute file path
  const filePath = path.resolve(file);

  // Checking if the file is cached
  if (require.cache[filePath]) {
    // Deleting cached versions of a file
    delete require.cache[filePath];
  }
}

// Loading files function
async function loadFiles(dirName) {
  try {
    // Finding all js files within specified directory
    const jsFiles = await glob(
      path.join(process.cwd(), dirName, '**/*.js').replace(/\\/g, '/')
    ).then((files) => files.map((file) => file.replace(/\\/g, '/')));

    // Async deleting all cached versions of the files
    await Promise.all(jsFiles.map(deleteCachedFile));

    // Returning the files
    return jsFiles;
  } catch (err) {
    // Logging error if occured
    console.log(
      chalk.red(`[ERROR] Error loading files from directory "${dirName}".`)
    );

    console.log(err);
  }
}

module.exports = { loadFiles };
