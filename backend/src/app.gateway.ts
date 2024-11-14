import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WebSocketGateway,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { SocketEvent } from './events';
import { SocketMap, SocketRegistry } from './models/SocketRegistry';
import { LogEntry, SocketMeta, SocketType } from './types';

@WebSocketGateway()
export class AppGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  constructor() {}

  socketRegistry: SocketRegistry = new SocketRegistry();

  afterInit(server: Server): any {
    server.use((socket, next: () => void) => {
      Object.defineProperty(socket, 'meta', {
        enumerable: true,
        get(): SocketMeta {
          const id = this.conn.request._query.user || this.conn.request._query.id;
          const type = this.conn.request._query.type;
          const subId = this.conn.request._query.subId;
          return { id, type, subId };
        },
      });
      next();
    });
  }

  handleConnection(socket: Socket): any {
    socket = this.socketRegistry.add(socket);
    socket.setMaxListeners(0);

    if (socket.meta.type === SocketType.Debugger) {
      this.setupDebuggerEventListeners(socket);

      if (this.socketRegistry.has({ id: socket.meta.id, type: SocketType.App })) {
        this.socketRegistry.emit(
          { id: socket.meta.id, type: SocketType.Debugger },
          SocketEvent.DebuggingAvailable,
        );
        this.socketRegistry.emit(
          { id: socket.meta.id, type: SocketType.App },
          SocketEvent.DebuggingAvailable,
        );
      }
    }

    if (socket.meta.type === SocketType.App) {
      this.setupAppEventListeners(socket);

      const debuggerSocketMap = this.socketRegistry.get({
        id: socket.meta.id,
        type: SocketType.Debugger,
      }) as SocketMap | undefined;
      if (debuggerSocketMap && Object.keys(debuggerSocketMap).length) {
        this.socketRegistry.emit(
          { id: socket.meta.id, type: SocketType.Debugger },
          SocketEvent.DebuggingAvailable,
        );
        this.socketRegistry.emit(
          { id: socket.meta.id, type: SocketType.App },
          SocketEvent.DebuggingAvailable,
        );
      }
    }
  }

  handleDisconnect(socket: Socket): any {
    this.socketRegistry.remove(socket);
    socket.removeAllListeners();

    if (socket.meta.type === SocketType.App) {
      this.socketRegistry.emit(
        { id: socket.meta.id, type: SocketType.Debugger },
        SocketEvent.DebuggingUnavailable,
      );
    }

    if (socket.meta.type === SocketType.Debugger) {
      const debuggerSocketMap = this.socketRegistry.get({
        id: socket.meta.id,
        type: SocketType.Debugger,
      }) as SocketMap | undefined;
      if (!debuggerSocketMap || !Object.keys(debuggerSocketMap || {}).length) {
        this.socketRegistry.emit(
          { id: socket.meta.id, type: SocketType.App },
          SocketEvent.DebuggingUnavailable,
        );
      }
    }
  }

  private setupDebuggerEventListeners(socket: Socket) {
    socket.on(SocketEvent.DebuggerLanguageModelRequest, () =>
      this.socketRegistry.emit(
        { id: socket.meta.id, type: SocketType.App },
        SocketEvent.DebuggerLanguageModelRequest,
      ),
    );
    socket.on(SocketEvent.DebuggerRequest, async (request: any) => {
      if (this.socketRegistry.has({ id: socket.meta.id, type: SocketType.App })) {
        const logEntry: LogEntry = {
          id: socket.meta.id,
          debugger: true,
          // TODO: refactor beneath
          type: request.platform === 'AlexaSkill' ? 'Alexa' : 'GoogleAction',
        };
        this.socketRegistry.emit(
          { id: socket.meta.id, type: SocketType.App },
          SocketEvent.DebuggerRequest,
          request,
        );
      }
    });
  }

  private setupAppEventListeners(socket: Socket) {
    const id = socket.meta.id;
    socket.on(SocketEvent.AppJovoUpdate, (payload: any) => {
      this.socketRegistry.emit(
        { id, type: SocketType.Debugger },
        SocketEvent.AppJovoUpdate,
        payload,
      );
    });
    socket.on(SocketEvent.AppStateMutation, (payload: any) => {
      this.socketRegistry.emit(
        { id, type: SocketType.Debugger },
        SocketEvent.AppStateMutation,
        payload,
      );
    });
    socket.on(SocketEvent.AppRequest, (request: any) =>
      this.socketRegistry.emit({ id, type: SocketType.Debugger }, SocketEvent.AppRequest, request),
    );
    socket.on(SocketEvent.AppResponse, (response: any) => {
      if (!response.requestId) {
        return;
      }
      this.socketRegistry.emit(
        { id, type: SocketType.Debugger },
        SocketEvent.AppResponse,
        response,
      );
    });
    socket.on(SocketEvent.AppLanguageModelResponse, (languageModel: any) =>
      this.socketRegistry.emit(
        { id, type: SocketType.Debugger },
        SocketEvent.AppLanguageModelResponse,
        languageModel,
      ),
    );
    socket.on(SocketEvent.AppDebuggerConfigResponse, (debuggerConfig: any) =>
      this.socketRegistry.emit(
        { id, type: SocketType.Debugger },
        SocketEvent.AppDebuggerConfigResponse,
        debuggerConfig,
      ),
    );
    socket.on(SocketEvent.AppConsoleLog, (msg: string, stack: string) =>
      this.socketRegistry.emit(
        { id, type: SocketType.Debugger },
        SocketEvent.AppConsoleLog,
        msg,
        stack,
      ),
    );
  }
}
