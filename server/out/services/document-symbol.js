"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_languageserver_1 = require("vscode-languageserver");
exports.default = {
    init(result) {
        result.capabilities.documentSymbolProvider = true;
        return result;
    },
    register(server) {
        server.connection.onDocumentSymbol((params) => {
            let doc = server.documents.get(params.textDocument.uri);
            let range = {
                start: {
                    line: 50,
                    character: 0,
                },
                end: {
                    line: 100,
                    character: 100,
                },
            };
            return [
                vscode_languageserver_1.DocumentSymbol.create("doc symbol name", "doc symbol details", vscode_languageserver_1.SymbolKind.Enum, range, range),
            ];
        });
    },
};
//# sourceMappingURL=document-symbol.js.map