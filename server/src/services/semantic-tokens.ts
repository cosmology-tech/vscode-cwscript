import {
  Connection,
  InitializeResult,
  SemanticTokenModifiers,
  SemanticTokenTypes,
  SemanticTokens,
  SemanticTokensBuilder,
} from "vscode-languageserver/node";
import { TextDocument } from "vscode-languageserver-textdocument";
import { AST, CWSParser } from "@terran-one/cwsc";
import { TextView } from "@terran-one/cwsc/dist/util/position";
import { defineLanguageService } from "../language-service";
import type { CWScriptLanguageServer } from "../server";

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

interface SemanticTokenEntry {
  line: number;
  character: number;
  length: number;
  tokenType: number;
  tokenModifiers: number;
}

function getSemanticToken(
  textView: TextView,
  node: AST.AST
): SemanticTokenEntry | undefined {
  if (!node.$ctx) {
    return undefined;
  }

  let { start, end } = textView.rangeOfNode(node.$ctx!)!;
  let line = start.line;
  let character = start.character;
  let length = end.character - start.character;
  let tokenModifiers = 0;
  let tokenType = undefined;

  if (node instanceof AST.Param) {
    tokenType = tokTypeToNum.get("parameter")!;
  }

  if (!tokenType) {
    return undefined;
  }

  return {
    line,
    character,
    length,
    tokenType,
    tokenModifiers,
  };
}

// strategy = walk over the generated parse tree document, and walk descendants
// if a particular descendant node is described by a semantic token, then apply the
// selection function against the node to get the range, and push the token type.

function provideDocumentSemanticTokens(document: TextDocument): SemanticTokens {
  // TODO: implement the real semantic tokens
  let text = document.getText();
  let textView = new TextView(text);
  let parser = new CWSParser(text);
  let tb = new SemanticTokensBuilder();
  try {
    let ast = parser.parse();

    for (let node of ast.walkDescendantsLF()) {
      let candidate = getSemanticToken(textView, node);
      if (candidate) {
        tb.push(
          candidate.line,
          candidate.character,
          candidate.length,
          candidate.tokenType,
          candidate.tokenModifiers
        );
      }
    }
    return tb.build();
  } catch (e) {
    console.log(e);
    console.log(parser.errors);
    return tb.build();
  }
}

export default defineLanguageService<CWScriptLanguageServer>(function(result) {
  result.capabilities.semanticTokensProvider = {
    range: false,
    legend: LEGEND,
    full: {
      delta: false,
    },
  };
  
  this.connection.onRequest("textDocument/semanticTokens/full", (params) => {
    let doc = this.documents.get(params.textDocument.uri);
    return provideDocumentSemanticTokens(doc!);
  });
  
  return result;
});
