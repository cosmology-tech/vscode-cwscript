"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_1 = require("vscode-languageserver/node");
const cwsc_1 = require("@terran-one/cwsc");
const position_1 = require("@terran-one/cwsc/dist/util/position");
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
function getSemanticToken(textView, node) {
    if (!node.$ctx) {
        return undefined;
    }
    let { start, end } = textView.rangeOfNode(node.$ctx);
    let line = start.line;
    let character = start.character;
    let length = end.character - start.character;
    let tokenModifiers = 0;
    let tokenType = undefined;
    if (node instanceof cwsc_1.AST.Param) {
        tokenType = tokTypeToNum.get("parameter");
    }
    if (!tokenType) {
        return undefined;
    }
    return {
        line,
        character,
        length,
        tokenType,
        tokenModifiers,
    };
}
// strategy = walk over the generated parse tree document, and walk descendants
// if a particular descendant node is described by a semantic token, then apply the
// selection function against the node to get the range, and push the token type.
function provideDocumentSemanticTokens(document) {
    // TODO: implement the real semantic tokens
    let text = document.getText();
    let textView = new position_1.TextView(text);
    let parser = new cwsc_1.CWSParser(text);
    let tb = new node_1.SemanticTokensBuilder();
    try {
        let ast = parser.parse();
        for (let node of ast.walkDescendantsLF()) {
            let candidate = getSemanticToken(textView, node);
            if (candidate) {
                tb.push(candidate.line, candidate.character, candidate.length, candidate.tokenType, candidate.tokenModifiers);
            }
        }
        return tb.build();
    }
    catch (e) {
        console.log(e);
        console.log(parser.errors);
        return tb.build();
    }
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