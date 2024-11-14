<template>
  <div class="flex flex-col space-y-8">
    <app-conversation-part
      v-for="(part, index) in conversationParts"
      :key="index"
      :conversation-part="part"
      @image-loaded="$emit('image-loaded')"
    />
  </div>
</template>

<script lang="ts">
import AppConversationPart from '@/components/conversation/AppConversationPart.vue';
import { ConversationPart } from '@/types';
import { Component, Vue } from 'vue-property-decorator';

@Component({
  name: 'app-conversation',
  components: { AppConversationPart },
})
export default class AppConversation extends Vue {
  get conversationParts(): ConversationPart[] {
    return this.$store.getters.conversationParts;
  }
}
</script>
