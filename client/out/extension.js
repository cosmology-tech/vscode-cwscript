"use strict";
/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const path = require("path");
const vscode_1 = require("vscode");
const vscode = require("vscode");
const node_1 = require("vscode-languageclient/node");
let client;
function setupLanguageClient(context) {
    // The server is implemented in node
    const serverModule = context.asAbsolutePath(path.join("server", "out", "server.js"));
    // If the extension is launched in debug mode then the debug server options are used
    // Otherwise the run options are used
    const serverOptions = {
        run: {
            module: serverModule,
            transport: node_1.TransportKind.ipc,
            options: {
                execArgv: ["--nolazy", "--inspect=6009"],
            },
        },
        debug: {
            module: serverModule,
            transport: node_1.TransportKind.ipc,
            options: {
                execArgv: ["--nolazy", "--inspect=6009"],
            },
        },
    };
    // Options to control the language client
    const clientOptions = {
        // Register the server for plain text documents
        documentSelector: [{ scheme: "file", language: "cwscript" }],
        synchronize: {
            // Notify the server about file changes to 'cwsproject.toml' files contained in the workspace
            fileEvents: vscode_1.workspace.createFileSystemWatcher("**/cwsproject.toml"),
        },
    };
    // Create the language client and start the client.
    client = new node_1.LanguageClient("cwsls", "CWScript Language Server Client", serverOptions, clientOptions);
    // Start the client. This will also launch the server
    client.start();
}
function setupCommands(context) {
    context.subscriptions.push(vscode.commands.registerCommand("cwscript.showAst", () => {
        vscode.window.showInformationMessage("Show AST");
        const panel = vscode.window.createWebviewPanel("cwscriptAst", "CWScript AST", vscode.ViewColumn.Beside);
        panel.webview.html = "<html><body><h1>Hello World</h1></body></html>";
    }));
}
function activate(context) {
    setupCommands(context);
    setupLanguageClient(context);
}
exports.activate = activate;
function deactivate() {
    if (!client) {
        return undefined;
    }
    return client.stop();
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map