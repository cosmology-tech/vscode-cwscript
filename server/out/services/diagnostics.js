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
        documents.onDidChangeContent((change) => {
            connection.sendDiagnostics({
                uri: change.document.uri,
                diagnostics: [
                // {
                //   severity: 1,
                //   range: {
                //     start: {
                //       line: 0,
                //       character: 0,
                //     },
                //     end: {
                //       line: 50,
                //       character: 50,
                //     },
                //   },
                //   message: "test error diagnostics",
                //   code: "E100",
                //   source: "cwsls",
                //   tags: [DiagnosticTag.Unnecessary],
                //   codeDescription: {
                //     href: "https://example.com",
                //   },
                // },
                ],
            });
        });
    },
};
//# sourceMappingURL=diagnostics.js.map