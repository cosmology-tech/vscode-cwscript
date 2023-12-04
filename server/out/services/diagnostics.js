"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
<<<<<<< HEAD
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
=======
const language_service_1 = require("../language-service");
exports.default = (0, language_service_1.defineLanguageService)(function (result) {
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
//# sourceMappingURL=diagnostics.js.map