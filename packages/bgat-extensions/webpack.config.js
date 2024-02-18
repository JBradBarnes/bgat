const path = require("path");
const webpack = require("webpack");

module.exports = {
  entry: "./src/index.js",
  output: {
    filename: "extension.js",
    path: path.resolve(__dirname, "out"),
    libraryTarget: "commonjs", // Specify CommonJS as the target
  },
  target: "node", // Set the target environment to Node.js
  node: {
    __dirname: false, // Keep the original __dirname behavior
    __filename: false, // Keep the original __filename behavior
  },
  mode: "development", // Adjust the mode as needed (development or production)
  externals: {
    vscode: "commonjs vscode", // Specify vscode as an external dependency
  },
  plugins: [
    new webpack.IgnorePlugin({
      resourceRegExp: /^vscode$/,
    }),
    new webpack.IgnorePlugin({
      resourceRegExp: /\.git/,
    }),
  ],
};
