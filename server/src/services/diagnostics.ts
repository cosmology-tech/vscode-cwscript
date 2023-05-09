import { DiagnosticTag, InitializeResult } from "vscode-languageserver";
import { LanguageServer } from "../util/language-server";
import type { CWScriptLanguageServer } from "../server";

export default {
  init(result: InitializeResult) {
    // result.capabilities.diagnosticProvider = {
    //   documentSelector: ["cwscript"],
    //   interFileDependencies: false, // TODO: implement and flip to true
    //   workspaceDiagnostics: false, // TODO: implement and flip to true
    //   identifier: "cwscript-identifier",
    //   id: "cwscript-id",
    // };
    return result;
  },

  register(server: CWScriptLanguageServer) {
    const { connection, documents } = server;
    server.parserListeners.push((uri, ast, parser) => {
      connection.sendDiagnostics({ uri, diagnostics: parser.diagnostics });
    });
  },
};
