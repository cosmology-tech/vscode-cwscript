import {
  Connection,
  InitializeResult,
  SemanticTokenModifiers,
  SemanticTokenTypes,
  SemanticTokens,
  SemanticTokensBuilder,
} from "vscode-languageserver/node";
import { TextDocument } from "vscode-languageserver-textdocument";
import { LanguageServer, LanguageService } from "../util/language-server";
import { AST, CWSParser } from "@terran-one/cwsc";
import { TextView } from "@terran-one/cwsc/dist/util/position";

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

const tokTypeToNum: Map<string, number> = new Map();
tokenTypesList.forEach((type, i) => tokTypeToNum.set(type, i));
const tokNumToType: Map<number, string> = new Map();
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

const tokModToNum: Map<string, number> = new Map();
tokenModifiersList.forEach((mod, i) => tokModToNum.set(mod, i));
const tokNumToMod: Map<number, string> = new Map();
tokenModifiersList.forEach((mod, i) => tokNumToMod.set(i, mod));

const LEGEND = {
  tokenTypes: tokenTypesList,
  tokenModifiers: tokenModifiersList,
};

function provideDocumentSemanticTokens(document: TextDocument): SemanticTokens {
  // TODO: implement the real semantic tokens
  let text = document.getText();
  let textView = new TextView(text);
  let parser = new CWSParser(text);
  let tb = new SemanticTokensBuilder();
  try {
    let ast = parser.parse();
    ast.descendantsOfType(AST.Param).forEach((param) => {
      if (param.name) {
        // get the range
        let { start, end } = textView.rangeOfNode(param.name.$ctx!)!;
        tb.push(
          start.line,
          start.character,
          end.character - start.character,
          tokTypeToNum.get("parameter")!,
          0
        );
      }
    });
    return tb.build();
  } catch (e) {
    console.log(e);
    console.log(parser.errors);
    return tb.build();
  }
}

export default {
  init(result: InitializeResult) {
    result.capabilities.semanticTokensProvider = {
      range: false,
      legend: LEGEND,
      full: {
        delta: false,
      },
    };
    return result;
  },

  register(server: LanguageServer) {
    const { connection } = server;
    connection.onRequest("textDocument/semanticTokens/full", (params) => {
      let doc = server.documents.get(params.textDocument.uri);
      return provideDocumentSemanticTokens(doc!);
    });
  },
};
