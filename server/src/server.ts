/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
import {
  createConnection,
  TextDocuments,
  Diagnostic,
  DiagnosticSeverity,
  ProposedFeatures,
  InitializeParams,
  DidChangeConfigurationNotification,
  CompletionItem,
  CompletionItemKind,
  TextDocumentPositionParams,
  TextDocumentSyncKind,
  InitializeResult,
  Connection,
} from "vscode-languageserver/node";

import { TextDocument } from "vscode-languageserver-textdocument";
import { LanguageServer, startLanguageServer } from "./util/language-server";
import SemanticTokensService from "./services/semantic-tokens";

const connection = createConnection(ProposedFeatures.all);

// The example settings
interface ExampleSettings {
  maxNumberOfProblems: number;
}

const defaultSettings: ExampleSettings = { maxNumberOfProblems: 1000 };
let globalSettings: ExampleSettings = defaultSettings;

function registerInitialize(server: LanguageServer) {
  const { connection, hasCapability } = server;
  connection.onInitialize((params: InitializeParams) => {
    const capabilities = params.capabilities;
    hasCapability["configuration"] = false;
    hasCapability["workspaceFolder"] = false;
    hasCapability["diagnosticRelatedInformation"] = false;

    // Does the client support the `workspace/configuration` request?
    // If not, we fall back using global settings.
    hasCapability["configuration"] = !!(
      capabilities.workspace && !!capabilities.workspace.configuration
    );

    hasCapability["workspaceFolder"] = !!(
      capabilities.workspace && !!capabilities.workspace.workspaceFolders
    );

    hasCapability["diagnosticRelatedInformation"] = !!(
      capabilities.textDocument &&
      capabilities.textDocument.publishDiagnostics &&
      capabilities.textDocument.publishDiagnostics.relatedInformation
    );

    const result: InitializeResult = {
      capabilities: {
        textDocumentSync: TextDocumentSyncKind.Full, // bad performance until we implement tree-sitter for CWScript
        semanticTokensProvider: {
          range: false,
          legend: {
            tokenTypes: [],
            tokenModifiers: [],
          },
          full: {
            delta: false,
          },
        },
        // Tell the client that this server supports code completion.
        completionProvider: {
          resolveProvider: true,
        },
      },
    };
    if (hasCapability["workspaceFolder"]) {
      result.capabilities.workspace = {
        workspaceFolders: {
          supported: true,
        },
      };
    }
    return result;
  });
}

function registerInitialized(server: LanguageServer) {
  const { connection, hasCapability } = server;

  connection.onInitialized(() => {
    if (hasCapability["configuration"]) {
      // Register for all configuration changes.
      connection.client.register(
        DidChangeConfigurationNotification.type,
        undefined
      );
    }
    if (hasCapability["workspaceFolder"]) {
      connection.workspace.onDidChangeWorkspaceFolders((_event) => {
        connection.console.log("Workspace folder change event received.");
      });
    }
  });
}

function getDocumentSettings(
  server: LanguageServer,
  resource: string
): Thenable<ExampleSettings> {
  const { connection, hasCapability, settings, documents } = server;
  if (!hasCapability["configuration"]) {
    return Promise.resolve(settings["default"]);
  }
  let result = settings["document"].get(resource);
  if (!result) {
    result = connection.workspace.getConfiguration({
      scopeUri: resource,
      section: "languageServerExample",
    });
    settings["document"].set(resource, result);
  }
  return result;
}

function registerDidChangeConfiguration(server: LanguageServer) {
  const { connection, hasCapability, documents, settings } = server;
  connection.onDidChangeConfiguration((change) => {
    if (hasCapability["configuration"]) {
      // Reset all cached document settings
      settings["document"].clear();
    } else {
      settings["global"] = <ExampleSettings>(
        (change.settings.languageServerExample || settings["default"])
      );
    }

    // Revalidate all open text documents
    documents.all().forEach((x) => validateTextDocument(server, x));
  });
}

function registerDocumentsDidClose(server: LanguageServer) {
  const { documents } = server;
  documents.onDidClose((event) => {
    server.settings["documents"].delete(event.document.uri);
  });
}

function registerDocumentsDidChangeContent(server: LanguageServer) {
  const { documents } = server;
  documents.onDidChangeContent((change) => {
    validateTextDocument(server, change.document);
  });
}

function registerDidChangeWatchedFiles(server: LanguageServer) {
  const { connection } = server;
  connection.onDidChangeWatchedFiles((_change) => {
    // Monitored files have change in VSCode
    connection.console.log("We received an file change event");
  });
}

function registerCompletion(server: LanguageServer) {
  const { connection } = server;

  // This handler provides the initial list of the completion items.
  connection.onCompletion(
    (_textDocumentPosition: TextDocumentPositionParams): CompletionItem[] => {
      // The pass parameter contains the position of the text document in
      // which code complete got requested. For the example we ignore this
      // info and always provide the same completion items.
      return [
        {
          label: "TypeScript",
          kind: CompletionItemKind.Text,
          data: 1,
        },
        {
          label: "JavaScript",
          kind: CompletionItemKind.Text,
          data: 2,
        },
      ];
    }
  );
}

function registerCompletionResolve(server: LanguageServer) {
  const { connection } = server;

  // This handler resolves additional information for the item selected in
  // the completion list.
  connection.onCompletionResolve((item: CompletionItem): CompletionItem => {
    if (item.data === 1) {
      item.detail = "TypeScript details";
      item.documentation = "TypeScript documentation";
    } else if (item.data === 2) {
      item.detail = "JavaScript details";
      item.documentation = "JavaScript documentation";
    }
    return item;
  });
}

async function validateTextDocument(
  server: LanguageServer,
  textDocument: TextDocument
): Promise<void> {
  const { connection, hasCapability, documents, settings } = server;

  const thisDocSettings = await getDocumentSettings(server, textDocument.uri);

  // The validator creates diagnostics for all uppercase words length 2 and more
  const text = textDocument.getText();
  const pattern = /\b[A-Z]{2,}\b/g;
  let m: RegExpExecArray | null;

  let problems = 0;
  const diagnostics: Diagnostic[] = [];
  while (
    (m = pattern.exec(text)) &&
    problems < thisDocSettings.maxNumberOfProblems
  ) {
    problems++;
    const diagnostic: Diagnostic = {
      severity: DiagnosticSeverity.Warning,
      range: {
        start: textDocument.positionAt(m.index),
        end: textDocument.positionAt(m.index + m[0].length),
      },
      message: `${m[0]} is all uppercase.`,
      source: "ex",
    };
    if (hasCapability["diagnosticRelatedInformation"]) {
      diagnostic.relatedInformation = [
        {
          location: {
            uri: textDocument.uri,
            range: Object.assign({}, diagnostic.range),
          },
          message: "Spelling matters",
        },
        {
          location: {
            uri: textDocument.uri,
            range: Object.assign({}, diagnostic.range),
          },
          message: "Particularly for names",
        },
      ];
    }
    diagnostics.push(diagnostic);
  }

  // Send the computed diagnostics to VSCode.
  connection.sendDiagnostics({ uri: textDocument.uri, diagnostics });
}

const CWScriptLanguageServer = LanguageServer.Create({
  serverInfo: {
    name: "cwsls",
    version: "0.0.1",
  },
  services: [SemanticTokensService],
});

startLanguageServer(CWScriptLanguageServer, connection);
