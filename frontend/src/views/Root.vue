<template>
  <div class="flex">
    <div class="w-8/12 bg-gray-100 flex flex-col group">
      <div class="flex-1 flex flex-col h-0 relative">
        <jv-button
          v-if="conversationParts.length > 0"
          size="xs"
          class="
            text-sm
            absolute
            mt-5
            inline-block
            opacity-0
            group-hover:opacity-100
            left-1/2
            transition-opacity
            transform
            -translate-x-1/2
          "
          @click="resetConversation"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="-ml-0.5 mr-1 h-4 w-4"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clip-rule="evenodd"
            />
          </svg>
          Reset session
        </jv-button>
        <div
          ref="conversationScrollContainer"
          class="flex-1 overflow-y-auto scrollbar-invisible hover:scrollbar px-32 pt-32 pb-10"
        >
          <app-conversation class="mx-auto max-w-xl" @image-loaded="scrollToBottomOfConversation" />
          <!--          <jv-conversation-->
          <!--            class="mx-auto max-w-xl"-->
          <!--            :parts="conversationParts"-->
          <!--            :platform="platform"-->
          <!--          />-->
        </div>
        <div class="px-32 py-5">
          <manual-input-card class="mx-auto max-w-xl" />
        </div>
      </div>
    </div>
    <div
      class="
        w-4/12
        flex flex-col
        overflow-y-auto
        scrollbar-invisible
        hover:scrollbar
        space-y-2
        px-6
        py-5
      "
    >
      <div class="py-5 border-b px-4 mb-7 flex items-center justify-between space-x-3">
        <h3 class="text-lg font-medium text-gray-900">Lifecycle</h3>
        <div class="flex items-center space-x-3">
          <jv-button
            v-if="false && conversationParts.length > 0"
            size="xs"
            class="text-sm"
            @click="resetConversation"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="-ml-0.5 mr-1 h-4 w-4"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clip-rule="evenodd"
              />
            </svg>
            Reset session
          </jv-button>
          <jv-button
            size="xs"
            v-if="selectedJovoUpdates.length"
            :class="selectedJovoUpdates.length ? 'visible' : 'invisible'"
            @click="toggleExpandedDetails"
          >
            <svg
              class="w-4 h-4 transform transition-transform duration-300"
              :class="mostDetailsExpanded ? 'rotate-180' : 'rotate-0'"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 13l-7 7-7-7m14-8l-7 7-7-7"
              />
            </svg>
          </jv-button>
        </div>
      </div>
      <app-lifecycle-display />
    </div>
  </div>
</template>

<script lang="ts">
import AppLifecycleDisplay from '@/components/AppLifecycleDisplay.vue';
import AppConversation from '@/components/conversation/AppConversation.vue';
import JovoUpdateCard from '@/components/JovoUpdateCard.vue';
import LanguageSelect from '@/components/LanguageSelect.vue';
import ManualInputCard from '@/components/ManualInputCard.vue';
import VerticalSeparator from '@/components/VerticalSeparator.vue';
import { JovoStateMutation, JovoUpdate } from '@/types';
import { ConversationPart } from '@jovotech/ui-components';
import { Component, Vue, Watch } from 'vue-property-decorator';

@Component({
  components: {
    LanguageSelect,
    AppLifecycleDisplay,
    AppConversation,
    VerticalSeparator,
    JovoUpdateCard,
    ManualInputCard,
  },
})
export default class Root extends Vue {
  get mostDetailsExpanded(): boolean {
    const allDetailsDifference =
      this.selectedJovoUpdates.length - this.expandedJovoUpdateIndices.length;
    const noDetailsDifference = this.expandedJovoUpdateIndices.length;
    return noDetailsDifference > allDetailsDifference;
  }

  mounted() {
    console.log('mounted root');
  }

  toggleExpandedDetails() {
    if (this.mostDetailsExpanded) {
      this.$store.commit('setExpandedJovoUpdateIndices', []);
    } else {
      this.$store.commit(
        'setExpandedJovoUpdateIndices',
        this.selectedJovoUpdates.map((update, index: number) => index),
      );
    }
  }

  resetConversation() {
    this.$client.store.resetSession();
    this.$client.store.save();
    this.$store.commit('resetConversation');
  }

  get selectedJovoUpdates(): Array<JovoUpdate | JovoStateMutation> {
    return this.$store.getters.selectedJovoUpdates;
  }

  get expandedJovoUpdateIndices(): number[] {
    return this.$store.getters.expandedJovoUpdateIndices;
  }

  get conversationParts(): ConversationPart[] {
    return this.$store.getters.conversationParts;
  }

  @Watch('conversationParts')
  async onConversationPartsChange() {
    await this.$nextTick();
    this.scrollToBottomOfConversation();
  }

  scrollToBottomOfConversation() {
    const conversationScrollContainer = this.$refs.conversationScrollContainer as
      | HTMLDivElement
      | undefined;
    if (!conversationScrollContainer) return;
    conversationScrollContainer.scrollTop = conversationScrollContainer.scrollHeight;
  }
}
</script>
