"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startLanguageServer = exports.LanguageServer = void 0;
const node_1 = require("vscode-languageserver/node");
const vscode_languageserver_textdocument_1 = require("vscode-languageserver-textdocument");
class LanguageServer {
    constructor(connection) {
        this.connection = connection;
        this.finishedSetup = false;
        this.hasCapability = {};
        this.settings = {};
        this.documents = new node_1.TextDocuments(vscode_languageserver_textdocument_1.TextDocument);
    }
    inferCapabilities(capabilities) {
        this.hasCapability["configuration"] = !!(capabilities.workspace && !!capabilities.workspace.configuration);
        this.hasCapability["workspaceFolder"] = !!(capabilities.workspace && !!capabilities.workspace.workspaceFolders);
        this.hasCapability["diagnosticRelatedInformation"] = !!(capabilities.textDocument &&
            capabilities.textDocument.publishDiagnostics &&
            capabilities.textDocument.publishDiagnostics.relatedInformation);
    }
    listen() {
        if (!this.finishedSetup) {
            throw new Error("LanguageServer.setup() must be called before listen()");
        }
        this.documents.listen(this.connection);
        this.connection.listen();
    }
    static Create(options) {
        const { serverInfo, services } = options;
        return LanguageServer.Define({
            props: { services },
            beforeSetup: (server) => {
                server.connection.onInitialize(({ capabilities }) => {
                    server.inferCapabilities(capabilities);
                    let result = {
                        capabilities: {},
                        serverInfo,
                    };
                    // process each service
                    for (let service of services) {
                        if (service.init) {
                            result = service.init(result);
                        }
                    }
                    return result;
                });
            },
            handlers: services.map((s) => s.register),
        });
    }
    static Define(defn) {
        let { hasCapability = {}, settings = {}, props = {}, handlers = [], beforeSetup, afterSetup, beforeEachHandler, afterEachHandler, beforeListen, afterListen, } = defn;
        return class extends LanguageServer {
            constructor(connection) {
                super(connection);
                Object.assign(this.hasCapability, hasCapability);
                Object.assign(this.settings, settings);
                Object.assign(this, props);
            }
            setup() {
                if (beforeSetup) {
                    beforeSetup(this);
                }
                for (let i = 0; i < handlers.length; i++) {
                    const handler = handlers[i];
                    if (beforeEachHandler) {
                        beforeEachHandler(this, handler, i);
                    }
                    handler(this);
                    if (afterEachHandler) {
                        afterEachHandler(this, handler, i);
                    }
                }
                if (afterSetup) {
                    afterSetup(this);
                }
                this.finishedSetup = true;
            }
            listen() {
                if (beforeListen) {
                    beforeListen(this);
                }
                super.listen();
                if (afterListen) {
                    afterListen(this);
                }
            }
        };
    }
}
exports.LanguageServer = LanguageServer;
function startLanguageServer(serverConstructor, connection) {
    const server = new serverConstructor(connection);
    server.setup();
    server.listen();
}
exports.startLanguageServer = startLanguageServer;
//# sourceMappingURL=language-server.js.map