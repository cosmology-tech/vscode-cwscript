import type { InitializeResult } from "vscode-languageserver/node";
import type { LanguageServer } from "./language-server";

export type LanguageService = {
  register(server: LanguageServer): void;
  init?(result: InitializeResult): InitializeResult;
};
