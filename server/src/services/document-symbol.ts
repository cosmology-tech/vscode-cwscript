import {
  InitializeResult,
  SymbolKind,
  DocumentSymbol,
  Range,
} from "vscode-languageserver";
import { LanguageServer } from "../util/language-server";
import type { CWScriptLanguageServer } from "../server";
import { AST } from "@terran-one/cwsc";
import { TextView } from "@terran-one/cwsc/dist/util/position";
import { EnumVariantUnitDefn } from "@terran-one/cwsc/dist/stdlib";
import { InstantiateDefn } from "@terran-one/cwsc/dist/ast";
import { InstantiateDefnContext } from "@terran-one/cwsc/dist/grammar/CWScriptParser";

function fnDefnSymbol(node: AST.FnDefn, textView: TextView): DocumentSymbol {
  let name = node.name;
  let selectionRange = textView.rangeOfNode(name.$ctx!)!;
  return {
    name: name.value,
    kind: SymbolKind.Function,
    range: textView.rangeOfNode(node.$ctx!)!,
    selectionRange,
    detail: "function detail",
  };
}

function instantiateDefnSymbol(node: AST.InstantiateDefn, textView: TextView): DocumentSymbol {
  let name = "#instantiate";
  let { a, b } = (node.$ctx as InstantiateDefnContext).INSTANTIATE()!.sourceInterval!;
  let selectionRange = textView.range(a, b)!;
  return {
    name: name,
    kind: SymbolKind.Method,
    range: textView.rangeOfNode(node.$ctx!)!,
    selectionRange,
    detail: "instantiate detail",
  };
};

function execDefnSymbol(node: AST.ExecDefn, textView: TextView): DocumentSymbol {
  let name = node.name;
  let selectionRange = textView.rangeOfNode(name.$ctx!)!;
  return {
    name: name.value,
    kind: SymbolKind.Method,
    range: textView.rangeOfNode(node.$ctx!)!,
    selectionRange,
    detail: "exec detail",
  };
}

function queryDefnSymbol(node: AST.QueryDefn, textView: TextView): DocumentSymbol {
  let name = node.name;
  let selectionRange = textView.rangeOfNode(name.$ctx!)!;
  return {
    name: name.value,
    kind: SymbolKind.Method,
    range: textView.rangeOfNode(node.$ctx!)!,
    selectionRange,
    detail: "query detail",
  };
}

function contractDefnSymbol(node: AST.ContractDefn, textView: TextView): DocumentSymbol {
  let name = node.name;
  let selectionRange = textView.rangeOfNode(name.$ctx!)!;
  return {
    name: name.value,
    kind: SymbolKind.Class,
    range: textView.rangeOfNode(node.$ctx!)!,
    selectionRange,
    detail: "contract detail",
  };
}

function interfaceDefnSymbol(node: AST.InterfaceDefn, textView: TextView): DocumentSymbol {
  let name = node.name;
  let selectionRange = textView.rangeOfNode(name.$ctx!)!;
  return {
    name: name.value,
    kind: SymbolKind.Interface,
    range: textView.rangeOfNode(node.$ctx!)!,
    selectionRange,
    detail: "interface detail",
  };
}

function structDefnSymbol(node: AST.StructDefn, textView: TextView): DocumentSymbol {
  let name = node.name;
  let selectionRange: Range;
  if (!name) {
    selectionRange = textView.rangeOfNode(node.$ctx!)!;
  } else {
    selectionRange = textView.rangeOfNode(name.$ctx!)!;
  }
  return {
    name: name?.value || "{anonymous}",
    kind: SymbolKind.Struct,
    range: textView.rangeOfNode(node.$ctx!)!,
    selectionRange,
    detail: "struct detail",
  };
}

function enumDefnSymbol(node: AST.EnumDefn, textView: TextView): DocumentSymbol {
  let name = node.name;
  let selectionRange = textView.rangeOfNode(name.$ctx!)!;
  return {
    name: name.value,
    kind: SymbolKind.Enum,
    range: textView.rangeOfNode(node.$ctx!)!,
    selectionRange,
    detail: "enum detail",
  };
}

