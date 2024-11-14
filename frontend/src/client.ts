import { JovoDebuggerEvent, JovoDebuggerPayload } from '@/types';
import {
  Client,
  ClientRequest,
  ClientResponse,
  NetworkTransportStrategy,
} from '@jovotech/client-web-vue2';
import { WEBHOOK_URL } from '@/constants';
import store from './store';

export class SocketNetworkTransportStrategy extends NetworkTransportStrategy {
  send(endpointUrl: string, request: ClientRequest): Promise<ClientResponse> {
    return new Promise((resolve, reject) => {
      if (!store.getters.socket) {
        return reject(new Error('Socket is not connected.'));
      }
      store.commit('setSelectedJovoRequestId', -1);
      const timeoutId = setTimeout(() => {
        return reject(new Error('Request timed out.'));
      }, 5000);
      store.getters.socket?.emit(JovoDebuggerEvent.DebuggerRequest, request);
      store.getters.socket?.once(
        JovoDebuggerEvent.AppResponse,
        (payload: JovoDebuggerPayload<ClientResponse>) => {
          clearTimeout(timeoutId);
          return resolve(payload.data);
        },
      );
    });
  }
}

const client = new Client(WEBHOOK_URL, {
  networkTransportStrategy: new SocketNetworkTransportStrategy(),
  platform: 'jovo-debugger',
  input: {
    audioRecorder: {
      startDetection: {
        enabled: false,
      },
      silenceDetection: {
        enabled: false,
      },
    },
    speechRecognizer: {
      startDetection: {
        enabled: false,
      },
      silenceDetection: {
        enabled: false,
      },
    },
  },
  output: {
    audioPlayer: {
      enabled: false,
    },
    speechSynthesizer: {
      enabled: false,
    },
    reprompts: {
      enabled: false,
    },
  },
  store: {
    shouldPersistSession: false,
  },
});

export { client };
