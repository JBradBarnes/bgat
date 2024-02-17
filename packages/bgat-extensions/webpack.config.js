const path = require("path");
const webpack = require("webpack");

module.exports = {
  entry: "./index.js",
  output: {
    filename: "extension.js",
    path: path.resolve(__dirname, "dist"),
    libraryTarget: "commonjs", // Specify CommonJS as the target
  },
  target: "node", // Set the target environment to Node.js
  node: {
    __dirname: false, // Keep the original __dirname behavior
    __filename: false, // Keep the original __filename behavior
  },
  mode: "development", // Adjust the mode as needed (development or production)
  plugins: [
    new webpack.IgnorePlugin({
      resourceRegExp: /^vscode$/,
    }),
    new webpack.IgnorePlugin({
      resourceRegExp: /COMMIT_EDITMSG/,
    }),
  ],
};
