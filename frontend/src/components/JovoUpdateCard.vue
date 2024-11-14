<template>
  <jv-card class="border">
    <template #body>
      <div class="flex flex-col">
        <div
          class="pl-3 pr-7 py-2.5 flex items-center relative cursor-pointer"
          @click="$emit('toggle-expanded')"
        >
          <div
            class="w-6 h-6 flex-shrink-0 p-1.5 bg-primary-600 text-white rounded-full"
            v-html="icon"
          ></div>
          <span class="ml-3 text-sm"> {{ rootKey }} </span>
          <div class="absolute top-0 right-3 bottom-0 flex items-center justify-center">
            <svg
              class="transition-transform transform duration-300 w-4 h-4 text-gray-400"
              :class="expanded ? 'rotate-180' : 'rotate-0'"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>
        <transition
          enter-active-class="transition-all overflow-hidden duration-300 ease-in"
          enter-class="max-h-0"
          enter-to-class="max-h-screen"
          leave-active-class="transition-all overflow-hidden duration-300 ease-out"
          leave-class="max-h-screen"
          leave-to-class="max-h-0"
        >
          <div v-if="expanded">
            <div class="px-3 py-2.5 space-y-4">
              <div class="flex items-center space-x-4" v-if="update.to">
                <p>to</p>

                <div class="bg-gray-100 p-2 rounded-md">
                  <p class="text-blue-500">{{ update.to.path }}</p>
                  <p class="text-xs text-gray-500">{{ update.to.handler }}</p>
                </div>
              </div>
              <jovo-update-display v-else :update="update" />
            </div>
          </div>
        </transition>
      </div>
    </template>
  </jv-card>
</template>

<script lang="ts">
import JovoUpdateDisplay from '@/components/JovoUpdateDisplay.vue';
import { WATCHED_JOVO_PROPERTY_ICON_MAP } from '@/constants';
import { JovoStateMutation, JovoUpdate } from '@/types';
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component({
  name: 'jovo-update-card',
  components: { JovoUpdateDisplay },
})
export default class JovoUpdateCard extends Vue {
  @Prop({ required: true, type: Object })
  readonly update!: JovoUpdate | JovoStateMutation;

  @Prop({ required: true, type: Boolean })
  readonly expanded!: boolean;

  get rootKey(): string {
    if ('to' in this.update) {
      return this.update.key;
    }
    const path = this.update.path;
    const firstDotIndex = path.indexOf('.');
    return firstDotIndex >= 0 ? path.substring(0, firstDotIndex) : path;
  }

  get icon(): string {
    return WATCHED_JOVO_PROPERTY_ICON_MAP[this.rootKey] || '';
  }
}
</script>
