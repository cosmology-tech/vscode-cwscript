"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CollectDocumentSymbolsVisitor = void 0;
const vscode_languageserver_1 = require("vscode-languageserver");
const AST = require("cwsc/dist/ast");
const position_1 = require("cwsc/dist/util/position");
class CollectDocumentSymbolsVisitor extends AST.ASTVisitor {
    constructor(text) {
        super();
        this.text = text;
        this.symbols = [];
        this.textView = new position_1.TextView(text);
    }
    defaultVisit(node) {
        return this.collect(this.visitChildren(node));
    }
    collect(symbols) {
        return symbols.flat();
    }
    getRanges(rangeNode, selectorNode) {
        let range = this.textView.rangeOfNode(rangeNode.$ctx);
        if (!selectorNode)
            return { range, selectionRange: range };
        return {
            range,
            selectionRange: this.textView.rangeOfNode(selectorNode.$ctx),
        };
    }
    visitSourceFile(node) {
        return node.children.flatMap((child) => this.visit(child));
    }
    visitImportStmt(node) {
        const itemSymbols = node.items?.map((x) => ({
            name: x.value,
            // TODO: resolve kind
            kind: vscode_languageserver_1.SymbolKind.Variable,
            ...this.getRanges(x),
        })) ?? [];
        // TODO: src
        return [...itemSymbols];
    }
    visitConstStmt(node) {
        let constSymbol = {
            name: node.name.value,
            kind: vscode_languageserver_1.SymbolKind.Constant,
            ...this.getRanges(node, node.name),
            children: node.children.flatMap((child) => this.visit(child)),
        };
        return [constSymbol];
    }
    visitIdentBinding(node) {
        let bindingSymbol = {
            name: node.name.value,
            kind: vscode_languageserver_1.SymbolKind.Variable,
            ...this.getRanges(node, node.name),
            children: node.children.flatMap((child) => this.visit(child)),
        };
        return [bindingSymbol];
    }
    visitTupleBinding(node) {
        let namesSymbols = node.names.map((name) => ({
            name: name.value,
            kind: vscode_languageserver_1.SymbolKind.Variable,
            ...this.getRanges(node, name),
            children: node.children.flatMap((child) => this.visit(child)),
        }));
        return [...namesSymbols];
    }
    visitStructBinding(node) {
        let namesSymbols = node.names.map((name) => ({
            name: name.value,
            kind: vscode_languageserver_1.SymbolKind.Variable,
            ...this.getRanges(node, name),
            children: node.children.flatMap((child) => this.visit(child)),
        }));
        return [...namesSymbols];
    }
    visitContractDefn(node) {
        let contractSymbol = {
            name: node.name.value,
            kind: vscode_languageserver_1.SymbolKind.Class,
            ...this.getRanges(node, node.name),
            children: node.children.flatMap((child) => this.visit(child)),
        };
        return [contractSymbol];
    }
    visitStateBlockDefn(node) {
        let stateBlockSymbol = {
            name: "$state",
            kind: vscode_languageserver_1.SymbolKind.Namespace,
            ...this.getRanges(node),
            children: node.children.flatMap((child) => this.visit(child)),
        };
        return [stateBlockSymbol];
    }
    visitStateItemDefn(node) {
        let stateItemSymbol = {
            name: node.name.value,
            kind: vscode_languageserver_1.SymbolKind.Key,
            ...this.getRanges(node, node.name),
            children: node.children.flatMap((child) => this.visit(child)),
        };
        return [stateItemSymbol];
    }
    visitStateMapDefn(node) {
        let stateMapSymbol = {
            name: node.name.value,
            kind: vscode_languageserver_1.SymbolKind.Key,
            ...this.getRanges(node, node.name),
            children: node.children.flatMap((child) => this.visit(child)),
        };
        return [stateMapSymbol];
    }
    visitFnDefn(node) {
        let fnSymbol = {
            name: `${node.name.value}${node.fallible ? "!" : ""}`,
            kind: vscode_languageserver_1.SymbolKind.Function,
            ...this.getRanges(node, node.name),
            children: node.children.flatMap((child) => this.visit(child)),
        };
        return [fnSymbol];
    }
    visitInstantiateDefn(node) {
        let instantiateSymbol = {
            name: `#instantiate`,
            kind: vscode_languageserver_1.SymbolKind.Constructor,
            ...this.getRanges(node),
            children: node.children.flatMap((child) => this.visit(child)),
        };
        return [instantiateSymbol];
    }
    visitExecDefn(node) {
        let execSymbol = {
            name: `exec ${node.name.value}`,
            kind: vscode_languageserver_1.SymbolKind.Method,
            ...this.getRanges(node, node.name),
            children: node.children.flatMap((child) => this.visit(child)),
        };
        return [execSymbol];
    }
    visitQueryDefn(node) {
        let querySymbol = {
            name: `query ${node.name.value}`,
            kind: vscode_languageserver_1.SymbolKind.Method,
            ...this.getRanges(node, node.name),
            children: node.children.flatMap((child) => this.visit(child)),
        };
        return [querySymbol];
    }
    visitErrorDefn(node) {
        let errorSymbol = {
            name: node.name.value,
            kind: vscode_languageserver_1.SymbolKind.Struct,
            ...this.getRanges(node, node.name),
            children: node.children.flatMap((child) => this.visit(child)),
        };
        return [errorSymbol];
    }
    visitEventDefn(node) {
        let eventSymbol = {
            name: node.name.value,
            kind: vscode_languageserver_1.SymbolKind.Event,
            ...this.getRanges(node, node.name),
            children: node.children.flatMap((child) => this.visit(child)),
        };
        return [eventSymbol];
    }
    visitStructDefn(node) {
        let structSymbol = {
            name: node.name.value,
            kind: vscode_languageserver_1.SymbolKind.Struct,
            ...this.getRanges(node, node.name),
            children: node.children.flatMap((child) => this.visit(child)),
        };
        return [structSymbol];
    }
    visitTupleDefn(node) {
        let tupleSymbol = {
            name: node.name.value,
            kind: vscode_languageserver_1.SymbolKind.Struct,
            ...this.getRanges(node, node.name),
            children: node.children.flatMap((child) => this.visit(child)),
        };
        return [tupleSymbol];
    }
    visitUnitDefn(node) {
        let unitSymbol = {
            name: node.name.value,
            kind: vscode_languageserver_1.SymbolKind.Struct,
            ...this.getRanges(node, node.name),
            children: node.children.flatMap((child) => this.visit(child)),
        };
        return [unitSymbol];
    }
    visitTypeAliasDefn(node) {
        let typeAliasSymbol = {
            name: node.name.value,
            kind: vscode_languageserver_1.SymbolKind.TypeParameter,
            ...this.getRanges(node, node.name),
            children: node.children.flatMap((child) => this.visit(child)),
        };
        return [typeAliasSymbol];
    }
    visitEnumDefn(node) {
        let enumSymbol = {
            name: node.name.value,
            kind: vscode_languageserver_1.SymbolKind.Enum,
            ...this.getRanges(node, node.name),
            children: node.children.flatMap((child) => this.visit(child)),
        };
        return [enumSymbol];
    }
    visitEnumVariantStructDefn(node) {
        let enumVariantStructSymbol = {
            name: node.name.value,
            kind: vscode_languageserver_1.SymbolKind.EnumMember,
            ...this.getRanges(node, node.name),
            children: node.children.flatMap((child) => this.visit(child)),
        };
        return [enumVariantStructSymbol];
    }
    visitEnumVariantTupleDefn(node) {
        let enumVariantTupleSymbol = {
            name: node.name.value,
            kind: vscode_languageserver_1.SymbolKind.EnumMember,
            ...this.getRanges(node, node.name),
            children: node.children.flatMap((child) => this.visit(child)),
        };
        return [enumVariantTupleSymbol];
    }
    visitEnumVariantUnitDefn(node) {
        let enumVariantUnitSymbol = {
            name: node.name.value,
            kind: vscode_languageserver_1.SymbolKind.EnumMember,
            ...this.getRanges(node, node.name),
            children: node.children.flatMap((child) => this.visit(child)),
        };
        return [enumVariantUnitSymbol];
    }
    visitParam(node) {
        let paramSymbol = {
            name: node.name.value,
            kind: vscode_languageserver_1.SymbolKind.Field,
            ...this.getRanges(node, node.name),
            children: node.children.flatMap((child) => this.visit(child)),
        };
        return [paramSymbol];
    }
    visitTypeVar(node) {
        let typeVarSymbol = {
            name: node.value,
            kind: vscode_languageserver_1.SymbolKind.TypeParameter,
            ...this.getRanges(node),
            children: node.children.flatMap((child) => this.visit(child)),
        };
        return [typeVarSymbol];
    }
    visitClosureExpr(node) {
        let closureSymbol = {
            name: `<anonymous>${node.fallible ? "!" : ""}`,
            kind: vscode_languageserver_1.SymbolKind.Function,
            ...this.getRanges(node),
            children: node.children.flatMap((child) => this.visit(child)),
        };
        return [closureSymbol];
    }
}
exports.CollectDocumentSymbolsVisitor = CollectDocumentSymbolsVisitor;
exports.default = {
    init(result) {
        result.capabilities.documentSymbolProvider = true;
        return result;
    },
    register(server) {
        // server.parserListeners.push((server, uri, ast, textView, parser) => {});
        server.connection.onDocumentSymbol(({ textDocument }) => {
            const { text, ast, diagnostics } = server.fileInfo(textDocument.uri);
            const textView = new position_1.TextView(text);
            let symbols = [];
            if (!ast) {
                // invalid syntax, no new symbols to return.
                return symbols;
            }
            const visitor = new CollectDocumentSymbolsVisitor(text);
            symbols = visitor.visitSourceFile(ast);
            return symbols;
        });
    },
};
//# sourceMappingURL=document-symbol.js.map