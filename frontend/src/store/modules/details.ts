import { RootState } from '@/store';
import { Module } from 'vuex';

export interface DetailsModuleState {
  expanded: string[];
}

export const details: Module<DetailsModuleState, RootState> = {
  state: () => ({
    expanded: [],
  }),
  getters: {
    expandedDetails(state): string[] {
      return state.expanded;
    },
  },
  mutations: {
    setExpandedDetails(state, expandedDetails: string[]) {
      state.expanded = expandedDetails;
    },
    setDetailExpanded(state, { identifier, expanded }: { identifier: string; expanded: boolean }) {
      const index = state.expanded.indexOf(identifier);
      if (index >= 0 && !expanded) {
        state.expanded.splice(index, 1);
      } else if (expanded && index < 0) {
        state.expanded.push(identifier);
      }
    },
  },
};
