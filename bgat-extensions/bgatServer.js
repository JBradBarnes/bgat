const { createConnection, ProposedFeatures } = require("vscode-languageserver");
const connection = createConnection(ProposedFeatures.all);

connection.onInitialize((params) => {
  return {
    capabilities: {
      completionProvider: {
        resolveProvider: true,
      },
    },
  };
});

connection.onCompletion((textDocumentPosition) => {
  // Implement your completion logic here
  const completions = [
    { label: "method1", kind: 12 /*Method*/, detail: "Description of method1" },
    { label: "method2", kind: 12 /*Method*/, detail: "Description of method2" },
    // Add more completions as needed
  ];

  return completions;
});

connection.listen();
