<template>
  <jv-card body-class="divide-y space-y-4">
    <div class="flex items-center">
      <jv-input
        v-model="inputText"
        class="border-0 shadow-none focus:ring-0"
        placeholder="Type a message..."
        @keydown.enter.prevent="sendText"
      />
      <record-audio-button />
    </div>
    <div class="flex items-center pt-4 space-x-4 justify-between h-17">
      <div
        ref="scrollContainer"
        class="overflow-x-auto scrollbar-invisible hover:scrollbar"
        @wheel="scrollHorizontally"
      >
        <!-- whitespace-nowrap allows padding in horizontal overflowing flex container -->
        <div class="py-1.5 px-2 inline-flex whitespace-nowrap space-x-2">
          <manual-input-card-button
            v-for="(button, index) in buttons"
            :key="index"
            :button="button"
          />
        </div>
      </div>
      <language-select class="flex-shrink-0 ml-auto" />
      <!--      <jv-button class="ml-auto rounded-full flex-shrink-0">Configuration</jv-button>-->
    </div>
  </jv-card>
</template>

<script lang="ts">
import LanguageSelect from '@/components/LanguageSelect.vue';
import ManualInputCardButton from '@/components/ManualInputCardButton.vue';
import RecordAudioButton from '@/components/RecordAudioButton.vue';
import { DebuggerButton } from '@/types';
import { Component, Vue } from 'vue-property-decorator';
import { AudioHelper, ClientEvent, SpeechRecognizerEvent}  from '@jovotech/client-web-vue2';

@Component({
  name: 'manual-input-card',
  components: { LanguageSelect, ManualInputCardButton, RecordAudioButton },
})
export default class ManualInputCard extends Vue {
  inputText = '';

  created(): void {
    this.$client.speechRecognizer.on(
      SpeechRecognizerEvent.SpeechRecognized,
      this.onSpeechRecognized,
    );
    this.$client.on(ClientEvent.Request, this.onRequest);
  }

  beforeDestroy(): void {
    this.$client.speechRecognizer.off(
      SpeechRecognizerEvent.SpeechRecognized,
      this.onSpeechRecognized,
    );
    this.$client.off(ClientEvent.Request, this.onRequest);
  }

  get buttons(): DebuggerButton[] {
    const buttons: DebuggerButton[] = (
      this.$store.getters.debuggerConfig.buttons ||
      this.intents.map(this.convertIntentToDebuggerButton)
    ).slice();

    const hasLaunchButton = buttons.some(
      (button) =>
        'input' in button && !Array.isArray(button.input) && button.input?.type === 'LAUNCH',
    );
    if (!hasLaunchButton) {
      buttons.unshift({
        label: 'LAUNCH',
        input: {
          type: 'LAUNCH',
        },
      });
    }
    return buttons;
  }

  get intents(): string[] {
    // backwards compatible
    if (Array.isArray(this.$store.getters.selectedLanguageModel?.intents)) {
      return (
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this.$store.getters.selectedLanguageModel?.intents?.map((intent: any) => intent.name) || []
      );
    }
    return Object.keys(this.$store.getters.selectedLanguageModel?.intents || {});
  }

  scrollHorizontally(event: WheelEvent) {
    (this.$refs.scrollContainer as HTMLDivElement).scrollBy({
      left: event.deltaY,
    });
  }

  private convertIntentToDebuggerButton(intent: string): DebuggerButton {
    return {
      label: intent,
      input: {
        type: 'INTENT',
        intent,
      },
    };
  }

  async sendText(): Promise<void> {
    if (!this.inputText) return;
    await this.$client.send({
      type: 'TEXT',
      text: this.inputText,
    });
    this.inputText = '';
  }

  private onRequest(): void {
    this.inputText = '';
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private onSpeechRecognized(event?: any): void {
    if (event) {
      this.inputText = AudioHelper.textFromSpeechRecognition(event);
    }
  }
}
</script>
