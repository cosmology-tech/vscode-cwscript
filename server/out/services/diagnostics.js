"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const language_service_1 = require("../language-service");
exports.default = (0, language_service_1.defineLanguageService)(function (result) {
    // result.capabilities.diagnosticProvider = {
    //   documentSelector: ["cwscript"],
    //   interFileDependencies: false, // TODO: implement and flip to true
    //   workspaceDiagnostics: false, // TODO: implement and flip to true
    //   identifier: "cwscript-identifier",
    //   id: "cwscript-id",
    // };
    this.parserListeners.push((uri, ast, parser) => {
        this.connection.sendDiagnostics({ uri, diagnostics: parser.diagnostics });
    });
    return result;
});
//# sourceMappingURL=diagnostics.js.map