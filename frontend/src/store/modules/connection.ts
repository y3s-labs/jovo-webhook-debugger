import { WEBHOOK_URL } from '@/constants';
import { RootState } from '@/store';
import {
  DebuggerConfig,
  JovoDebuggerEvent,
  JovoDebuggerPayload,
  JovoStateMutationPayload,
  JovoUpdatePayload,
} from '@/types';
import { connect, Socket } from 'socket.io-client';
import { Module } from 'vuex';

export interface ConnectionModuleState {
  socket: null | typeof Socket;
  isConnectedToWebhook: boolean;
  isDebuggingAvailable: boolean;
}

export const connection: Module<ConnectionModuleState, RootState> = {
  state: () => ({
    socket: null,
    isConnectedToWebhook: false,
    isDebuggingAvailable: false,
  }),
  getters: {
    isConnectedToWebhook(state): boolean {
      return state.isConnectedToWebhook;
    },
    isDebuggingAvailable(state): boolean {
      return state.isDebuggingAvailable;
    },
    socket(state): typeof Socket | null {
      return state.socket;
    },
  },
  mutations: {
    setSocket(state, socket: typeof Socket | null) {
      state.socket = socket;
    },
    setConnectedToWebhook(state, isConnected: boolean) {
      state.isConnectedToWebhook = isConnected;
    },
    setDebuggingAvailable(state, isDebuggingAvailable: boolean) {
      state.isDebuggingAvailable = isDebuggingAvailable;
    },
  },
  actions: {
    connectSocket(ctx, id: string) {
      const onDisconnect = () => {
        if (ctx.state.isConnectedToWebhook) {
          ctx.commit('setConnectedToWebhook', false);
        }
        if (ctx.state.isDebuggingAvailable) {
          ctx.commit('setDebuggingAvailable', false);
        }
      };

      const socket = connect(WEBHOOK_URL, {
        query: {
          id,
          type: 'debugger',
          subId: Math.random().toString(36).substring(7),
        },
      });

      socket.on('connect', () => {
        ctx.commit('setConnectedToWebhook', true);
      });
      socket.on('connect_error', (error: Error) => {
        console.log(error);
        // TODO: handle error
        onDisconnect();
      });
      socket.on('disconnect', onDisconnect);
      socket.on(JovoDebuggerEvent.DebuggingAvailable, () => {
        ctx.commit('setDebuggingAvailable', true);
      });
      socket.on(JovoDebuggerEvent.DebuggingUnavailable, () => {
        ctx.commit('setDebuggingAvailable', false);
      });
      socket.on(JovoDebuggerEvent.AppRequest, async (payload: JovoDebuggerPayload) => {
        await ctx.dispatch('onRequest', payload);
      });
      socket.on(JovoDebuggerEvent.AppResponse, async (payload: JovoDebuggerPayload) => {
        await ctx.dispatch('onResponse', payload);
      });
      socket.on(JovoDebuggerEvent.AppJovoUpdate, async (payload: JovoUpdatePayload) => {
        await ctx.dispatch('onJovoUpdate', payload);
      });
      socket.on(JovoDebuggerEvent.AppStateMutation, async (payload: JovoStateMutationPayload) => {
        await ctx.dispatch('onStateMutation', payload);
      });
      socket.on(
        JovoDebuggerEvent.AppLanguageModelResponse,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (languageModel: Record<string, any>) => {
          ctx.commit('setLanguageModel', languageModel);
        },
      );
      socket.on(
        JovoDebuggerEvent.AppDebuggerConfigResponse,
        async (debuggerConfig: DebuggerConfig) => {
          ctx.commit('setDebuggerConfig', debuggerConfig);
        },
      );

      ctx.commit('setSocket', socket);
    },
  },
};
