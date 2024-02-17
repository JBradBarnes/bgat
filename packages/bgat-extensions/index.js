const vscode = require("vscode");
// const serverModule = require("./bgatServer.js");
const BgatCompletionProvider = require("./completionProvider");

let server;

function activate(context) {
  console.log("Bgat extension activated");

  server = require("vscode-languageserver/node").createConnection();
  server.listen();

  const completionProvider = vscode.languages.registerCompletionItemProvider(
    "bgat",
    new BgatCompletionProvider()
  );

  context.subscriptions.push(completionProvider);
}

function deactivate() {
  if (server) {
    server.close();
    console.log("Bgat extension deactivated");
  }
}

module.exports = {
  activate,
  deactivate,
};
