const vscode = require("vscode");
const { BuiltinMethods } = require("../src/parser/methods");
const { Statics } = require("../src/parser/tokenizeCommand");

class BgatCompletionProvider {
  provideCompletionItems(document, position, token, context) {
    const line = document.lineAt(position).text;
    const prefix = this.extractWordPrefix(line, position.character);
    return this.getSuggestions(prefix);
  }

  extractWordPrefix(line, position) {
    // Starting from the current position, move backward to find the start of the word
    let start = position - 1;
    while (start >= 0 && this.isWordCharacter(line[start])) {
      start--;
    }

    // Extract the word from the line
    const word = line.slice(start + 1, position);
    return word;
  }

  isWordCharacter(char) {
    // Define the characters that are considered part of a word
    const wordCharacters = /[a-zA-Z0-9_]/;
    return wordCharacters.test(char);
  }

  getSuggestions(prefix) {
    // Implement your logic to get suggestions based on the extracted word
    // For example, you can filter your static methods or names starting with the given word
    const possibleStatics = Object.values(Statics).filter((s) =>
      s.startsWith(prefix)
    );
    const possibleStaticMethods =
      prefix.indexOf(".") !== -1
        ? BuiltinMethods.map(
            ({ name, bindType }) => `${bindType}.${name}`
          ).filter((str) => str.startsWith(prefix))
        : [];
    return [
      ...possibleStatics,
      ...possibleStaticMethods,
      // ...possibleImplementations
    ];
  }
}

module.exports = BgatCompletionProvider;
