"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startConnection = void 0;
const node_1 = require("vscode-languageserver/node");
function startConnection() {
    return (0, node_1.createConnection)(node_1.ProposedFeatures.all);
}
exports.startConnection = startConnection;
//# sourceMappingURL=connection.js.map