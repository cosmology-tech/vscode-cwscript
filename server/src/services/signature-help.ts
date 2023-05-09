import { InitializeResult } from "vscode-languageserver";
import { LanguageServer } from "../util/language-server";

export default {
  init(result: InitializeResult) {
    result.capabilities.signatureHelpProvider = {
      triggerCharacters: ["("],
      retriggerCharacters: [","],
    };
    return result;
  },

  register(server: LanguageServer) {
    const { connection } = server;
    connection.onSignatureHelp((params, token) => {
      let doc = server.documents.get(params.textDocument.uri);
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
  },
};
