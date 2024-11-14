import { connection } from '@/store/modules/connection';
import { data } from '@/store/modules/data';
import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface RootState {}

export default new Vuex.Store<RootState>({
  state: () => ({}),
  mutations: {},
  actions: {},
  getters: {},
  modules: {
    connection,
    data,
  },
});
