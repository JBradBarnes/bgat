// vscode.js

global.editor = {};
global.editor.reset = () =>
  Object.assign(global.editor, {
    selection: {
      active: 0,
    },
  });
global.editor.reset();

global.textDocument = {};
global.textDocument.reset = () =>
  Object.assign(global.textDocument, {
    content: "",
    language: "bgat",
    lineAt: (num = 0) => ({
      text: global.textDocument.content.split("\n")[num],
    }),
  });
global.textDocument.reset();

const languages = {
  createDiagnosticCollection: jest.fn(),
};

const StatusBarAlignment = {};

const createAsynReturn = (ret) => () => new Promise((r) => r(ret));

const window = {
  createStatusBarItem: jest.fn(() => ({
    show: jest.fn(),
  })),
  showErrorMessage: jest.fn(),
  showWarningMessage: jest.fn(),
  createTextEditorDecorationType: jest.fn(),
  showTextDocument: jest.fn(createAsynReturn(global.editor)),
};

const workspace = {
  getConfiguration: jest.fn(),
  workspaceFolders: [],
  onDidSaveTextDocument: jest.fn(),

  openTextDocument: jest.fn(createAsynReturn(global.textDocument)),
};

const OverviewRulerLane = {
  Left: null,
};

const Uri = {
  file: (f) => f,
  parse: jest.fn(),
};
const Range = jest.fn();
const Diagnostic = jest.fn();
const DiagnosticSeverity = { Error: 0, Warning: 1, Information: 2, Hint: 3 };

const debug = {
  onDidTerminateDebugSession: jest.fn(),
  startDebugging: jest.fn(),
};

const commands = {
  executeCommand: jest.fn(),
};

const vscode = {
  languages,
  StatusBarAlignment,
  window,
  workspace,
  OverviewRulerLane,
  Uri,
  Range,
  Diagnostic,
  DiagnosticSeverity,
  debug,
  commands,
};

module.exports = vscode;
