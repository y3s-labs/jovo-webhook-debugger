import { Logger } from '@nestjs/common';
import { Socket } from 'socket.io';
import { inspect } from 'util';
import { SocketEvent } from '../events';
import { getLegacyEvent } from '../utilities';

const EVENT_LISTENER_METHOD_KEYS: Array<keyof Socket> = [
  'addListener',
  'on',
  'once',
  'removeListener',
  'off',
  'prependListener',
  'prependOnceListener',
];
const WATCHED_METHOD_KEYS = [...EVENT_LISTENER_METHOD_KEYS, 'emit'];

export const SocketProxyHandler: ProxyHandler<Socket> = {
  get(target: Socket, propertyKey: string | symbol): any {
    const originalMethod = target[propertyKey];
    if (!WATCHED_METHOD_KEYS.includes(propertyKey.toString())) {
      return originalMethod;
    }
    return function (eventName: SocketEvent | string, ...eventArgs: any[]) {
      if (propertyKey.toString() === 'emit') {
        Logger.verbose(
          `${eventName} - Args:\n${inspect(eventArgs, { compact: false })}`,
          `emit to ${target.meta.type}`,
          false,
        );
      }
      originalMethod.apply(this, [eventName, ...eventArgs]);
      const legacyEvent = getLegacyEvent(eventName);
      if (legacyEvent) {
        const formattedLegacyEvent = legacyEvent.replace(/{{id}}/g, target.meta.id);
        if (propertyKey.toString() === 'emit') {
          Logger.verbose(
            `${formattedLegacyEvent}- Args:\n${inspect(eventArgs, { compact: false })}`,
            `emit to ${target.meta.type}`,
            false,
          );
        }
        originalMethod.apply(this, [formattedLegacyEvent, ...eventArgs]);
      }
    };
  },
};
