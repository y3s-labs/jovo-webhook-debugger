<template>
  <div class="inline-flex max-w-3/4" :class="conversationPart.type === 'request' ? '' : 'ml-auto'">
    <div v-if="conversationPart.type === 'request'" class="flex items-center">
      <svg
        class="h-auto w-11 mr-1.5"
        :class="isSelected ? 'text-primary' : 'text-primary opacity-70'"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fill-rule="evenodd"
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z"
          clip-rule="evenodd"
        />
      </svg>
      <message-display
        class="text-white"
        :class="isSelected ? 'bg-primary' : 'bg-primary opacity-70'"
        :message="conversationPart.text"
        @click.native="onSelect"
      />
    </div>
    <div v-else class="flex flex-col space-y-2">
      <template v-if="Array.isArray(conversationPart.output)">
        <output-template-display
          v-for="(output, index) in conversationPart.output"
          :key="index"
          class="items-end w-full"
          :class="isSelected ? '' : 'output-template-display__not-selected'"
          :output="output"
          @click.native="onSelect"
          @image-loaded="$emit('image-loaded')"
          @quick-reply-click="onQuickReplyClick"
        />
      </template>
      <output-template-display
        v-else
        :output="conversationPart.output"
        @click.native="onSelect"
        @image-loaded="$emit('image-loaded')"
        @quick-reply-click="onQuickReplyClick"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { ConversationPart } from '@/types';
import type { QuickReplyValue } from '@jovotech/framework';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { MessageDisplay, OutputTemplateDisplay } from '@jovotech/output-components-vue';

@Component({
  name: 'app-conversation-part',
  components: {
    OutputTemplateDisplay,
    MessageDisplay,
  },
})
export default class AppConversationPart extends Vue {
  @Prop({ required: true, type: Object })
  conversationPart!: ConversationPart;

  get isSelected(): boolean {
    return this.conversationPart.requestId === this.$store.getters.selectedJovoRequestId;
  }

  onSelect() {
    this.$store.commit('setSelectedJovoRequestId', this.conversationPart.requestId);
  }

  onQuickReplyClick(quickReply: QuickReplyValue) {
    if (typeof quickReply === 'object' && quickReply?.intent) {
      return this.$client.send({
        type: 'INTENT',
        text: quickReply.text,
        intent: quickReply.intent,
        entities: quickReply.entities,
      });
    }
    return this.$client.send({
      type: 'TEXT',
      text: typeof quickReply === 'string' ? quickReply : quickReply.text,
    });
  }
}
</script>

<style>
.output-template-display__not-selected {
  .message-display,
  .card-display {
    @apply bg-gray-50;
  }
}
</style>
