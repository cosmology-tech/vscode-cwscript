"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_1 = require("vscode-languageserver/node");
// include all token types and modifiers
const tokenTypesList = [
    "namespace",
    "type",
    "class",
    "enum",
    "interface",
    "struct",
    "typeParameter",
    "parameter",
    "variable",
    "property",
    "enumMember",
    "event",
    "function",
    "method",
    "macro",
    "keyword",
    "modifier",
    "comment",
    "string",
    "number",
    "regexp",
    "operator",
    "decorator",
];
const tokTypeToNum = new Map();
tokenTypesList.forEach((type, i) => tokTypeToNum.set(type, i));
const tokNumToType = new Map();
tokenTypesList.forEach((type, i) => tokNumToType.set(i, type));
const tokenModifiersList = [
    "declaration",
    "definition",
    "readonly",
    "static",
    "deprecated",
    "abstract",
    "async",
    "modification",
    "documentation",
    "defaultLibrary",
];
const tokModToNum = new Map();
tokenModifiersList.forEach((mod, i) => tokModToNum.set(mod, i));
const tokNumToMod = new Map();
tokenModifiersList.forEach((mod, i) => tokNumToMod.set(i, mod));
const LEGEND = {
    tokenTypes: tokenTypesList,
    tokenModifiers: tokenModifiersList,
};
function provideDocumentSemanticTokens(document) {
    let text = document.uri;
    let tokensBuilder = new node_1.SemanticTokensBuilder();
    tokensBuilder.push(0, 5, text.length, tokTypeToNum.get("comment"), 0);
    tokensBuilder.push(14, 0, 100, tokTypeToNum.get("keyword"), 0);
    return tokensBuilder.build();
}
exports.default = {
    init(result) {
        result.capabilities.semanticTokensProvider = {
            range: false,
            legend: LEGEND,
            full: {
                delta: false,
            },
        };
        return result;
    },
    register(server) {
        const { connection } = server;
        connection.onRequest("textDocument/semanticTokens/full", (params) => {
            let doc = server.documents.get(params.textDocument.uri);
            return provideDocumentSemanticTokens(doc);
        });
    },
};
//# sourceMappingURL=semantic-tokens.js.map