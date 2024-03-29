const { bultinsConstants } = require("common/core/Method/consts");
const { Statics } = require("common/core/Token/types");

class BgatCompletionProvider {
  provideCompletionItems(document, position, token, context) {
    const line = document.lineAt(position).text;
    const prefix = this.extractWordPrefix(line);
    const suggestions = this.getSuggestions(prefix);
    console.log("suggestions:", suggestions);
    return suggestions;
  }

  extractWordPrefix(line) {
    // Starting from the current position, move backward to find the start of the word
    let start = line.length - 1;
    while (start >= 0 && this.isWordCharacter(line[start])) {
      start--;
    }

    // Extract the word from the line
    const word = line.slice(start + 1);
    return word;
  }

  isWordCharacter(char) {
    // Define the characters that are considered part of a word
    const wordCharacters = /[a-zA-Z0-9_\.]/;
    return wordCharacters.test(char);
  }

  getSuggestions(prefix) {
    // Implement your logic to get suggestions based on the extracted word
    // For example, you can filter your static methods or names starting with the given word
    const possibleStatics = this.filterByPrefix(Object.values(Statics), prefix);
    const possibleStaticMethods = this.filterByPrefix(
      Object.entries(bultinsConstants).flatMap(([bindType, methods]) => {
        let methodNames = Object.keys(methods);
        return methodNames.map((name) => `${bindType}.${name}`);
      }),
      prefix
    );

    return [...possibleStatics, ...possibleStaticMethods];
  }

  filterByPrefix(array, prefix) {
    return array.filter((item) => item.startsWith(prefix));
  }
}

module.exports = BgatCompletionProvider;
