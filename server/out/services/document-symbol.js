"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_languageserver_1 = require("vscode-languageserver");
const cwsc_1 = require("@terran-one/cwsc");
const language_service_1 = require("../language-service");
function fnDefnSymbol(node, textView) {
    let name = node.name;
    let selectionRange = textView.rangeOfNode(name.$ctx);
    return {
        name: name.value,
        kind: vscode_languageserver_1.SymbolKind.Function,
        range: textView.rangeOfNode(node.$ctx),
        selectionRange,
        detail: "function detail",
    };
}
function instantiateDefnSymbol(node, textView) {
    let name = "#instantiate";
    let { a, b } = node.$ctx.INSTANTIATE()
        .sourceInterval;
    let selectionRange = textView.range(a, b);
    return {
        name: name,
        kind: vscode_languageserver_1.SymbolKind.Method,
        range: textView.rangeOfNode(node.$ctx),
        selectionRange,
        detail: "instantiate detail",
    };
}
function execDefnSymbol(node, textView) {
    let name = node.name;
    let selectionRange = textView.rangeOfNode(name.$ctx);
    return {
        name: name.value,
        kind: vscode_languageserver_1.SymbolKind.Method,
        range: textView.rangeOfNode(node.$ctx),
        selectionRange,
        detail: "exec detail",
    };
}
function queryDefnSymbol(node, textView) {
    let name = node.name;
    let selectionRange = textView.rangeOfNode(name.$ctx);
    return {
        name: name.value,
        kind: vscode_languageserver_1.SymbolKind.Method,
        range: textView.rangeOfNode(node.$ctx),
        selectionRange,
        detail: "query detail",
    };
}
function contractDefnSymbol(node, textView) {
    let name = node.name;
    let selectionRange = textView.rangeOfNode(name.$ctx);
    return {
        name: name.value,
        kind: vscode_languageserver_1.SymbolKind.Class,
        range: textView.rangeOfNode(node.$ctx),
        selectionRange,
        detail: "contract detail",
    };
}
function interfaceDefnSymbol(node, textView) {
    let name = node.name;
    let selectionRange = textView.rangeOfNode(name.$ctx);
    return {
        name: name.value,
        kind: vscode_languageserver_1.SymbolKind.Interface,
        range: textView.rangeOfNode(node.$ctx),
        selectionRange,
        detail: "interface detail",
    };
}
function structDefnSymbol(node, textView) {
    let name = node.name;
    let selectionRange;
    if (!name) {
        selectionRange = textView.rangeOfNode(node.$ctx);
    }
    else {
        selectionRange = textView.rangeOfNode(name.$ctx);
    }
    return {
        name: name?.value || "{anonymous}",
        kind: vscode_languageserver_1.SymbolKind.Struct,
        range: textView.rangeOfNode(node.$ctx),
        selectionRange,
        detail: "struct detail",
    };
}
function enumDefnSymbol(node, textView) {
    let name = node.name;
    let selectionRange = textView.rangeOfNode(name.$ctx);
    return {
        name: name.value,
        kind: vscode_languageserver_1.SymbolKind.Enum,
        range: textView.rangeOfNode(node.$ctx),
        selectionRange,
        detail: "enum detail",
    };
}
function typeAliasDefnSymbol(node, textView) {
    let name = node.name;
    let selectionRange = textView.rangeOfNode(name.$ctx);
    return {
        name: name.value,
        kind: vscode_languageserver_1.SymbolKind.TypeParameter,
        range: textView.rangeOfNode(node.$ctx),
        selectionRange,
        detail: "type alias detail",
    };
}
function paramSymbol(node, textView) {
    let name = node.name;
    let selectionRange = textView.rangeOfNode(name.$ctx);
    return {
        name: name.value,
        kind: vscode_languageserver_1.SymbolKind.Variable,
        range: textView.rangeOfNode(node.$ctx),
        selectionRange,
        detail: "param detail",
    };
}
function enumVariantDefnSymbol(node, textView) {
    let name = node.name;
    let selectionRange = textView.rangeOfNode(name.$ctx);
    return {
        name: name.value,
        kind: vscode_languageserver_1.SymbolKind.EnumMember,
        range: textView.rangeOfNode(node.$ctx),
        selectionRange,
        detail: "enum variant detail",
    };
}
function getDocumentSymbolOfNode(node, textView) {
    let docSymbol;
    if (node instanceof cwsc_1.AST.FnDefn) {
        docSymbol = fnDefnSymbol(node, textView);
    }
    else if (node instanceof cwsc_1.AST.InstantiateDefn) {
        docSymbol = instantiateDefnSymbol(node, textView);
    }
    else if (node instanceof cwsc_1.AST.ExecDefn) {
        docSymbol = execDefnSymbol(node, textView);
    }
    else if (node instanceof cwsc_1.AST.QueryDefn) {
        docSymbol = queryDefnSymbol(node, textView);
    }
    else if (node instanceof cwsc_1.AST.ContractDefn) {
        docSymbol = contractDefnSymbol(node, textView);
    }
    else if (node instanceof cwsc_1.AST.InterfaceDefn) {
        docSymbol = interfaceDefnSymbol(node, textView);
    }
    else if (node instanceof cwsc_1.AST.StructDefn) {
        docSymbol = structDefnSymbol(node, textView);
    }
    else if (node instanceof cwsc_1.AST.EnumDefn) {
        docSymbol = enumDefnSymbol(node, textView);
    }
    else if (node instanceof cwsc_1.AST.EnumVariantStruct ||
        node instanceof cwsc_1.AST.EnumVariantUnit) {
        docSymbol = enumVariantDefnSymbol(node, textView);
    }
    else if (node instanceof cwsc_1.AST.TypeAliasDefn) {
        docSymbol = typeAliasDefnSymbol(node, textView);
    }
    else {
        return;
    }
    docSymbol.children = node.descendants
        .map((child) => {
        return getDocumentSymbolOfNode(child, textView);
    })
        .filter((c) => c !== undefined);
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