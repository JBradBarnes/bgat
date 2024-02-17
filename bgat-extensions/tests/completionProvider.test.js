const vscode = require("vscode");
const BgatCompletionProvider = require("../completionProvider");

const setup = async () => {
  // Your test code
  const document = await vscode.workspace.openTextDocument({
    content: "", // both in global.textDocument
    language: "bgat",
  });
  // editor in global.editor
  const editor = await vscode.window.showTextDocument(document);
  const position = editor.selection.active;
  const provider = new BgatCompletionProvider();

  const completions = await provider.provideCompletionItems(document, position);
  return {
    completions,
    document,
    position,
  };
};

afterEach(() => {
  global.editor.reset();
  global.textDocument.reset();
});

describe("Bgat Completion Provider Tests", () => {
  test("Should provide completions for static methods", async () => {
    global.textDocument.content = "File.wr";
    // Your test code
    const { completions } = await setup();
    let find = completions.find((c) => c === "File.write");
    return expect(find).toBeTruthy(); // Adjust the expected length based on your static methods
  });

  test("Should provide completions for static methods in brackets", async () => {
    global.textDocument.content = "$str.replace(File.wr";
    global.editor.selection.active = global.textDocument.content.length - 1;
    // Your test code
    const { completions } = await setup();

    let find = completions.find((c) => c === "File.write");
    return expect(find).toBeTruthy();
  });
});
