/**
 * @param {ParserToken[]} cmdTokens - The parsed tokens in command.
 **/
function checkSyntax(cmdTokens = []) {
  let isVarDeclaration = cmdTokens[0].TokenType === TokenType.TYPE;
  if (isVarDeclaration) {
    checkVarDeclarationSyntax(cmdTokens);
  } else {
    checkNonDeclarationSyntax(cmdTokens);
  }
}

/**
 * @param {ParserToken[]} cmdTokens - The parsed tokens in command.
 **/
function checkVarDeclarationSyntax(cmdTokens = []) {
  if (cmdTokens[1].TokenType !== TokenType.VARIABLE)
    throw new Error("Variable name expected");
  if (cmdTokens[2]) {
    if (cmdTokens[0].name === "param") {
      if (cmdTokens[2].TokenType !== TokenType.DEFAULT)
        throw new Error(
          "Syntax Error: params can only be initialized with default.  ( default ) expected"
        );
    } else {
      if (cmdTokens[2].TokenType !== TokenType.FROM)
        throw new Error(
          "Syntax Error: Initializer from expected.  ( from ) expected"
        );
    }
    if (cmdTokens.length < 4) {
      throw new Error("Syntax Error: Value expected for initializer");
    }
    checkNonDeclarationSyntax(cmdTokens.slice(4));
  }
}

/**
 * @param {ParserToken[]} cmdTokens - The parsed tokens in command.
 **/
function checkNonDeclarationSyntax(cmdTokens = []) {
  //
  let last = null;
  cmdTokens.forEach((t) => {
    // should not be declarations in these
    if (DECLARATIONS.includes(t.TokenType)) {
      throw new Error(`Syntax Error: Unexpected token ${t.text}`);
    }
    // should not be back-to-back strings in command unless in a list (may handle templates where we can do that if I do not nest additonal as expressions)
    let lastIsString =
      last?.TokenType === TokenType.STRING ||
      last?.TokenType === TokenType.TEMPLATE ||
      last?.TokenType === TokenType.LIST;
    let curIsString =
      t.TokenType === TokenType.STRING ||
      t.TokenType === TokenType.TEMPLATE ||
      t.TokenType === TokenType.LIST;
    if (lastIsString && curIsString)
      throw new Error(
        `Syntax Error: List, string, or template followed by a list, string, or template. Unexpected token ${t.text}`
      );

    last = t;
  });
}

module.exports = {
  checkSyntax,
};
