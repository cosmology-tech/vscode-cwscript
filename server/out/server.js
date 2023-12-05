"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CWScriptLanguageServer = void 0;
const node_1 = require("vscode-languageserver/node");
const parser_1 = require("cwsc/dist/parser");
const language_server_1 = require("./language-server");
// import SemanticTokensService from "./services/semantic-tokens";
// import SignatureHelpService from "./services/signature-help";
const diagnostics_1 = require("./services/diagnostics");
// import DocumentSymbolService from "./services/document-symbol";
const connection = (0, node_1.createConnection)(node_1.ProposedFeatures.all);
class CWScriptLanguageServer extends language_server_1.LanguageServer {
    constructor() {
        super(...arguments);
        this.SERVER_INFO = {
            name: "cwsls",
            version: "0.0.1",
        };
        this.SERVICES = [
            diagnostics_1.default,
            // DocumentSymbolService,
            // SemanticTokensService,
            // SignatureHelpService,
        ];
        this.cache = new Map();
        this.parserListeners = [];
    }
    setup() {
        // initialize a parser cache
        this.documents.onDidChangeContent((change) => {
            const { uri } = change.document;
            const source = this.documents.get(uri)?.getText();
            if (source)
                this.parseFile(uri, source);
        });
        this.SERVICES.forEach((service) => {
            service.register(this);
        });
    }
    parseFile(uri, source) {
        const parser = new parser_1.CWScriptParser(source, uri);
        const { ast, diagnostics } = parser.parse();
        this.cache.set(uri, { ast, diagnostics });
        this.parserListeners.forEach((fn) => fn({ uri, ast: ast, diagnostics }));
    }
}
exports.CWScriptLanguageServer = CWScriptLanguageServer;
const cwsls = new CWScriptLanguageServer();
cwsls.listen(connection);
connection.listen();
//# sourceMappingURL=server.js.map