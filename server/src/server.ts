/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
import {
  Connection,
  createConnection,
  Diagnostic,
  ProposedFeatures,
} from "vscode-languageserver/node";

<<<<<<< HEAD
import { CWScriptParser } from "cwsc/dist/parser";
import * as AST from "cwsc/dist/ast";
import { TextView } from "cwsc/dist/util/position";

import { LanguageServer, LanguageService } from "./util/language-server";
// import SemanticTokensService from "./services/semantic-tokens";
// import SignatureHelpService from "./services/signature-help";
=======
import { LanguageServer } from "./language-server";
import type { LanguageService } from "./language-service";
import SemanticTokensService from "./services/semantic-tokens";
import SignatureHelpService from "./services/signature-help";
>>>>>>> 907b476c5563057b3ec4ff630845c7de9f6fff8d
import DiagnosticsService from "./services/diagnostics";
// import DocumentSymbolService from "./services/document-symbol";

const connection = createConnection(ProposedFeatures.all);
export type ParserListenerFn = (ctx: {
  uri: string;
  ast: AST.SourceFile;
  diagnostics: Diagnostic[];
}) => void;

<<<<<<< HEAD
=======
export type ParseCacheEntrySuccess = {
  status: 'success';
  /** URI of the parsed CWScript resource */
  uri: string;
  textView: TextView;
  ast: AST.SourceFile;
  parser: CWSParser;
}
export type ParseCacheEntryError = {
  status: 'error';
  /** Resource URI of the source file that failed to parse with CWScript */
  uri: string;
  /** Cache entry of the last successful parse */
  previous: ParseCacheEntrySuccess | undefined;
  error: any;
}
export type ParseCacheEntry = ParseCacheEntrySuccess | ParseCacheEntryError;

export type ParserListenerFn = (entry: ParseCacheEntry) => void;
export type ParserListenerObj = {
  onParse: ParserListenerFn;
};
export type ParserListener = ParserListenerFn | ParserListenerObj;

>>>>>>> 907b476c5563057b3ec4ff630845c7de9f6fff8d
export class CWScriptLanguageServer extends LanguageServer {
  public SERVER_INFO = {
    name: "cwsls",
    version: "0.0.1",
  };
  public SERVICES: LanguageService<this>[] = [
    DiagnosticsService,
    // DocumentSymbolService,
    // SemanticTokensService,
    // SignatureHelpService,
  ];
  
  private parseCache: Map<string, ParseCacheEntrySuccess> = new Map();
  public parserListeners: ParserListener[] = [];

  public cache = new Map<
    string,
    {
      ast?: AST.SourceFile;
      diagnostics: Diagnostic[];
    }
  >();

  public parserListeners: ParserListenerFn[] = [];

  setup() {
    // initialize a parser cache
    this.documents.onDidChangeContent((change) => {
      const { uri } = change.document;
      const source = this.documents.get(uri)?.getText();
      if (source) this.parseFile(uri, source);
    });

    this.SERVICES.forEach((service) => {
      service.register(this);
    });
  }
  
  getCachedOrParse(uri: string): ParseCacheEntry | undefined {
    if (this.parseCache.has(uri))
      return this.parseCache.get(uri);
    const source = this.documents.get(uri)?.getText();
    if (source) return this.parseFile(uri, source);
  }

<<<<<<< HEAD
  parseFile(uri: string, source: string) {
    const parser = new CWScriptParser(source, uri);
    const { ast, diagnostics } = parser.parse();
    this.cache.set(uri, { ast, diagnostics });
    this.parserListeners.forEach((fn) => fn({ uri, ast: ast!, diagnostics }));
=======
  parseFile(uri: string, source: string): ParseCacheEntry | undefined {
    try {
      const textView = new TextView(source);
      const parser = new CWSParser(source);
      const ast = parser.parse();
      
      const entry: ParseCacheEntry = { status: 'success', uri, textView, ast, parser };
      this.parseCache.set(uri, entry);
      
      this.parserListeners.forEach((listener) => {
        if (typeof listener === "function") {
          listener(entry);
        } else {
          listener.onParse(entry);
        }
      });
      return entry;
    } catch (e) {
      return {
        status: 'error',
        uri,
        previous: this.parseCache.get(uri),
        error: e,
      };
    }
>>>>>>> 907b476c5563057b3ec4ff630845c7de9f6fff8d
  }
}

const cwsls = new CWScriptLanguageServer();
cwsls.listen(connection);
connection.listen();
