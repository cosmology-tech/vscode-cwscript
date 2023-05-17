import {
  InitializeResult,
  SymbolKind,
  DocumentSymbol,
  Range,
} from "vscode-languageserver";
import { LanguageServer } from "../language-server";
import { CWScriptLanguageServer } from "../server";
import { AST } from "@terran-one/cwsc";
import { TextView } from "@terran-one/cwsc/dist/util/position";
import { EnumVariantUnitDefn } from "@terran-one/cwsc/dist/stdlib";
import { InstantiateDefn } from "@terran-one/cwsc/dist/ast";
import { InstantiateDefnContext } from "@terran-one/cwsc/dist/grammar/CWScriptParser";
import { defineLanguageService } from "../language-service";

interface Constructor<T extends AST.AST> {
  new (...args: any[]): T;
  prototype: Object;
}

interface DocumentSymbolExtractorArgs<T extends AST.AST> {
  getName?(node: T): string;
  getKind(node: T): SymbolKind;
  getSelectionRange?(node: T, textView: TextView): Range;
  getDetail?(node: T): string;
}

type DocumentSymbolExtractor<T extends AST.AST = AST.AST> = (node: T, textView: TextView) => DocumentSymbol;

const documentSymbolRegistry = new Map<Constructor<any>, DocumentSymbolExtractor<any>>();

function registerExtractor<T extends AST.AST>(
  nodeType: Constructor<T>,
  extractor: DocumentSymbolExtractor<T>,
) {
  documentSymbolRegistry.set(nodeType, extractor);
}

function defineExtractor<T extends AST.AST>({
  getName = (node) => (node as any).name,
  getKind,
  getSelectionRange = (node, textView) => textView.rangeOfNode(node.$ctx!)!,
  getDetail,
}: DocumentSymbolExtractorArgs<T>) {
  return (node: T, textView: TextView) => ({
    name: getName(node),
    kind: getKind(node),
    range: getSelectionRange(node, textView),
    selectionRange: getSelectionRange(node, textView),
    detail: getDetail?.(node),
  });
}

registerExtractor(AST.FnDefn, defineExtractor({
  getKind: () => SymbolKind.Function,
}));

registerExtractor(AST.InstantiateDefn, defineExtractor({
  getKind: () => SymbolKind.Method,
  getSelectionRange: (node, textView) => {
    const {a, b} = (node.$ctx as InstantiateDefnContext).INSTANTIATE()!.sourceInterval!;
    return textView.range(a, b)!;
  },
}));

registerExtractor(AST.ExecDefn, defineExtractor({
  getKind: () => SymbolKind.Method,
}));

registerExtractor(AST.QueryDefn, defineExtractor({
  getKind: () => SymbolKind.Method,
}));

registerExtractor(AST.ContractDefn, defineExtractor({
  getKind: () => SymbolKind.Class,
}));

registerExtractor(AST.InterfaceDefn, defineExtractor({
  getKind: () => SymbolKind.Interface,
}));

registerExtractor(AST.StructDefn, defineExtractor({
  getKind: () => SymbolKind.Struct,
  getSelectionRange: (node, textView) => {
    const name = node.name;
    if (!name) {
      return textView.rangeOfNode(node.$ctx!)!;
    } else {
      return textView.rangeOfNode(name.$ctx!)!;
    }
  },
}));

registerExtractor(AST.EnumDefn, defineExtractor({
  getKind: () => SymbolKind.Enum,
}));

registerExtractor(AST.TypeAliasDefn, defineExtractor({
  getKind: () => SymbolKind.TypeParameter,
}));

registerExtractor(AST.Param, defineExtractor({
  getKind: () => SymbolKind.Variable,
}));

registerExtractor(AST.EnumVariantStruct, defineExtractor({
  getKind: () => SymbolKind.EnumMember,
}));

registerExtractor(AST.EnumVariantUnit, defineExtractor({
  getKind: () => SymbolKind.EnumMember,
}));

function getDocumentSymbolOfNode(
  node: AST.AST,
  textView: TextView
): DocumentSymbol | undefined {
  const extractor = documentSymbolRegistry.get(node.constructor as any);
  if (!extractor) return;
  
  const docSymbol = extractor(node, textView);

  docSymbol.children = node.descendants
    .map(c => getDocumentSymbolOfNode(c, textView))
    .filter(c => !!c) as DocumentSymbol[];

  return docSymbol;
}

export default defineLanguageService<CWScriptLanguageServer>(function(result) {
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
      cached = this.parseFile(
        params.textDocument.uri,
        this.documents.get(params.textDocument.uri)!.getText()
      );
    }

    let symbols: DocumentSymbol[] = [];
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
