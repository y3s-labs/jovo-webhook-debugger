import { LegacySocketEvent, SocketEvent } from './events';

export function isSocket(obj: any): boolean {
  return obj?.constructor?.name === 'Socket' && obj.server;
}

export function getLegacyEvent(event: SocketEvent | string): LegacySocketEvent | undefined {
  const enumKey = Object.entries(SocketEvent).find(([, value]) => value === event)?.[0];
  return LegacySocketEvent?.[enumKey];
}
