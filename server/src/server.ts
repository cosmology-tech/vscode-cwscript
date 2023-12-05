import {
  Connection,
  createConnection,
  Diagnostic,
  ProposedFeatures,
} from "vscode-languageserver/node";

import { CWScriptParser } from "cwsc/dist/parser";
import * as AST from "cwsc/dist/ast";
import { TextView } from "cwsc/dist/util/position";

import { LanguageServer } from "./language-server";
import { LanguageService } from "./language-service";
// import SemanticTokensService from "./services/semantic-tokens";
// import SignatureHelpService from "./services/signature-help";
import DiagnosticsService from "./services/diagnostics";
import DocumentSymbolService from "./services/document-symbol";

const connection = createConnection(ProposedFeatures.all);
export type ParserListenerFn = (ctx: {
  uri: string;
  ast: AST.SourceFile;
  diagnostics: Diagnostic[];
}) => void;

export class CWScriptLanguageServer extends LanguageServer {
  public SERVER_INFO = {
    name: "cwsls",
    version: "0.0.1",
  };

  public SERVICES: LanguageService[] = [
    DiagnosticsService,
    DocumentSymbolService,
    // SemanticTokensService,
    // SignatureHelpService,
  ];

  public cache = new Map<
    string,
    {
      text: string;
      ast?: AST.SourceFile;
      diagnostics: Diagnostic[];
    }
  >();

  public parserListeners: ParserListenerFn[] = [];

  setup() {
    // initialize a parser cache
    this.documents.onDidChangeContent((change) => {
      const { uri } = change.document;
      const text = this.documents.get(uri)?.getText();
      if (text) this.parseFile(uri, text);
    });

    this.SERVICES.forEach((service) => {
      service.register(this);
    });
  }

  fileInfo(uri: string) {
    if (!this.cache.has(uri)) {
      return this.parseFile(uri, this.documents.get(uri)?.getText()!);
    } else {
      return this.cache.get(uri)!;
    }
  }

  parseFile(uri: string, text: string) {
    const parser = new CWScriptParser(text, uri);
    const { ast, diagnostics } = parser.parse();
    this.cache.set(uri, { text, ast, diagnostics });
    this.parserListeners.forEach((fn) => fn({ uri, ast: ast!, diagnostics }));
    return { text, ast, diagnostics };
  }
}

const cwsls = new CWScriptLanguageServer();
cwsls.listen(connection);
connection.listen();
