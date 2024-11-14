<template>
  <div>
    <div
      v-for="(update, index) in nonEmptyMergedJovoUpdates"
      :key="`${selectedJovoRequestId}-${index}`"
    >
      <jovo-update-card
        :update="update"
        :expanded="expandedJovoUpdateIndices.includes(index)"
        @toggle-expanded="$store.commit('toggleExpandedJovoUpdate', index)"
      />
      <vertical-separator v-if="index !== nonEmptyMergedJovoUpdates.length - 1" />
    </div>
  </div>
</template>

<script lang="ts">
import JovoUpdateCard from '@/components/JovoUpdateCard.vue';
import VerticalSeparator from '@/components/VerticalSeparator.vue';
import { JovoDebuggerPayload, JovoStateMutation, JovoUpdate } from '@/types';
import cloneDeep from 'clone-deep';
import _set from 'lodash.set';
import { Component, Vue } from 'vue-property-decorator';

@Component({
  name: 'app-lifecycle-display',
  components: { VerticalSeparator, JovoUpdateCard },
})
export default class AppLifecycleDisplay extends Vue {
  get selectedJovoUpdates(): Array<JovoUpdate | JovoStateMutation> {
    return this.$store.getters.selectedJovoUpdates;
  }

  get selectedJovoRequestId(): JovoDebuggerPayload['requestId'] {
    return this.$store.getters.selectedJovoRequestId;
  }

  get expandedJovoUpdateIndices(): number[] {
    return this.$store.getters.expandedJovoUpdateIndices;
  }

  get mergedJovoUpdates(): Array<JovoUpdate | JovoStateMutation> {
    const mergedUpdates: Array<JovoUpdate | JovoStateMutation> = [];
    let lastBreakpointUpdate: JovoUpdate | undefined;
    this.selectedJovoUpdates.forEach((update, index) => {
      // it's a state mutation if 'to' exists in the update
      if ('to' in update) {
        mergedUpdates.push(update);
      } else {
        if (this.isIgnoredUpdate(update)) {
          return;
        }
        if (
          lastBreakpointUpdate &&
          update.path.startsWith(lastBreakpointUpdate.path) &&
          !this.isEmpty(update.value)
        ) {
          const lastPathIndex = update.path.indexOf(lastBreakpointUpdate.path);
          const path = update.path.substring(lastPathIndex + lastBreakpointUpdate.path.length + 1);
          _set(lastBreakpointUpdate.value, path, update.value);
        } else {
          const clonedUpdate = cloneDeep(update);
          mergedUpdates.push(clonedUpdate);
          lastBreakpointUpdate = clonedUpdate;
        }
      }
    });
    return mergedUpdates;
  }

  get nonEmptyMergedJovoUpdates(): Array<JovoUpdate | JovoStateMutation> {
    return this.mergedJovoUpdates.filter((update) =>
      // if it's a state mutation just pass it
      'to' in update
        ? true
        : // if there is a previousValue
        'previousValue' in update
        ? // make sure it is not empty (delete and update)
          !this.isEmpty(update.previousValue)
        : // otherwise make sure the update value is not empty (update)
          !this.isEmpty(update.value),
    );
  }

  private isIgnoredUpdate(update: JovoUpdate): boolean {
    return update.path.includes('_BASIC_LOGGING_START') || update.path.startsWith('_JOVO');
  }

  private isEmpty(value: any): boolean {
    if (Array.isArray(value) || typeof value === 'string') {
      return !value.length;
    }
    if (value && typeof value === 'object') {
      const keys = Object.keys(value);
      if (!keys.length) {
        return true;
      }
      return keys.every((key) => this.isEmpty(value[key]));
    }
    return value === undefined || value === null;
  }
}
</script>
