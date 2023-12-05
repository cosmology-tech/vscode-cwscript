import {
  InitializeResult,
  SymbolKind,
  DocumentSymbol,
  Range,
} from "vscode-languageserver";
import type { CWScriptLanguageServer } from "../server";
import * as AST from "cwsc/dist/ast";
import { TextView } from "cwsc/dist/util/position";

export class CollectDocumentSymbolsVisitor extends AST.ASTVisitor<
  DocumentSymbol[]
> {
  public textView: TextView;
  public symbols: DocumentSymbol[] = [];

  constructor(public text: string) {
    super();
    this.textView = new TextView(text);
  }

  defaultVisit(node: AST.AST): DocumentSymbol[] {
    return this.collect(this.visitChildren(node));
  }

  collect(symbols: DocumentSymbol[][]): DocumentSymbol[] {
    return symbols.flat();
  }

  getRanges(
    rangeNode: AST.AST,
    selectorNode?: AST.AST
  ): { range: Range; selectionRange: Range } {
    let range = this.textView.rangeOfNode(rangeNode.$ctx!)!;
    if (!selectorNode) return { range, selectionRange: range };
    return {
      range,
      selectionRange: this.textView.rangeOfNode(selectorNode.$ctx!)!,
    };
  }

  visitSourceFile(node: AST.SourceFile): DocumentSymbol[] {
    return node.children.flatMap((child) => this.visit(child));
  }

  visitImportStmt(node: AST.ImportStmt): DocumentSymbol[] {
    const itemSymbols =
      node.items?.map((x) => ({
        name: x.value,
        // TODO: resolve kind
        kind: SymbolKind.Variable,
        ...this.getRanges(x),
      })) ?? [];
    // TODO: src
    return [...itemSymbols];
  }

  visitConstStmt(node: AST.ConstStmt): DocumentSymbol[] {
    let constSymbol = {
      name: node.name.value,
      kind: SymbolKind.Constant,
      ...this.getRanges(node, node.name),
      children: node.children.flatMap((child) => this.visit(child)),
    };
    return [constSymbol];
  }

  visitIdentBinding(node: AST.IdentBinding): DocumentSymbol[] {
    let bindingSymbol: DocumentSymbol = {
      name: node.name.value,
      kind: SymbolKind.Variable,
      ...this.getRanges(node, node.name),
      children: node.children.flatMap((child) => this.visit(child)),
    };
    return [bindingSymbol];
  }

  visitTupleBinding(node: AST.TupleBinding): DocumentSymbol[] {
    let namesSymbols = node.names.map((name) => ({
      name: name.value,
      kind: SymbolKind.Variable,
      ...this.getRanges(node, name),
      children: node.children.flatMap((child) => this.visit(child)),
    }));
    return [...namesSymbols];
  }

  visitStructBinding(node: AST.StructBinding): DocumentSymbol[] {
    let namesSymbols = node.names.map((name) => ({
      name: name.value,
      kind: SymbolKind.Variable,
      ...this.getRanges(node, name),
      children: node.children.flatMap((child) => this.visit(child)),
    }));
    return [...namesSymbols];
  }

  visitContractDefn(node: AST.ContractDefn): DocumentSymbol[] {
    let contractSymbol: DocumentSymbol = {
      name: node.name.value,
      kind: SymbolKind.Class,
      ...this.getRanges(node, node.name),
      children: node.children.flatMap((child) => this.visit(child)),
    };
    return [contractSymbol];
  }

  visitStateBlockDefn(node: AST.StateBlockDefn): DocumentSymbol[] {
    let stateBlockSymbol: DocumentSymbol = {
      name: "$state",
      kind: SymbolKind.Namespace,
      ...this.getRanges(node),
      children: node.children.flatMap((child) => this.visit(child)),
    };
    return [stateBlockSymbol];
  }

  visitStateItemDefn(node: AST.StateItemDefn): DocumentSymbol[] {
    let stateItemSymbol: DocumentSymbol = {
      name: node.name.value,
      kind: SymbolKind.Key,
      ...this.getRanges(node, node.name),
      children: node.children.flatMap((child) => this.visit(child)),
    };
    return [stateItemSymbol];
  }

  visitStateMapDefn(node: AST.StateMapDefn): DocumentSymbol[] {
    let stateMapSymbol: DocumentSymbol = {
      name: node.name.value,
      kind: SymbolKind.Key,
      ...this.getRanges(node, node.name),
      children: node.children.flatMap((child) => this.visit(child)),
    };
    return [stateMapSymbol];
  }

  visitFnDefn(node: AST.FnDefn): DocumentSymbol[] {
    let fnSymbol: DocumentSymbol = {
      name: `${node.name.value}${node.fallible ? "!" : ""}`,
      kind: SymbolKind.Function,
      ...this.getRanges(node, node.name),
      children: node.children.flatMap((child) => this.visit(child)),
    };
    return [fnSymbol];
  }

  visitInstantiateDefn(node: AST.InstantiateDefn): DocumentSymbol[] {
    let instantiateSymbol: DocumentSymbol = {
      name: `#instantiate`,
      kind: SymbolKind.Constructor,
      ...this.getRanges(node), // TODO: range of `#instantiate`
      children: node.children.flatMap((child) => this.visit(child)),
    };
    return [instantiateSymbol];
  }

  visitExecDefn(node: AST.ExecDefn): DocumentSymbol[] {
    let execSymbol: DocumentSymbol = {
      name: `exec ${node.name.value}`,
      kind: SymbolKind.Method,
      ...this.getRanges(node, node.name),
      children: node.children.flatMap((child) => this.visit(child)),
    };
    return [execSymbol];
  }

  visitQueryDefn(node: AST.QueryDefn): DocumentSymbol[] {
    let querySymbol: DocumentSymbol = {
      name: `query ${node.name.value}`,
      kind: SymbolKind.Method,
      ...this.getRanges(node, node.name),
      children: node.children.flatMap((child) => this.visit(child)),
    };
    return [querySymbol];
  }

  visitErrorDefn(node: AST.ErrorDefn): DocumentSymbol[] {
    let errorSymbol: DocumentSymbol = {
      name: node.name.value,
      kind: SymbolKind.Struct,
      ...this.getRanges(node, node.name),
      children: node.children.flatMap((child) => this.visit(child)),
    };
    return [errorSymbol];
  }

  visitEventDefn(node: AST.EventDefn): DocumentSymbol[] {
    let eventSymbol: DocumentSymbol = {
      name: node.name.value,
      kind: SymbolKind.Event,
      ...this.getRanges(node, node.name),
      children: node.children.flatMap((child) => this.visit(child)),
    };
    return [eventSymbol];
  }

  visitStructDefn(node: AST.StructDefn): DocumentSymbol[] {
    let structSymbol: DocumentSymbol = {
      name: node.name.value,
      kind: SymbolKind.Struct,
      ...this.getRanges(node, node.name),
      children: node.children.flatMap((child) => this.visit(child)),
    };
    return [structSymbol];
  }

  visitTupleDefn(node: AST.TupleDefn): DocumentSymbol[] {
    let tupleSymbol: DocumentSymbol = {
      name: node.name.value,
      kind: SymbolKind.Struct,
      ...this.getRanges(node, node.name),
      children: node.children.flatMap((child) => this.visit(child)),
    };
    return [tupleSymbol];
  }

  visitUnitDefn(node: AST.UnitDefn): DocumentSymbol[] {
    let unitSymbol: DocumentSymbol = {
      name: node.name.value,
      kind: SymbolKind.Struct,
      ...this.getRanges(node, node.name),
      children: node.children.flatMap((child) => this.visit(child)),
    };
    return [unitSymbol];
  }

  visitTypeAliasDefn(node: AST.TypeAliasDefn): DocumentSymbol[] {
    let typeAliasSymbol: DocumentSymbol = {
      name: node.name.value,
      kind: SymbolKind.TypeParameter,
      ...this.getRanges(node, node.name),
      children: node.children.flatMap((child) => this.visit(child)),
    };
    return [typeAliasSymbol];
  }

  visitEnumDefn(node: AST.EnumDefn): DocumentSymbol[] {
    let enumSymbol: DocumentSymbol = {
      name: node.name.value,
      kind: SymbolKind.Enum,
      ...this.getRanges(node, node.name),
      children: node.children.flatMap((child) => this.visit(child)),
    };
    return [enumSymbol];
  }

  visitEnumVariantStructDefn(
    node: AST.EnumVariantStructDefn
  ): DocumentSymbol[] {
    let enumVariantStructSymbol: DocumentSymbol = {
      name: node.name.value,
      kind: SymbolKind.EnumMember,
      ...this.getRanges(node, node.name),
      children: node.children.flatMap((child) => this.visit(child)),
    };
    return [enumVariantStructSymbol];
  }

  visitEnumVariantTupleDefn(node: AST.EnumVariantTupleDefn): DocumentSymbol[] {
    let enumVariantTupleSymbol: DocumentSymbol = {
      name: node.name.value,
      kind: SymbolKind.EnumMember,
      ...this.getRanges(node, node.name),
      children: node.children.flatMap((child) => this.visit(child)),
    };
    return [enumVariantTupleSymbol];
  }

  visitEnumVariantUnitDefn(node: AST.EnumVariantUnitDefn): DocumentSymbol[] {
    let enumVariantUnitSymbol: DocumentSymbol = {
      name: node.name.value,
      kind: SymbolKind.EnumMember,
      ...this.getRanges(node, node.name),
      children: node.children.flatMap((child) => this.visit(child)),
    };
    return [enumVariantUnitSymbol];
  }

  visitParam(node: AST.Param): DocumentSymbol[] {
    let paramSymbol: DocumentSymbol = {
      name: node.name.value,
      kind: SymbolKind.Field,
      ...this.getRanges(node, node.name),
      children: node.children.flatMap((child) => this.visit(child)),
    };
    return [paramSymbol];
  }

  visitTypeVar(node: AST.TypeVar): DocumentSymbol[] {
    let typeVarSymbol: DocumentSymbol = {
      name: node.value,
      kind: SymbolKind.TypeParameter,
      ...this.getRanges(node),
      children: node.children.flatMap((child) => this.visit(child)),
    };
    return [typeVarSymbol];
  }

  visitClosureExpr(node: AST.ClosureExpr): DocumentSymbol[] {
    let closureSymbol: DocumentSymbol = {
      name: `<anonymous>${node.fallible ? "!" : ""}`,
      kind: SymbolKind.Function,
      ...this.getRanges(node),
      children: node.children.flatMap((child) => this.visit(child)),
    };
    return [closureSymbol];
  }
}

export default {
  init(result: InitializeResult) {
    result.capabilities.documentSymbolProvider = true;
    return result;
  },

  register(server: CWScriptLanguageServer) {
    // server.parserListeners.push((server, uri, ast, textView, parser) => {});

    server.connection.onDocumentSymbol(({ textDocument }) => {
      const { text, ast, diagnostics } = server.fileInfo(textDocument.uri);
      const textView = new TextView(text);
      let symbols: DocumentSymbol[] = [];
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
