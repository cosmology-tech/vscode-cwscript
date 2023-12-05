import {
  ClientCapabilities,
  TextDocuments,
  ProposedFeatures,
  Connection,
  InitializeResult,
  TextDocumentSyncKind,
  ServerCapabilities,
} from "vscode-languageserver/node";
import { TextDocument } from "vscode-languageserver-textdocument";
import type { LanguageService } from "./language-service";

export abstract class LanguageServer {
  public clientCapabilities: ClientCapabilities | undefined;
  public capabilities: ServerCapabilities = {};
  public documents = new TextDocuments(TextDocument);
  protected _connection: Connection | undefined;

  abstract get SERVICES(): LanguageService[];
  abstract get SERVER_INFO(): {
    name: string;
    version?: string;
  };

  public get connection(): Connection {
    if (!this._connection) {
      throw new Error("LanguageServer.connection not provided");
    }
    return this._connection;
  }

  protected abstract setup(): any;

  /** Initialize the language server on the underlying connection. */
  protected initialize(baseResult: InitializeResult): InitializeResult {
    for (const service of this.SERVICES) {
      baseResult = service.init ? service.init(baseResult) : baseResult;
    }
    return baseResult;
  }

  public listen(connection: Connection) {
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

  public get useWorkspaceConfig(): boolean {
    return this.clientCapabilities?.workspace?.configuration ?? false;
  }
  public get useWorkspaceFolders(): boolean {
    return this.clientCapabilities?.workspace?.workspaceFolders ?? false;
  }
  public get useDiagnosticRelatedInformation(): boolean {
    return (
      this.clientCapabilities?.textDocument?.publishDiagnostics
        ?.relatedInformation ?? false
    );
  }
}
