import type { Input, OmitWhere } from '@jovotech/framework';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type PlainObjectType<T> = OmitWhere<T, () => any>;

export interface DebuggerButtonBase {
  label: string;
}

export interface InputDebuggerButton extends DebuggerButtonBase {
  input: Input | Input[];
}

export interface RequestDebuggerButton extends DebuggerButtonBase {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  request: any | any[];
}

export interface SequenceDebuggerButton extends DebuggerButtonBase {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sequence: Array<Input | any>;
}

export type DebuggerButton = InputDebuggerButton | RequestDebuggerButton | SequenceDebuggerButton;
