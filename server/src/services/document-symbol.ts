import { AST } from "@terran-one/cwsc";
import { TextView } from "@terran-one/cwsc/dist/util/position";
import { InstantiateDefnContext } from "@terran-one/cwsc/dist/grammar/CWScriptParser";
import {
  SymbolKind,
  DocumentSymbol,
  Range,
} from "vscode-languageserver";
import { defineLanguageService } from "../language-service";
import { CWScriptLanguageServer, ParseCacheEntrySuccess } from "../server";

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
  getName = (node) => (node as any).name?.value,
  getKind,
  getSelectionRange = (node, textView) => textView.rangeOfNode(node.$ctx!)!,
  getDetail,
}: DocumentSymbolExtractorArgs<T>) {
  return (node: T, textView: TextView) => ({
    name: getName(node),
    kind: getKind(node),
    range: textView.rangeOfNode(node.$ctx!)!,
    selectionRange: getSelectionRange(node, textView),
    detail: getDetail?.(node) ?? '',
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

export default defineLanguageService<CWScriptLanguageServer>(function(result) {
  result.capabilities.documentSymbolProvider = true;

  this.connection.onDocumentSymbol((params) => {
    let cached = this.getCachedOrParse(params.textDocument.uri);
    if (!cached) return [];
    
    let parseEntry: ParseCacheEntrySuccess;
    if (cached.status === 'error') {
      if (!cached.previous) return [];
      parseEntry = cached.previous;
    } else {
      parseEntry = cached;
    }
    const { ast, textView } = parseEntry;
    return getDocumentSymbols(ast, textView);
    
    function getDocumentSymbols(root: AST.SourceFile, textView: TextView): DocumentSymbol[] {
      const symbols: DocumentSymbol[] = [];
      const process = (node: AST.AST) => {
        const extractor = documentSymbolRegistry.get(node.constructor as any);
        if (extractor) {
          const docSymbol = extractor(node, textView);
          docSymbol.children = node.descendants.map(process).filter(c => !!c) as DocumentSymbol[];
          symbols.push(docSymbol);
          return docSymbol;
        } else {
          node.descendants.forEach(process);
        }
      }
      process(ast);
      return symbols;
    }
  });
  
  return result;
});
