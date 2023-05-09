"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    init(result) {
        result.capabilities.signatureHelpProvider = {
            triggerCharacters: ["("],
            retriggerCharacters: [","],
        };
        return result;
    },
    register(server) {
        const { connection } = server;
        connection.onSignatureHelp((params, token) => {
            let doc = server.documents.get(params.textDocument.uri);
            let pos = params.position;
            console.log(params);
            return {
                signatures: [
                    {
                        label: "fn-signature",
                        documentation: "sig-doc",
                        parameters: [
                            {
                                documentation: "param-doc",
                                label: "param-1",
                            },
                            {
                                documentation: "param-doc2",
                                label: "param-2",
                            },
                        ],
                    },
                ],
            };
        });
    },
};
//# sourceMappingURL=signature-help.js.map