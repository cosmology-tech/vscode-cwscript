"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const language_service_1 = require("../language-service");
exports.default = (0, language_service_1.defineLanguageService)(function (result) {
    result.capabilities.hoverProvider = true;
    // this.connection.onHover((params) => {
    //   let doc = this.documents.get(params.textDocument.uri);
    //   let pos = params.position;
    // });
    return result;
});
//# sourceMappingURL=hover.js.map