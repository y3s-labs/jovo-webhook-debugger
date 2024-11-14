<template>
  <button v-if="isChrome" class="mr-4 focus:outline-none" @mousedown="onMouseDown">
    <svg
      class="w-6 h-6"
      :class="isActive ? 'text-red-600' : 'text-gray-600'"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="1"
        d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
      />
    </svg>
  </button>
</template>

<script lang="ts">
import { BrowserDetector } from '@jovotech/client-web-vue2';
import { Component, Vue } from 'vue-property-decorator';

@Component({
  name: 'record-audio-button',
})
export default class RecordAudioButton extends Vue {
  isActive = false;

  get isChrome(): boolean {
    return BrowserDetector.isChrome();
  }

  async onMouseDown(event: MouseEvent): Promise<void> {
    this.isActive = true;
    if (!this.$client.isInitialized) {
      await this.$client.initialize();
    }
    document.body.addEventListener('mouseup', this.onMouseUp);
    this.$client.startRecording();
  }

  onMouseUp(event: MouseEvent): void {
    this.$client.stopRecording();
    this.isActive = false;
    document.body.removeEventListener('mouseup', this.onMouseUp);
  }
}
</script>
