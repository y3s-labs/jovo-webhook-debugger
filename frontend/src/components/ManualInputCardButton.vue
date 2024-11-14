<template>
  <button
    class="
      inline-flex
      items-center
      border
      shadow-sm
      focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500
      disabled:cursor-not-allowed
      ml-auto
      rounded-full
      border-transparent
      text-gray-700
      bg-gray-200
      hover:bg-gray-300
      disabled:bg-gray-100
      px-4
      py-2
      text-sm
      rounded-md
    "
    @click="send"
  >
    {{ button.label }}
  </button>
</template>

<script lang="ts">
import { DebuggerButton, SequenceDebuggerButton } from '@/types';
import { Input } from '@jovotech/client-web-vue2';
import { Socket } from 'socket.io-client';
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component({
  name: 'manual-input-card-button',
})
export default class ManualInputCardButton extends Vue {
  @Prop({ required: true, type: Object })
  button!: DebuggerButton;

  get socket(): typeof Socket | null {
    return this.$store.getters.socket;
  }

  async send() {
    if ('input' in this.button) {
      if (Array.isArray(this.button.input)) {
        return this.sendSequence(this.button.input.map((input) => ({ input })));
      }
      return this.sendInput(this.button.input);
    }
    if ('request' in this.button) {
      if (Array.isArray(this.button.request)) {
        return this.sendSequence(this.button.request.map((request) => ({ request })));
      }
      return this.sendRequest(this.button.request);
    }
    return this.sendSequence(this.button.sequence);
  }

  async sendSequence(sequence: SequenceDebuggerButton['sequence']) {
    if (!this.socket) {
      return;
    }

    for (const sequenceItem of sequence) {
      const requestObj = sequenceItem.input
        ? this.$client.createRequest(sequenceItem.input)
        : sequenceItem.request;
      if (!requestObj) {
        continue;
      }
      await this.sendRequest(requestObj);
      await this.delay(300 + Math.random() * 100);
    }
  }

  async sendRequest(request: any) {
    await this.$client.send(request);
  }

  async sendInput(input: Input) {
    if (!input.type) {
      input.type = 'INTENT';
    }
    await this.$client.send(input);
  }

  private delay(amountInMs: number): Promise<void> {
    return new Promise((resolve, reject) => {
      setTimeout(resolve, amountInMs);
    });
  }
}
</script>
