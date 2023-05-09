import {
  createConnection,
  TextDocuments,
  ProposedFeatures,
  Connection,
  InitializeResult,
  TextDocumentSyncKind,
} from "vscode-languageserver/node";

import { TextDocument } from "vscode-languageserver-textdocument";

export type LanguageService<S extends LanguageServer> = {
  init?(result: InitializeResult): InitializeResult;
  register(server: S): any;
};

export abstract class LanguageServer {
  public hasCapability: any = {};
  public documents: TextDocuments<TextDocument> = new TextDocuments(
    TextDocument
  );

  abstract get SERVICES(): LanguageService<this>[];
  abstract get SERVER_INFO(): {
    name: string;
    version?: string;
  };

  public _connection: Connection | undefined = undefined;

  public get connection(): Connection {
    if (!this._connection) {
      throw new Error("LanguageServer.connection not provided");
    }
    return this._connection;
  }

  constructor(
    public serverInfo: {
      name: string;
      version?: string;
    }
  ) {}

  abstract setup(): any;

  private __setup() {
    this.beforeSetup();
    this.setup();
    this.afterSetup();
  }

  protected beforeSetup() {
    this.connection.onInitialize(({ capabilities }) => {
      this.inferCapabilities(capabilities);
      let result: InitializeResult = {
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

  protected afterSetup() {}

  protected beforeRegisterService() {}

  protected afterRegisterService() {
    // noop
  }

  public inferCapabilities(capabilities: any): void {
    this.hasCapability["configuration"] = !!(
      capabilities.workspace && !!capabilities.workspace.configuration
    );
    this.hasCapability["workspaceFolder"] = !!(
      capabilities.workspace && !!capabilities.workspace.workspaceFolders
    );
    this.hasCapability["diagnosticRelatedInformation"] = !!(
      capabilities.textDocument &&
      capabilities.textDocument.publishDiagnostics &&
      capabilities.textDocument.publishDiagnostics.relatedInformation
    );
  }

  public listen(connection: Connection) {
    this._connection = connection;
    this.__setup();
    this.documents.listen(this.connection);
    this.connection.listen();
  }
}
