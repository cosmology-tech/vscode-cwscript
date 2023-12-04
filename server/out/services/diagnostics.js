"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    init(result) {
        result.capabilities.diagnosticProvider = {
            documentSelector: ["cwscript"],
            interFileDependencies: false,
            workspaceDiagnostics: false,
            identifier: "cwsls/diagnostics",
            id: "cwsls/diagnostics",
        };
        return result;
    },
    register(server) {
        const { connection, documents } = server;
        server.parserListeners.push(({ uri, diagnostics, ast }) => {
            connection.sendDiagnostics({ uri, diagnostics });
        });
    },
};
//# sourceMappingURL=diagnostics.js.map