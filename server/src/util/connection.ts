import { createConnection, ProposedFeatures } from "vscode-languageserver/node";

export function startConnection() {
  return createConnection(ProposedFeatures.all);
}
