const vscode = require("vscode");
const { Builtins } = require("../src/parser/methods");

class BgatCompletionProvider {
  provideCompletionItems(document, position, token, context) {
    const line = document.lineAt(position).text;
    const prefix = line.slice(0, position.character);
    const match = prefix.match(/(?:\b|\$)([A-Za-z0-9_]+)$/);

    if (match) {
      const suggestions = this.getSuggestions(match[1]);
      return suggestions.map((suggestion) => {
        return new vscode.CompletionItem(
          suggestion,
          vscode.CompletionItemKind.Method
        );
      });
    }

    return [];
  }

  getSuggestions(prefix) {
    // Implement your logic to get suggestions based on the prefix
    // For example, you can filter your static methods or names starting with the given prefix
    return Object.keys(Builtins.String).filter((name) =>
      name.startsWith(prefix)
    );
  }
}

module.exports = BgatCompletionProvider;
