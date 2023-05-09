"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    init(result) {
        result.capabilities.hoverProvider = true;
        return result;
    },
    register(server) {
        const { connection } = server;
        // connection.onHover((params) => {
        //   let doc = server.documents.get(params.textDocument.uri);
        //   let pos = params.position;
        // });
    },
};
//# sourceMappingURL=hover.js.map