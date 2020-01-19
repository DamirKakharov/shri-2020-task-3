import {
  createConnection,
  ProposedFeatures,
  TextDocuments,
  InitializeParams,
  TextDocument,
  DidChangeConfigurationNotification,
  Diagnostic,
  DiagnosticSeverity,
  DidChangeConfigurationParams
} from "vscode-languageserver";


import { basename } from "path";

import { ExampleConfiguration, Severity, RuleKeys } from "./configuration";
import { makeLint, LinterProblem } from "./linter";

let connection = createConnection(ProposedFeatures.all);
let documents: TextDocuments = new TextDocuments();

let defaultSettings: ExampleConfiguration = {
  enable: true,
  severity: {
    [RuleKeys.BlockNameIsRequired]: Severity.Error,
    [RuleKeys.UppercaseNamesIsForbidden]: Severity.Error,
    [RuleKeys.WarningTextSizesShouldBeEqual]: Severity.Error,
  }
};
let globalSettings: ExampleConfiguration = defaultSettings;

let hasConfigurationCapability: boolean = false;
let hasWorkspaceFolderCapability: boolean = false;
let hasDiagnosticRelatedInformationCapability: boolean = false;


connection.onInitialize((params: InitializeParams) => {
  let capabilities = params.capabilities;

  hasConfigurationCapability = !!(
    capabilities.workspace && !!capabilities.workspace.configuration
  );
  hasWorkspaceFolderCapability = !!(
    capabilities.workspace && !!capabilities.workspace.workspaceFolders
  );
  hasDiagnosticRelatedInformationCapability = !!(
    capabilities.textDocument &&
    capabilities.textDocument.publishDiagnostics &&
    capabilities.textDocument.publishDiagnostics.relatedInformation
  );
  return {
    capabilities: {
      textDocumentSync: documents.syncKind
    }
  };
});
connection.onInitialized(() => {
  if (hasConfigurationCapability) {
    connection.client.register(DidChangeConfigurationNotification.type, undefined);
  }
  if (hasWorkspaceFolderCapability) {
    connection.workspace.onDidChangeWorkspaceFolders(_event => {
      connection.console.log('Workspace folder change event received.');
    });
  }
});


// Cache the settings of all open documents
let documentSettings: Map<string, Thenable<ExampleConfiguration>> = new Map();

connection.onDidChangeConfiguration(({ settings }: DidChangeConfigurationParams) => {
  if (hasConfigurationCapability) {
    documentSettings.clear();
  } else {
    globalSettings = <ExampleConfiguration>(
      (settings.example || defaultSettings)
    );
  }

  validateAll();
});

function getDocumentSettings(resource: string): Thenable<ExampleConfiguration> {
  if (!hasConfigurationCapability) {
    return Promise.resolve(globalSettings);
  }
  let result = documentSettings.get(resource);
  if (!result) {
    result = connection.workspace.getConfiguration({
      scopeUri: resource,
      section: 'example'
    });
    documentSettings.set(resource, result);
  }
  return result;
}

function GetSeverity(key: RuleKeys): DiagnosticSeverity | undefined {
  if (!globalSettings || !globalSettings.severity) {
    return DiagnosticSeverity.Warning;
  }

  const severity: Severity = globalSettings.severity[key];

  switch (severity) {
    case Severity.Error:
      return DiagnosticSeverity.Error;
    case Severity.Warning:
      return DiagnosticSeverity.Warning;
    case Severity.Information:
      return DiagnosticSeverity.Information;
    case Severity.Hint:
      return DiagnosticSeverity.Hint;
    default:
      return DiagnosticSeverity.Warning;
  }
}

function GetMessage(key: RuleKeys): string {
  if (key === RuleKeys.BlockNameIsRequired) {
    return 'Field named \'block\' is required!';
  }

  if (key === RuleKeys.UppercaseNamesIsForbidden) {
    return "Uppercase properties are forbidden!";
  }

  return `Unknown problem type '${key}'`;
}

async function validateTextDocument(textDocument: TextDocument): Promise<void> {
  globalSettings = await getDocumentSettings(textDocument.uri);

  const source = basename(textDocument.uri);
  const json = textDocument.getText();

  const diagnostics: Diagnostic[] = makeLint(json).reduce((list: Diagnostic[], problem: any): Diagnostic[] => {
    const severity = GetSeverity(problem.key);

    if (severity) {
      const message = GetMessage(problem.key);

      let diagnostic: Diagnostic = {
        range: {
          start: textDocument.positionAt(problem.loc.start.offset),
          end: textDocument.positionAt(problem.loc.end.offset)
        },
        severity,
        message,
        source
      };

      list.push(diagnostic);
    }

    return list;
  },
    []);

  connection.sendDiagnostics({ uri: textDocument.uri, diagnostics });
}

async function validateAll() {
  for (const document of documents.all()) {
    await validateTextDocument(document);
  }
}

documents.onDidChangeContent(change => {
  validateTextDocument(change.document);
});


documents.listen(connection);
connection.listen();

