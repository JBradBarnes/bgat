const src = {};
src.parser = {};

src.parser.variableContext = require("./src/parser/variableContext.js"); 
src.parser.typeCheckCmd = require("./src/parser/typeCheckCmd.js"); 
src.parser.tokenizeCommand = require("./src/parser/tokenizeCommand.js"); 
src.parser.syntaxCheckCmd = require("./src/parser/syntaxCheckCmd.js"); 
src.parser.stripComments = require("./src/parser/stripComments.js"); 
src.parser.splitStatements = require("./src/parser/splitStatements.js"); 
src.parser.paserContext = require("./src/parser/paserContext.js"); 
src.parser.methods = require("./src/parser/methods.js"); 
src.parser.executeCmd = require("./src/parser/executeCmd.js")

module.exports = src;
