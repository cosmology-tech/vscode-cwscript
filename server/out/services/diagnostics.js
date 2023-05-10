"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    init(result) {
        // result.capabilities.diagnosticProvider = {
        //   documentSelector: ["cwscript"],
        //   interFileDependencies: false, // TODO: implement and flip to true
        //   workspaceDiagnostics: false, // TODO: implement and flip to true
        //   identifier: "cwscript-identifier",
        //   id: "cwscript-id",
        // };
        return result;
    },
    register(server) {
        const { connection, documents } = server;
        server.parserListeners.push((uri, ast, parser) => {
            connection.sendDiagnostics({ uri, diagnostics: parser.diagnostics });
        });
    },
};
//# sourceMappingURL=diagnostics.js.map