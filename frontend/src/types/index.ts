import type { OutputTemplate } from '@jovotech/output';
import type { JovoModelData } from 'jovo-model';

export enum JovoDebuggerEvent {
  DebuggingAvailable = 'debugging.available',
  DebuggingUnavailable = 'debugging.unavailable',

  DebuggerRequest = 'debugger.request',
  DebuggerLanguageModelRequest = 'debugger.language-model-request',

  AppLanguageModelResponse = 'app.language-model-response',
  AppDebuggerConfigResponse = 'app.debugger-config-response',
  AppConsoleLog = 'app.console-log',
  AppRequest = 'app.request',
  AppResponse = 'app.response',

  AppJovoUpdate = 'app.jovo-update',
  AppStateMutation = 'app.state-mutation',
}

export type DeepPartial<T> = { [P in keyof T]?: DeepPartial<T[P]> };

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export interface JovoDebuggerPayload<DATA extends any = any> {
  requestId: number | string;
  data: DATA;
}

export interface JovoUpdate {
  key: string;
  path: string;
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  value: any;
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  previousValue?: any;
}

export type JovoUpdatePayload = JovoDebuggerPayload<JovoUpdate>;

export interface JovoStateMutation {
  key: '$redirect' | '$delegate' | '$resolve';
  to: {
    path?: string;
    handler?: string;
  };
}

export type JovoStateMutationPayload = JovoDebuggerPayload<JovoStateMutation>;

export enum ConversationPartType {
  Request = 'request',
  Response = 'response',
}

export type ConversationPartTypeLike = ConversationPartType | `${ConversationPartType}`;

export interface ConversationPart<
  TYPE extends ConversationPartTypeLike = ConversationPartTypeLike,
> {
  type: TYPE;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload: Record<string, any>;
  requestId?: number | string;
  text?: TYPE extends ConversationPartType.Response ? never : string | string[];
  output?: TYPE extends ConversationPartType.Request ? never : OutputTemplate | OutputTemplate[];
}

export type LanguageModel = Record<string, JovoModelData>;

export * from './DebuggerButton';
export * from './DebuggerConfig';
