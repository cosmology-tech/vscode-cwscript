<<<<<<< HEAD
// import {
//   InitializeResult,
//   SymbolKind,
//   DocumentSymbol,
//   Range,
// } from "vscode-languageserver";
// import { LanguageServer } from "../util/language-server";
// import type { CWScriptLanguageServer } from "../server";
// import { AST } from "@terran-one/cwsc";
// import { TextView } from "@terran-one/cwsc/dist/util/position";
// import { EnumVariantUnitDefn } from "@terran-one/cwsc/dist/stdlib";
// import { InstantiateDefn } from "@terran-one/cwsc/dist/ast";
// import { InstantiateDefnContext } from "@terran-one/cwsc/dist/grammar/CWScriptParser";

// function fnDefnSymbol(node: AST.FnDefn, textView: TextView): DocumentSymbol {
//   let name = node.name;
//   let selectionRange = textView.rangeOfNode(name.$ctx!)!;
//   return {
//     name: name.value,
//     kind: SymbolKind.Function,
//     range: textView.rangeOfNode(node.$ctx!)!,
//     selectionRange,
//     detail: "function detail",
//   };
// }

// function instantiateDefnSymbol(
//   node: AST.InstantiateDefn,
//   textView: TextView
// ): DocumentSymbol {
//   let name = "#instantiate";
//   let { a, b } = (node.$ctx as InstantiateDefnContext).INSTANTIATE()!
//     .sourceInterval!;
//   let selectionRange = textView.range(a, b)!;
//   return {
//     name: name,
//     kind: SymbolKind.Method,
//     range: textView.rangeOfNode(node.$ctx!)!,
//     selectionRange,
//     detail: "instantiate detail",
//   };
// }

// function execDefnSymbol(
//   node: AST.ExecDefn,
//   textView: TextView
// ): DocumentSymbol {
//   let name = node.name;
//   let selectionRange = textView.rangeOfNode(name.$ctx!)!;
//   return {
//     name: name.value,
//     kind: SymbolKind.Method,
//     range: textView.rangeOfNode(node.$ctx!)!,
//     selectionRange,
//     detail: "exec detail",
//   };
// }

// function queryDefnSymbol(
//   node: AST.QueryDefn,
//   textView: TextView
// ): DocumentSymbol {
//   let name = node.name;
//   let selectionRange = textView.rangeOfNode(name.$ctx!)!;
//   return {
//     name: name.value,
//     kind: SymbolKind.Method,
//     range: textView.rangeOfNode(node.$ctx!)!,
//     selectionRange,
//     detail: "query detail",
//   };
// }

// function contractDefnSymbol(
//   node: AST.ContractDefn,
//   textView: TextView
// ): DocumentSymbol {
//   let name = node.name;
//   let selectionRange = textView.rangeOfNode(name.$ctx!)!;
//   return {
//     name: name.value,
//     kind: SymbolKind.Class,
//     range: textView.rangeOfNode(node.$ctx!)!,
//     selectionRange,
//     detail: "contract detail",
//   };
// }

// function interfaceDefnSymbol(
//   node: AST.InterfaceDefn,
//   textView: TextView
// ): DocumentSymbol {
//   let name = node.name;
//   let selectionRange = textView.rangeOfNode(name.$ctx!)!;
//   return {
//     name: name.value,
//     kind: SymbolKind.Interface,
//     range: textView.rangeOfNode(node.$ctx!)!,
//     selectionRange,
//     detail: "interface detail",
//   };
// }

// function structDefnSymbol(
//   node: AST.StructDefn,
//   textView: TextView
// ): DocumentSymbol {
//   let name = node.name;
//   let selectionRange: Range;
//   if (!name) {
//     selectionRange = textView.rangeOfNode(node.$ctx!)!;
//   } else {
//     selectionRange = textView.rangeOfNode(name.$ctx!)!;
//   }
//   return {
//     name: name?.value || "(anon struct)",
//     kind: SymbolKind.Struct,
//     range: textView.rangeOfNode(node.$ctx!)!,
//     selectionRange,
//     detail: "struct detail",
//   };
// }

// function enumDefnSymbol(
//   node: AST.EnumDefn,
//   textView: TextView
// ): DocumentSymbol {
//   let name = node.name;
//   let selectionRange = textView.rangeOfNode(name.$ctx!)!;
//   return {
//     name: name.value,
//     kind: SymbolKind.Enum,
//     range: textView.rangeOfNode(node.$ctx!)!,
//     selectionRange,
//     detail: "enum detail",
//   };
// }

// function typeAliasDefnSymbol(
//   node: AST.TypeAliasDefn,
//   textView: TextView
// ): DocumentSymbol {
//   let name = node.name;
//   let selectionRange = textView.rangeOfNode(name.$ctx!)!;
//   return {
//     name: name.value,
//     kind: SymbolKind.TypeParameter,
//     range: textView.rangeOfNode(node.$ctx!)!,
//     selectionRange,
//     detail: "type alias detail",
//   };
// }

// function paramSymbol(node: AST.Param, textView: TextView): DocumentSymbol {
//   let name = node.name;
//   let selectionRange = textView.rangeOfNode(name.$ctx!)!;
//   return {
//     name: name.value,
//     kind: SymbolKind.Variable,
//     range: textView.rangeOfNode(node.$ctx!)!,
//     selectionRange,
//     detail: "param detail",
//   };
// }

