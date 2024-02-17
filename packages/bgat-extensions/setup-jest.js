const path = require("path");
const { runTests } = require("vscode-test");

(async () => {
  try {
    const extensionDevelopmentPath = path.resolve(__dirname, ".."); // Adjust the path based on your project structure
    const extensionTestsPath = path.resolve(__dirname, "./");

    await runTests({
      extensionDevelopmentPath,
      extensionTestsPath,
    });
  } catch (err) {
    console.error("Failed to run tests", err);
    process.exit(1);
  }
})();
