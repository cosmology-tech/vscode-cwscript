import { defineLanguageService } from "../language-service";
import type { CWScriptLanguageServer } from "../server";

export default defineLanguageService<CWScriptLanguageServer>(function(result) {
  result.capabilities.signatureHelpProvider = {
    triggerCharacters: ["("],
    retriggerCharacters: [","],
  };
  
  this.connection.onSignatureHelp((params, token) => {
    let doc = this.documents.get(params.textDocument.uri);
    let pos = params.position;
    console.log(params);
    return {
      signatures: [
        {
          label: "fn-signature",
          documentation: "sig-doc",
          parameters: [
            {
              documentation: "param-doc",
              label: "param-1",
            },
            {
              documentation: "param-doc2",
              label: "param-2",
            },
          ],
        },
      ],
    };
  });
  
  return result;
});
