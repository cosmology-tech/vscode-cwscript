/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */

import * as path from "path";
import { workspace, ExtensionContext } from "vscode";
import * as vscode from "vscode";

import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
  TransportKind,
} from "vscode-languageclient/node";

let client: LanguageClient;

function setupLanguageClient(context: ExtensionContext) {
  // The server is implemented in node
  const serverModule = context.asAbsolutePath(
    path.join("server", "out", "server.js")
  );

  // If the extension is launched in debug mode then the debug server options are used
  // Otherwise the run options are used
  const serverOptions: ServerOptions = {
    run: {
      module: serverModule,
      transport: TransportKind.ipc,
      options: {
        execArgv: ["--nolazy", "--inspect=6009"],
      },
    },
    debug: {
      module: serverModule,
      transport: TransportKind.ipc,
      options: {
        execArgv: ["--nolazy", "--inspect=6009"],
      },
    },
  };

  // Options to control the language client
  const clientOptions: LanguageClientOptions = {
    // Register the server for plain text documents
    documentSelector: [{ scheme: "file", language: "cwscript" }],
    synchronize: {
      // Notify the server about file changes to 'cwsproject.toml' files contained in the workspace
      fileEvents: workspace.createFileSystemWatcher("**/cwsproject.toml"),
    },
  };

  // Create the language client and start the client.
  client = new LanguageClient(
    "cwsls",
    "CWScript Language Server Client",
    serverOptions,
    clientOptions
  );

  // Start the client. This will also launch the server
  client.start();
}

function setupCommands(context: ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand("cwscript.showAst", () => {
      vscode.window.showInformationMessage("Show AST");
      const panel = vscode.window.createWebviewPanel(
        "cwscriptAst",
        "CWScript AST",
        vscode.ViewColumn.Beside
      );
      panel.webview.html = "<html><body><h1>Hello World</h1></body></html>";
    })
  );
}

export function activate(context: ExtensionContext) {
  setupCommands(context);
  setupLanguageClient(context);
}

export function deactivate(): Thenable<void> | undefined {
  if (!client) {
    return undefined;
  }
  return client.stop();
}
