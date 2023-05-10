"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CWScriptLanguageServer = void 0;
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
const cwsc_1 = require("@terran-one/cwsc");
const position_1 = require("@terran-one/cwsc/dist/util/position");
const connection = (0, node_1.createConnection)(node_1.ProposedFeatures.all);
class CWScriptLanguageServer extends language_server_1.LanguageServer {
    constructor() {
        super(...arguments);
        this.parseCache = new Map();
        this.parserListeners = [];
        this.SERVER_INFO = {
            name: "cwsls",
            version: "0.0.1",
        };
        this.SERVICES = [
            diagnostics_1.default,
            document_symbol_1.default,
            semantic_tokens_1.default,
            signature_help_1.default,
        ];
    }
    setup() {
        // initialiaze a parser cache
        this.documents.onDidChangeContent((change) => {
            const { uri } = change.document;
            const doc = this.documents.get(uri);
            this.parseFile(uri, doc.getText());
        });
    }
    parseFile(uri, source) {
        const textView = new position_1.TextView(source);
        const parser = new cwsc_1.CWSParser(source);
        const ast = parser.parse();
        this.parseCache.set(uri, { ast, parser, textView });
        this.parserListeners.forEach((listener) => {
            if (typeof listener === "function") {
                listener(uri, ast, parser);
            }
            else {
                listener.onParse(uri, ast, parser);
            }
        });
        return { ast, parser, textView };
    }
}
exports.CWScriptLanguageServer = CWScriptLanguageServer;
const cwsls = new CWScriptLanguageServer({ name: "cwsls", version: "0.0.1" });
cwsls.listen(connection);
//# sourceMappingURL=server.js.map