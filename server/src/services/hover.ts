import { InitializeResult } from "vscode-languageserver";
import { LanguageServer } from "../util/language-server";

export default {
  init(result: InitializeResult) {
    result.capabilities.hoverProvider = true;
    return result;
  },

  register(server: LanguageServer) {
    const { connection } = server;
    // connection.onHover((params) => {
    //   let doc = server.documents.get(params.textDocument.uri);
    //   let pos = params.position;
    // });
  },
};
