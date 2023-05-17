"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_languageserver_1 = require("vscode-languageserver");
const cwsc_1 = require("@terran-one/cwsc");
const language_service_1 = require("../language-service");
const documentSymbolRegistry = new Map();
function registerExtractor(nodeType, extractor) {
    documentSymbolRegistry.set(nodeType, extractor);
}
function defineExtractor({ getName = (node) => node.name, getKind, getSelectionRange = (node, textView) => textView.rangeOfNode(node.$ctx), getDetail, }) {
    return (node, textView) => ({
        name: getName(node),
        kind: getKind(node),
        range: getSelectionRange(node, textView),
        selectionRange: getSelectionRange(node, textView),
        detail: getDetail?.(node),
    });
}
registerExtractor(cwsc_1.AST.FnDefn, defineExtractor({
    getKind: () => vscode_languageserver_1.SymbolKind.Function,
}));
registerExtractor(cwsc_1.AST.InstantiateDefn, defineExtractor({
    getKind: () => vscode_languageserver_1.SymbolKind.Method,
    getSelectionRange: (node, textView) => {
        const { a, b } = node.$ctx.INSTANTIATE().sourceInterval;
        return textView.range(a, b);
    },
}));
registerExtractor(cwsc_1.AST.ExecDefn, defineExtractor({
    getKind: () => vscode_languageserver_1.SymbolKind.Method,
}));
registerExtractor(cwsc_1.AST.QueryDefn, defineExtractor({
    getKind: () => vscode_languageserver_1.SymbolKind.Method,
}));
registerExtractor(cwsc_1.AST.ContractDefn, defineExtractor({
    getKind: () => vscode_languageserver_1.SymbolKind.Class,
}));
registerExtractor(cwsc_1.AST.InterfaceDefn, defineExtractor({
    getKind: () => vscode_languageserver_1.SymbolKind.Interface,
}));
registerExtractor(cwsc_1.AST.StructDefn, defineExtractor({
    getKind: () => vscode_languageserver_1.SymbolKind.Struct,
    getSelectionRange: (node, textView) => {
        const name = node.name;
        if (!name) {
            return textView.rangeOfNode(node.$ctx);
        }
        else {
            return textView.rangeOfNode(name.$ctx);
        }
    },
}));
registerExtractor(cwsc_1.AST.EnumDefn, defineExtractor({
    getKind: () => vscode_languageserver_1.SymbolKind.Enum,
}));
registerExtractor(cwsc_1.AST.TypeAliasDefn, defineExtractor({
    getKind: () => vscode_languageserver_1.SymbolKind.TypeParameter,
}));
registerExtractor(cwsc_1.AST.Param, defineExtractor({
    getKind: () => vscode_languageserver_1.SymbolKind.Variable,
}));
registerExtractor(cwsc_1.AST.EnumVariantStruct, defineExtractor({
    getKind: () => vscode_languageserver_1.SymbolKind.EnumMember,
}));
registerExtractor(cwsc_1.AST.EnumVariantUnit, defineExtractor({
    getKind: () => vscode_languageserver_1.SymbolKind.EnumMember,
}));
function getDocumentSymbolOfNode(node, textView) {
    const extractor = documentSymbolRegistry.get(node.constructor);
    if (!extractor)
        return;
    const docSymbol = extractor(node, textView);
    docSymbol.children = node.descendants
        .map(c => getDocumentSymbolOfNode(c, textView))
        .filter(c => !!c);
    return docSymbol;
}
exports.default = (0, language_service_1.defineLanguageService)(function (result) {
    result.capabilities.documentSymbolProvider = true;
    // this.parserListeners.push((this, uri, ast, textView, parser) => {});
    this.connection.onDocumentSymbol((params) => {
        let cached = this.parseCache.get(params.textDocument.uri);
        if (!cached) {
            // the parser has not yet parsed this file, we need to trigger
            // a parse; in that case, the parserListener which updates the
            // document symbols will be responsible instead of the request handler here.
            // another scenario is the cached AST is invalid, so there are no
            // new symbols to return, and we can only the symbols of the last
            // successful program parse.
            cached = this.parseFile(params.textDocument.uri, this.documents.get(params.textDocument.uri).getText());
        }
        let symbols = [];
        let { ast, textView } = cached;
        if (!ast) {
            // invalid syntax, no new symbols to return.
            return symbols;
        }
        // try to go through the SourceFile AST node, one item at a time
        // SourceFile is a List-type node, so the children are the top-level
        // statements in the file.
        for (let child of ast.children) {
            // rather than doing all descendants, we can select just the immediate
            // children of the SourceFile node, which are the top-level statements.
            // we do not provide DocumentSymbols for statements typically.
            // therefore, we can only get top level statements which are definitions.
            // so I could potentially extract document symbols for just those.
            let childSymbol = getDocumentSymbolOfNode(child, textView);
            if (childSymbol) {
                symbols.push(childSymbol);
            }
        }
        return symbols;
    });
    return result;
});
//# sourceMappingURL=document-symbol.js.map