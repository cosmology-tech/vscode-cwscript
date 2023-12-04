<<<<<<< HEAD
import { InitializeResult } from "vscode-languageserver";
=======
import { DiagnosticTag } from "vscode-languageserver";
>>>>>>> 907b476c5563057b3ec4ff630845c7de9f6fff8d
import type { CWScriptLanguageServer } from "../server";
import { defineLanguageService } from "../language-service";

<<<<<<< HEAD
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
=======
export default defineLanguageService<CWScriptLanguageServer>(function(result) {
  // result.capabilities.diagnosticProvider = {
  //   documentSelector: ["cwscript"],
  //   interFileDependencies: false, // TODO: implement and flip to true
  //   workspaceDiagnostics: false, // TODO: implement and flip to true
  //   identifier: "cwscript-identifier",
  //   id: "cwscript-id",
  // };
  
  this.parserListeners.push((parseEntry) => {
    if (parseEntry.status === 'success') {
      const { uri, parser } = parseEntry;
      this.connection.sendDiagnostics({ uri, diagnostics: parser.diagnostics });
    }
  });
  return result;
});
>>>>>>> 907b476c5563057b3ec4ff630845c7de9f6fff8d
