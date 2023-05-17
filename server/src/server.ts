/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
import {
  Connection,
  createConnection,
  ProposedFeatures,
} from "vscode-languageserver/node";

import { LanguageServer } from "./language-server";
import type { LanguageService } from "./language-service";
import SemanticTokensService from "./services/semantic-tokens";
import SignatureHelpService from "./services/signature-help";
import DiagnosticsService from "./services/diagnostics";
import DocumentSymbolService from "./services/document-symbol";
import { AST, CWSParser } from "@terran-one/cwsc";
import { TextView } from "@terran-one/cwsc/dist/util/position";

const connection = createConnection(ProposedFeatures.all);

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

export class CWScriptLanguageServer extends LanguageServer {
  public SERVER_INFO = {
    name: "cwsls",
    version: "0.0.1",
  };
  public SERVICES: LanguageService<this>[] = [
    DiagnosticsService,
    DocumentSymbolService,
    SemanticTokensService,
    SignatureHelpService,
  ];
  
  private parseCache: Map<string, ParseCacheEntrySuccess> = new Map();
  public parserListeners: ParserListener[] = [];

  setup() {
    // initialize a parser cache
    this.documents.onDidChangeContent((change) => {
      const { uri } = change.document;
      const source = this.documents.get(uri)?.getText();
      if (source) this.parseFile(uri, source);
    });
  }
  
  getCachedOrParse(uri: string): ParseCacheEntry | undefined {
    if (this.parseCache.has(uri))
      return this.parseCache.get(uri);
    const source = this.documents.get(uri)?.getText();
    if (source) return this.parseFile(uri, source);
  }

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
  }
}

const cwsls = new CWScriptLanguageServer();
cwsls.listen(connection);
connection.listen();
