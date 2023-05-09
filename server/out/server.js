"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
const node_1 = require("vscode-languageserver/node");
const language_server_1 = require("./util/language-server");
const semantic_tokens_1 = require("./services/semantic-tokens");
const signature_help_1 = require("./services/signature-help");
const diagnostics_1 = require("./services/diagnostics");
const document_symbol_1 = require("./services/document-symbol");
const connection = (0, node_1.createConnection)(node_1.ProposedFeatures.all);
const CWScriptLanguageServer = language_server_1.LanguageServer.Create({
    serverInfo: {
        name: "cwsls",
        version: "0.0.1",
    },
    services: [
        diagnostics_1.default,
        document_symbol_1.default,
        semantic_tokens_1.default,
        signature_help_1.default,
    ],
});
(0, language_server_1.startLanguageServer)(CWScriptLanguageServer, connection);
//# sourceMappingURL=server.js.map