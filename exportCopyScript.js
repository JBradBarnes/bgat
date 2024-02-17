const fs = require("fs-extra");

// Specify the source and target directories
const sourceDir = ".";
const targetDir = "./bgat-extensions/node_modules/bgat";

// Ensure the target directory is empty
fs.emptyDirSync(targetDir);

// Copy all files and subdirectories from the source directory to the target directory
fs.copySync(sourceDir, targetDir);