function typeAliasDefnSymbol(node: AST.TypeAliasDefn, textView: TextView): DocumentSymbol {
  let name = node.name;
  let selectionRange = textView.rangeOfNode(name.$ctx!)!;
  return {
    name: name.value,
    kind: SymbolKind.TypeParameter,
    range: textView.rangeOfNode(node.$ctx!)!,
    selectionRange,
    detail: "type alias detail",
  };
};

function paramSymbol(node: AST.Param, textView: TextView): DocumentSymbol {
  let name = node.name;
  let selectionRange = textView.rangeOfNode(name.$ctx!)!;
  return {
    name: name.value,
    kind: SymbolKind.Variable,
    range: textView.rangeOfNode(node.$ctx!)!,
    selectionRange,
    detail: "param detail",
  };
};

function enumVariantDefnSymbol(node: AST.EnumVariantStruct | AST.EnumVariantUnit, textView: TextView): DocumentSymbol {
  let name = node.name;
  let selectionRange = textView.rangeOfNode(name.$ctx!)!;
  return {
    name: name.value,
    kind: SymbolKind.EnumMember,
    range: textView.rangeOfNode(node.$ctx!)!,
    selectionRange,
    detail: "enum variant detail",
  };
}

function getDocumentSymbolOfNode(node: AST.AST, textView: TextView): DocumentSymbol | undefined {
  let docSymbol: DocumentSymbol;
  if (node instanceof AST.FnDefn) {
    docSymbol = fnDefnSymbol(node, textView);
  } else if (node instanceof AST.InstantiateDefn) {
    docSymbol = instantiateDefnSymbol(node, textView);
  } else if (node instanceof AST.ExecDefn) {
    docSymbol = execDefnSymbol(node, textView);
  } else if (node instanceof AST.QueryDefn) {
    docSymbol = queryDefnSymbol(node, textView);
  } else if (node instanceof AST.ContractDefn) {
    docSymbol = contractDefnSymbol(node, textView);
  } else if (node instanceof AST.InterfaceDefn) {
    docSymbol = interfaceDefnSymbol(node, textView);
  } else if (node instanceof AST.StructDefn) {
    docSymbol = structDefnSymbol(node, textView);
  } else if (node instanceof AST.EnumDefn) {
    docSymbol = enumDefnSymbol(node, textView);
  } else if (node instanceof AST.EnumVariantStruct || node instanceof AST.EnumVariantUnit) { 
    docSymbol = enumVariantDefnSymbol(node, textView);
  } else if (node instanceof AST.TypeAliasDefn) {
    docSymbol = typeAliasDefnSymbol(node, textView);
  } else {
    return;
  }

  if (docSymbol) {
    docSymbol.children = node.descendants.map((child) => {
      return getDocumentSymbolOfNode(child, textView);
    }).filter(c => c !== undefined) as DocumentSymbol[];
  }
}

  let name = node.name;
  let selectionRange = textView.rangeOfNode(name.$ctx!)!;
  let symbol: DocumentSymbol = {
    name: name.value,
    kind: SymbolKind.Function,
    range: textView.rangeOfNode(node.$ctx!)!,
    selectionRange,
    children: [],
  };
  return symbol;
}

export default {
  init(result: InitializeResult) {
    result.capabilities.documentSymbolProvider = true;
    return result;
  },

  register(server: CWScriptLanguageServer) {
    server.connection.onDocumentSymbol((params) => {
      let cached = server.parseCache.get(params.textDocument.uri);
      if (!cached || !cached.ast) {
        return [];
      }
      let symbols: DocumentSymbol[] = [];
      let { ast, textView } = cached;
      // get all functions
      for (let func of ast.descendantsOfType(AST.FnDefn)) {
        let children = 
        let name = func.name;
        let selectionRange = textView.rangeOfNode(name.$ctx!)!;
        let symbol: DocumentSymbol = {
          name: name.value,
          kind: SymbolKind.Function,
          range: textView.rangeOfNode(func.$ctx!)!,
          selectionRange,
          children: [
            {

            }
          ],
        };
        symbols.push(symbol);
      }
    });
  },
};
