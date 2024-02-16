const vscode = require("vscode");
// const serverModule = require("./bgatServer.js");

let server;

function activate(context) {
  server = require("vscode-languageserver/node").createConnection();
  server.listen();

  const completionProvider = vscode.languages.registerCompletionItemProvider(
    "bgat",
    new BgatCompletionProvider(),
    "."
  );
  context.subscriptions.push(completionProvider);
}

function deactivate() {
  if (server) {
    server.close();
  }
}

module.exports = {
  activate,
  deactivate,
};
