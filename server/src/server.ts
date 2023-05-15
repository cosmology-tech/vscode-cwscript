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

export interface ParseCacheEntry {
  textView: TextView;
  ast?: AST.SourceFile;
  parser: CWSParser;
}

export type ParserListenerFn = (
  uri: string,
  ast: AST.SourceFile | undefined,
  parser: CWSParser
) => void;
export type ParserListenerObj = {
  onParse: ParserListenerFn;
};
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
  
  public parseCache: Map<string, ParseCacheEntry> = new Map();
  public parserListeners: Array<ParserListenerFn | ParserListenerObj> = [];

  setup() {
    // initialize a parser cache
    this.documents.onDidChangeContent((change) => {
      const { uri } = change.document;
      const doc = this.documents.get(uri);
      this.parseFile(uri, doc!.getText());
    });
  }

  parseFile(uri: string, source: string): ParseCacheEntry {
    const textView = new TextView(source);
    const parser = new CWSParser(source);
    const ast = parser.parse();
    this.parseCache.set(uri, { ast, parser, textView });
    this.parserListeners.forEach((listener) => {
      if (typeof listener === "function") {
        listener(uri, ast, parser);
      } else {
        listener.onParse(uri, ast, parser);
      }
    });
    return { ast, parser, textView };
  }
}

const cwsls = new CWScriptLanguageServer();
cwsls.listen(connection);
connection.listen();
