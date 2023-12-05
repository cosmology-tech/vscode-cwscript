"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LanguageServer = void 0;
const node_1 = require("vscode-languageserver/node");
const vscode_languageserver_textdocument_1 = require("vscode-languageserver-textdocument");
class LanguageServer {
    constructor() {
        this.capabilities = {};
        this.documents = new node_1.TextDocuments(vscode_languageserver_textdocument_1.TextDocument);
    }
    get connection() {
        if (!this._connection) {
            throw new Error("LanguageServer.connection not provided");
        }
        return this._connection;
    }
    /** Initialize the language server on the underlying connection. */
    initialize(baseResult) {
        for (const service of this.SERVICES) {
            baseResult = service.init ? service.init(baseResult) : baseResult;
        }
        return baseResult;
    }
    listen(connection) {
        this._connection = connection;
        connection.onInitialize(({ capabilities }) => {
            this.clientCapabilities = capabilities;
            const result = this.initialize({
                capabilities: {},
                serverInfo: this.SERVER_INFO,
            });
            this.capabilities = result.capabilities;
            return result;
        });
        this.setup();
        this.documents.listen(this.connection);
    }
    get useWorkspaceConfig() {
        return this.clientCapabilities?.workspace?.configuration ?? false;
    }
    get useWorkspaceFolders() {
        return this.clientCapabilities?.workspace?.workspaceFolders ?? false;
    }
    get useDiagnosticRelatedInformation() {
        return (this.clientCapabilities?.textDocument?.publishDiagnostics
            ?.relatedInformation ?? false);
    }
}
exports.LanguageServer = LanguageServer;
//# sourceMappingURL=language-server.js.map