// function enumVariantDefnSymbol(
//   node: AST.EnumVariantStruct | AST.EnumVariantUnit,
//   textView: TextView
// ): DocumentSymbol {
//   let name = node.name;
//   let selectionRange = textView.rangeOfNode(name.$ctx!)!;
//   return {
//     name: name.value,
//     kind: SymbolKind.EnumMember,
//     range: textView.rangeOfNode(node.$ctx!)!,
//     selectionRange,
//     detail: "enum variant detail",
//   };
// }

// function getDocumentSymbolOfNode(
//   node: AST.AST,
//   textView: TextView
// ): DocumentSymbol | undefined {
//   let docSymbol: DocumentSymbol;
//   if (node instanceof AST.FnDefn) {
//     docSymbol = fnDefnSymbol(node, textView);
//   } else if (node instanceof AST.InstantiateDefn) {
//     docSymbol = instantiateDefnSymbol(node, textView);
//   } else if (node instanceof AST.ExecDefn) {
//     docSymbol = execDefnSymbol(node, textView);
//   } else if (node instanceof AST.QueryDefn) {
//     docSymbol = queryDefnSymbol(node, textView);
//   } else if (node instanceof AST.ContractDefn) {
//     docSymbol = contractDefnSymbol(node, textView);
//   } else if (node instanceof AST.InterfaceDefn) {
//     docSymbol = interfaceDefnSymbol(node, textView);
//   } else if (node instanceof AST.StructDefn) {
//     docSymbol = structDefnSymbol(node, textView);
//   } else if (node instanceof AST.EnumDefn) {
//     docSymbol = enumDefnSymbol(node, textView);
//   } else if (
//     node instanceof AST.EnumVariantStruct ||
//     node instanceof AST.EnumVariantUnit
//   ) {
//     docSymbol = enumVariantDefnSymbol(node, textView);
//   } else if (node instanceof AST.TypeAliasDefn) {
//     docSymbol = typeAliasDefnSymbol(node, textView);
//   } else {
//     return;
//   }

//   docSymbol.children = node.descendants
//     .map((child) => {
//       return getDocumentSymbolOfNode(child, textView);
//     })
//     .filter((c) => c !== undefined) as DocumentSymbol[];

//   return docSymbol;
// }

// export function updateDocumentSymbols(
//   server: CWScriptLanguageServer,
//   uri: string,
//   ast: AST.AST,
//   textView: TextView
// ) {
//   let docSymbol = getDocumentSymbolOfNode(ast, textView);
// }

// export default {
//   init(result: InitializeResult) {
//     result.capabilities.documentSymbolProvider = true;
//     return result;
//   },

//   register(server: CWScriptLanguageServer) {
//     // server.parserListeners.push((server, uri, ast, textView, parser) => {});

//     server.connection.onDocumentSymbol((params) => {
//       let cached = server.parseCache.get(params.textDocument.uri);
//       if (!cached) {
//         // the parser has not yet parsed this file, we need to trigger
//         // a parse; in that case, the parserListener which updates the
//         // document symbols will be responsible instead of the request handler here.

//         // another scenario is the cached AST is invalid, so there are no
//         // new symbols to return, and we can only the symbols of the last
//         // successful program parse.
//         cached = server.parseFile(
//           params.textDocument.uri,
//           server.documents.get(params.textDocument.uri)!.getText()
//         );
//       }

//       let symbols: DocumentSymbol[] = [];
//       let { ast, textView } = cached;
//       if (!ast) {
//         // invalid syntax, no new symbols to return.
//         return symbols;
//       }

//       // try to go through the SourceFile AST node, one item at a time
//       // SourceFile is a List-type node, so the children are the top-level
//       // statements in the file.
//       for (let child of ast.children) {
//         // rather than doing all descendants, we can select just the immediate
//         // children of the SourceFile node, which are the top-level statements.
//         // we do not provide DocumentSymbols for statements typically.
//         // therefore, we can only get top level statements which are definitions.
//         // so I could potentially extract document symbols for just those.
//         let childSymbol = getDocumentSymbolOfNode(child, textView);
//         if (childSymbol) {
//           symbols.push(childSymbol);
//         }
//       }
//       return symbols;
//     });
//   },
// };
=======
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

const getNodeName = (node: any) => node.name?.value ?? '<missing name>';

function registerExtractor<T extends AST.AST>(
  nodeType: Constructor<T>,
  extractor: DocumentSymbolExtractor<T>,
) {
  documentSymbolRegistry.set(nodeType, extractor);
}

function defineExtractor<T extends AST.AST>({
  getName = getNodeName,
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
  getName: () => 'instantiate',
  getKind: () => SymbolKind.Method,
  getSelectionRange: (node, textView) => textView.rangeOfToken(node.$ctx!, 'INSTANTIATE')!,
}));

registerExtractor(AST.ExecDefn, defineExtractor({
  getName: (node) => 'execute: ' + getNodeName(node),
  getKind: () => SymbolKind.Method,
}));

registerExtractor(AST.QueryDefn, defineExtractor({
  getName: (node) => 'query: ' + getNodeName(node),
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
      const process = (node: AST.AST) => {
        const symbols: DocumentSymbol[] = [];
        const extractor = documentSymbolRegistry.get(node.constructor as any);
        if (extractor) {
          const docSymbol = extractor(node, textView);
          docSymbol.children = node.children.flatMap(process).filter(c => !!c) as DocumentSymbol[];
          symbols.push(docSymbol);
        } else {
          symbols.push(...node.children.flatMap(process).filter(c => !!c) as DocumentSymbol[]);
        }
        return symbols;
      }
      return process(root);
    }
  });
  
  return result;
});
>>>>>>> 907b476c5563057b3ec4ff630845c7de9f6fff8d
