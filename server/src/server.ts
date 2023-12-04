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

import { CWScriptParser } from "cwsc/dist/parser";
import * as AST from "cwsc/dist/ast";
import { TextView } from "cwsc/dist/util/position";

import { LanguageServer, LanguageService } from "./util/language-server";
// import SemanticTokensService from "./services/semantic-tokens";
// import SignatureHelpService from "./services/signature-help";
import DiagnosticsService from "./services/diagnostics";
// import DocumentSymbolService from "./services/document-symbol";

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

  public SERVICES: LanguageService<this>[] = [
    DiagnosticsService,
    // DocumentSymbolService,
    // SemanticTokensService,
    // SignatureHelpService,
  ];

  public cache = new Map<
    string,
    {
      ast?: AST.SourceFile;
      diagnostics: Diagnostic[];
    }
  >();

  public parserListeners: ParserListenerFn[] = [];

  setup() {
    // initialiaze a parser cache
    this.documents.onDidChangeContent((change) => {
      const { uri } = change.document;
      const doc = this.documents.get(uri);
      this.parseFile(uri, doc!.getText());
    });

    this.SERVICES.forEach((service) => {
      service.register(this);
    });
  }

  parseFile(uri: string, source: string) {
    const parser = new CWScriptParser(source, uri);
    const { ast, diagnostics } = parser.parse();
    this.cache.set(uri, { ast, diagnostics });
    this.parserListeners.forEach((fn) => fn({ uri, ast: ast!, diagnostics }));
  }
}

const cwsls = new CWScriptLanguageServer({ name: "cwsls", version: "0.0.1" });
cwsls.listen(connection);
