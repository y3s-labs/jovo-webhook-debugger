import { client } from '@/client';
import { DEBUGGER_PLATFORM, DEBUGGER_PLATFORM_TYPE, PLATFORMS } from '@/constants';
import { RootState } from '@/store';
import {
  ConversationPart,
  ConversationPartType,
  DebuggerConfig,
  JovoDebuggerPayload,
  JovoStateMutation,
  JovoStateMutationPayload,
  JovoUpdate,
  JovoUpdatePayload,
  LanguageModel,
} from '@/types';
import { OutputTemplateConverter } from '@jovotech/output';
import type { CoreResponse } from '@jovotech/platform-core';
import { CorePlatform } from '@jovotech/platform-core';
import type { JovoModelData } from 'jovo-model';
import Vue from 'vue';
import { Module } from 'vuex';

export type JovoUpdateMap = Record<
  JovoDebuggerPayload['requestId'],
  Array<JovoUpdate | JovoStateMutation>
>;

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface DataModuleState {
  expandedJovoUpdateIndices: number[];
  selectedJovoRequestId: JovoDebuggerPayload['requestId'];
  jovoUpdateMap: JovoUpdateMap;
  conversationParts: ConversationPart[];
  languageModel: LanguageModel;
  debuggerConfig: DebuggerConfig;
  selectedLocale: string;
}

export const data: Module<DataModuleState, RootState> = {
  state: () => ({
    expandedJovoUpdateIndices: [],
    selectedJovoRequestId: -1,
    jovoUpdateMap: {},
    conversationParts: [],
    languageModel: {},
    debuggerConfig: { locales: ['en'], buttons: [] },
    selectedLocale: 'en',
  }),
  getters: {
    jovoUpdateMap(state): JovoUpdateMap {
      return state.jovoUpdateMap;
    },
    conversationParts(state): ConversationPart[] {
      return state.conversationParts;
    },
    selectedJovoRequestId(state): JovoDebuggerPayload['requestId'] {
      return state.selectedJovoRequestId;
    },
    selectedJovoUpdates(state): Array<JovoUpdate | JovoStateMutation> {
      return state.jovoUpdateMap[state.selectedJovoRequestId] || [];
    },
    selectedLocale(state): string {
      return state.selectedLocale;
    },
    languageModel(state): LanguageModel {
      return state.languageModel;
    },
    debuggerConfig(state): DebuggerConfig {
      return state.debuggerConfig;
    },
    selectedLanguageModel(state): JovoModelData {
      return state.languageModel[state.selectedLocale];
    },
    expandedJovoUpdateIndices(state): number[] {
      return state.expandedJovoUpdateIndices;
    },
  },
  mutations: {
    addJovoUpdate(state, payload: JovoUpdatePayload | JovoStateMutationPayload) {
      if (!state.jovoUpdateMap[payload.requestId]) {
        Vue.set(state.jovoUpdateMap, payload.requestId, []);
      }
      state.jovoUpdateMap[payload.requestId].push(payload.data);
    },
    addConversationPart(state, conversationPart: ConversationPart) {
      state.conversationParts.push(conversationPart);
    },
    setSelectedJovoRequestId(state, requestId: JovoDebuggerPayload['requestId']) {
      state.selectedJovoRequestId = requestId;
    },
    setLanguageModel(state, languageModel: LanguageModel) {
      state.languageModel = languageModel;
    },
    setDebuggerConfig(state, config: DebuggerConfig) {
      state.debuggerConfig = config;
    },
    setSelectedLocale(state, locale: string) {
      state.selectedLocale = locale;
    },
    setExpandedJovoUpdateIndices(state, indices: number[]) {
      state.expandedJovoUpdateIndices = indices;
    },
    toggleExpandedJovoUpdate(state, index: number) {
      const jovoUpdateIndex = state.expandedJovoUpdateIndices.indexOf(index);
      if (jovoUpdateIndex >= 0) {
        state.expandedJovoUpdateIndices.splice(jovoUpdateIndex, 1);
      } else {
        state.expandedJovoUpdateIndices.push(index);
      }
    },
    resetConversation(state) {
      state.expandedJovoUpdateIndices = [];
      state.selectedJovoRequestId = -1;
      state.jovoUpdateMap = {};
      state.conversationParts = [];
    },
  },
  actions: {
    onRequest(ctx, request: JovoDebuggerPayload) {
      console.debug('request', request);
      ctx.commit('setSelectedJovoRequestId', request.requestId);
      const conversationPart: ConversationPart<ConversationPartType.Request> = {
        type: ConversationPartType.Request,
        payload: request.data,
        requestId: request.requestId,
      };
      const relatedPlatform = PLATFORMS.find((platform) =>
        Array.isArray(request.data)
          ? request.data.every((req) => platform.isRequestRelated(req))
          : platform.isRequestRelated(request.data),
      );
      if (!relatedPlatform) {
        // TODO determine what to do, do we wanna handle a request of a platform that is not supported?
        console.warn('Could not find any platform related to request:', request.data);
        return;
      }
      const platformRequest = relatedPlatform.createRequestInstance(request.data);

      const requestIntent = platformRequest.getIntent();
      const requestIntentName =
        typeof requestIntent === 'string' ? requestIntent : requestIntent?.name;
      conversationPart.text =
        platformRequest.getInputText() ||
        requestIntentName ||
        (platformRequest.getInputType() as string | undefined) ||
        '<Unknown>';

      ctx.commit('addConversationPart', conversationPart);
    },
    async onResponse(ctx, response: JovoDebuggerPayload) {
      console.debug('response', response);
      const conversationPart: ConversationPart<ConversationPartType.Response> = {
        type: ConversationPartType.Response,
        payload: response.data,
        requestId: response.requestId,
      };
      let relatedPlatform = PLATFORMS.find((platform) =>
        Array.isArray(response.data)
          ? response.data.every((res) => platform.isResponseRelated(res))
          : platform.isResponseRelated(response.data),
      );
      // TODO: remove as soon as changes have been merged
      if (response.data.type === 'jovo-debugger') {
        relatedPlatform = DEBUGGER_PLATFORM;
      }

      if (!relatedPlatform) {
        // TODO determine what to do, do we wanna handle a request of a platform that is not supported?
        console.warn('Could not find any platform related to response:', response.data);
        return;
      }

      if (
        relatedPlatform instanceof CorePlatform &&
        (relatedPlatform.config.type === DEBUGGER_PLATFORM_TYPE ||
          relatedPlatform.config.platform === DEBUGGER_PLATFORM_TYPE)
      ) {
        const debuggerResponse = response.data as CoreResponse;

        if (debuggerResponse.context.session.end) {
          client.store.resetSession();
        } else {
          client.store.sessionData.new = false;
          client.store.sessionData.data = debuggerResponse.context.session.data;
        }
        if (debuggerResponse.context.user?.data) {
          client.store.userData.data = debuggerResponse.context.user.data;
        }
        client.store.save();
      }
      const outputTemplateConverter = new OutputTemplateConverter(
        relatedPlatform.outputTemplateConverterStrategy,
      );
      conversationPart.output = await outputTemplateConverter.fromResponse(response.data);

      ctx.commit('addConversationPart', conversationPart);
    },
    onJovoUpdate(ctx, payload: JovoUpdatePayload) {
      console.debug('update', payload);
      ctx.commit('addJovoUpdate', payload);
    },
    onStateMutation(ctx, payload: JovoStateMutationPayload) {
      console.debug('state-mutation', payload);
      ctx.commit('addJovoUpdate', payload);
    },
  },
};
