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
  let tokensBuilder = new SemanticTokensBuilder();
  tokensBuilder.push(0, 5, 100, tokTypeToNum.get("comment")!, 0);
  tokensBuilder.push(14, 0, 100, tokTypeToNum.get("keyword")!, 0);
  return tokensBuilder.build();
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
