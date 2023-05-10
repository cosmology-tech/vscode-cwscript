"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LanguageServer = void 0;
const node_1 = require("vscode-languageserver/node");
const vscode_languageserver_textdocument_1 = require("vscode-languageserver-textdocument");
class LanguageServer {
    get connection() {
        if (!this._connection) {
            throw new Error("LanguageServer.connection not provided");
        }
        return this._connection;
    }
    constructor(serverInfo) {
        this.serverInfo = serverInfo;
        this.hasCapability = {};
        this.documents = new node_1.TextDocuments(vscode_languageserver_textdocument_1.TextDocument);
        this._connection = undefined;
    }
    __setup() {
        this.beforeSetup();
        this.setup();
        this.afterSetup();
    }
    beforeSetup() {
        this.connection.onInitialize(({ capabilities }) => {
            this.inferCapabilities(capabilities);
            let result = {
                capabilities: {},
                serverInfo: this.serverInfo,
            };
            // process each service
            for (let service of this.SERVICES) {
                if (service.init) {
                    result = service.init(result);
                }
            }
            return result;
        });
    }
    afterSetup() { }
    beforeRegisterService() { }
    afterRegisterService() {
        // noop
    }
    inferCapabilities(capabilities) {
        this.hasCapability["configuration"] = !!(capabilities.workspace && !!capabilities.workspace.configuration);
        this.hasCapability["workspaceFolder"] = !!(capabilities.workspace && !!capabilities.workspace.workspaceFolders);
        this.hasCapability["diagnosticRelatedInformation"] = !!(capabilities.textDocument &&
            capabilities.textDocument.publishDiagnostics &&
            capabilities.textDocument.publishDiagnostics.relatedInformation);
    }
    listen(connection) {
        this._connection = connection;
        this.__setup();
        this.documents.listen(this.connection);
        this.connection.listen();
    }
}
exports.LanguageServer = LanguageServer;
//# sourceMappingURL=language-server.js.map