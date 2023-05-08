import {
  createConnection,
  TextDocuments,
  ProposedFeatures,
  Connection,
  InitializeResult,
  TextDocumentSyncKind,
} from "vscode-languageserver/node";

import { TextDocument } from "vscode-languageserver-textdocument";

export type HandlerFn = (server: LanguageServer) => any;

export interface LanguageServerDefinition {
  hasCapability?: any;
  settings?: any;
  props?: any;
  handlers?: Array<HandlerFn>;
  beforeSetup?: (server: LanguageServer) => any;
  afterSetup?: (server: LanguageServer) => any;
  beforeEachHandler?: (
    server: LanguageServer,
    handler: HandlerFn,
    n: number
  ) => any;
  afterEachHandler?: (
    server: LanguageServer,
    handler: HandlerFn,
    n: number
  ) => any;
  beforeListen?: (server: LanguageServer) => any;
  afterListen?: (server: LanguageServer) => any;
}

export interface LanguageService {
  init?(result: InitializeResult): InitializeResult;
  register(server: LanguageServer): any;
}

export abstract class LanguageServer {
  public finishedSetup: boolean = false;
  public hasCapability: any = {};
  public settings: any = {};
  public documents: TextDocuments<TextDocument> = new TextDocuments(
    TextDocument
  );

  constructor(public connection: Connection) {}

  abstract setup(): any;
  public inferCapabilities(capabilities: any) {
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

  public listen() {
    if (!this.finishedSetup) {
      throw new Error("LanguageServer.setup() must be called before listen()");
    }
    this.documents.listen(this.connection);
    this.connection.listen();
  }

  public static Create(options: {
    serverInfo: { name: string; version: string };
    services: LanguageService[];
  }): { new (...args: any[]): LanguageServer } {
    const { serverInfo, services } = options;

    return LanguageServer.Define({
      props: { services },
      beforeSetup: (server) => {
        server.connection.onInitialize(({ capabilities }) => {
          server.inferCapabilities(capabilities);
          let result: InitializeResult = {
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

  public static Define(defn: LanguageServerDefinition): {
    new (...args: any[]): LanguageServer;
  } {
    let {
      hasCapability = {},
      settings = {},
      props = {},
      handlers = [],
      beforeSetup,
      afterSetup,
      beforeEachHandler,
      afterEachHandler,
      beforeListen,
      afterListen,
    } = defn;

    return class extends LanguageServer {
      constructor(connection: Connection) {
        super(connection);
        Object.assign(this.hasCapability, hasCapability);
        Object.assign(this.settings, settings);
        Object.assign(this, props);
      }

      public setup() {
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

      public listen() {
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

export function startLanguageServer<
  T extends { new (...args: any[]): LanguageServer }
>(serverConstructor: T, connection: Connection) {
  const server = new serverConstructor(connection);
  server.setup();
  server.listen();
}
