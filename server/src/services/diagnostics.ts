import { InitializeResult } from "vscode-languageserver";
import type { CWScriptLanguageServer } from "../server";

export default {
  init(result: InitializeResult) {
    result.capabilities.diagnosticProvider = {
      documentSelector: ["cwscript"],
      interFileDependencies: false, // TODO: implement and flip to true
      workspaceDiagnostics: false, // TODO: implement and flip to true
      identifier: "cwsls/diagnostics",
      id: "cwsls/diagnostics",
    };
    return result;
  },

  register(server: CWScriptLanguageServer) {
    const { connection, documents } = server;
    server.parserListeners.push(({ uri, diagnostics, ast }) => {
      connection.sendDiagnostics({ uri, diagnostics });
    });
  },
};
