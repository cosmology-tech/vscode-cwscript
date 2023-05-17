"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cwsc_1 = require("@terran-one/cwsc");
const vscode_languageserver_1 = require("vscode-languageserver");
const language_service_1 = require("../language-service");
const documentSymbolRegistry = new Map();
function registerExtractor(nodeType, extractor) {
    documentSymbolRegistry.set(nodeType, extractor);
}
function defineExtractor({ getName = (node) => node.name?.value, getKind, getSelectionRange = (node, textView) => textView.rangeOfNode(node.$ctx), getDetail, }) {
    return (node, textView) => ({
        name: getName(node),
        kind: getKind(node),
        range: textView.rangeOfNode(node.$ctx),
        selectionRange: getSelectionRange(node, textView),
        detail: getDetail?.(node) ?? '',
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
exports.default = (0, language_service_1.defineLanguageService)(function (result) {
    result.capabilities.documentSymbolProvider = true;
    this.connection.onDocumentSymbol((params) => {
        let cached = this.getCachedOrParse(params.textDocument.uri);
        if (!cached)
            return [];
        let parseEntry;
        if (cached.status === 'error') {
            if (!cached.previous)
                return [];
            parseEntry = cached.previous;
        }
        else {
            parseEntry = cached;
        }
        const { ast, textView } = parseEntry;
        return getDocumentSymbols(ast, textView);
        function getDocumentSymbols(root, textView) {
            const symbols = [];
            const process = (node) => {
                const extractor = documentSymbolRegistry.get(node.constructor);
                if (extractor) {
                    const docSymbol = extractor(node, textView);
                    docSymbol.children = node.descendants.map(process).filter(c => !!c);
                    symbols.push(docSymbol);
                    return docSymbol;
                }
                else {
                    node.descendants.forEach(process);
                }
            };
            process(ast);
            return symbols;
        }
    });
    return result;
});
//# sourceMappingURL=document-symbol.js.map