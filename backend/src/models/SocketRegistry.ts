import _get from 'lodash.get';
import _setWith from 'lodash.setwith';
import { Socket } from 'socket.io';
import { LegacySocketEvent, SocketEvent } from '../events';
import { SocketMeta } from '../types';
import { isSocket } from '../utilities';
import { SocketProxyHandler } from './SocketProxyHandler';

export type SocketMap = Record<string, Socket>;

export interface SocketRegistryEntry {
  [key: string]: Socket | SocketMap | undefined;

  app?: Socket;
  // debugger can have multiple instances connected (multiple tabs/windows)
  debugger?: SocketMap;
  webhook?: Socket;
  // TODO: check if beneath is true
  // dashboard can have multiple instances connected (multiple tabs/windows)
  dashboard?: SocketMap;
}

export class SocketRegistry {
  entryMap: Record<string, SocketRegistryEntry> = {};

  add(socket: Socket): Socket {
    const proxy = new Proxy(socket, SocketProxyHandler);
    _setWith(this.entryMap, this.getPath(socket.meta), proxy, (val, key, obj) => {
      if (!val) {
        return {};
      }
      return;
    });
    return proxy;
  }

  has(meta: SocketMeta): boolean {
    return !!_get(this.entryMap, this.getPath(meta));
  }

  get(meta: SocketMeta): Socket | SocketMap | undefined {
    return _get<any, string>(this.entryMap, this.getPath(meta));
  }

  remove(socket: Socket): Socket | undefined {
    if (socket.meta.subId) {
      if (this.entryMap[socket.meta.id][socket.meta.type][socket.meta.subId]) {
        delete this.entryMap[socket.meta.id][socket.meta.type][socket.meta.subId];
      }
    } else {
      if (this.entryMap[socket.meta.id][socket.meta.type]) {
        delete this.entryMap[socket.meta.id][socket.meta.type];
      }
    }
    return socket;
  }

  emit(meta: SocketMeta, event: SocketEvent | LegacySocketEvent | string, ...eventArgs: any[]) {
    const socket = this.get(meta);
    if (!socket) {
      return;
    }
    if (isSocket(socket)) {
      (socket as Socket).emit(event, ...eventArgs);
    } else {
      this.emitToSocketMap(socket as SocketMap, event, ...eventArgs);
    }
  }

  emitToSocketMap(
    map: SocketMap,
    event: SocketEvent | LegacySocketEvent | string,
    ...eventArgs: any[]
  ) {
    Object.values(map).forEach((socket) => {
      socket.emit(event, ...eventArgs);
    });
  }

  private getPath({ id, type, subId }: SocketMeta): string {
    return subId ? `${id}.${type}.${subId}` : `${id}.${type}`;
  }
}
