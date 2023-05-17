import { DiagnosticTag } from "vscode-languageserver";
import type { CWScriptLanguageServer } from "../server";
import { defineLanguageService } from "../language-service";

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
