export interface LogEntry {
  id: string;
  type: string;
  debugger?: boolean;
}

export enum SocketType {
  App = 'app',
  Debugger = 'debugger',
  Dashboard = 'dashboard',
}

export type SocketTypeValue = SocketType | `${SocketType}`;

export interface SocketMeta {
  id: string;
  type: SocketTypeValue;
  subId?: string;
}
