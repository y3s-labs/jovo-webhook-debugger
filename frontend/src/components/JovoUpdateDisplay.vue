<template>
  <div class="">
    <p
      v-if="update.path !== update.key"
      class="text-xs text-gray-700 border border-b-0 bg-gray-100 py-1 px-2 rounded-t-md"
    >
      {{ formattedPath }}
    </p>
    <div
      class="flex overflow-x-auto border rounded-md scrollbar-invisible hover:scrollbar"
      :class="update.path !== update.key ? 'rounded-t-none' : ''"
    >
      <table class="flex-1 font-mono text-code">
        <tbody>
          <tr v-for="(change, index) in codeContents" :key="index">
            <td :class="change.added ? 'bg-green-50' : change.removed ? 'bg-red-50' : ''">
              <div class="inline-block select-none whitespace-nowrap pl-2 pr-20">
                <span
                  class="select-none inline p-0 whitespace-pre"
                  style="word-wrap: normal"
                  v-html="change.added ? '+' : change.removed ? '-' : '&nbsp;'"
                ></span
                >&nbsp;<span
                  class="inline-block p-0 select-text whitespace-pre"
                  style="word-wrap: normal"
                  v-html="change.value"
                ></span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script lang="ts">
import { JovoUpdate } from '@/types';

import { Change, diffJson } from 'diff';
import hljs from 'highlight.js/lib/core';
import json from 'highlight.js/lib/languages/json';
import { Component, Prop, Vue } from 'vue-property-decorator';

hljs.registerLanguage('json', json);

@Component({
  name: 'jovo-update-display',
  components: {},
})
export default class JovoUpdateDisplay extends Vue {
  @Prop({ required: true })
  readonly update!: JovoUpdate;

  get differences(): Change[] {
    const serializedPreviousValue = this.serialize(this.update.previousValue);
    const serializedValue = this.serialize(this.update.value);
    return diffJson(serializedPreviousValue, serializedValue);
  }

  get codeContents(): Change[] {
    return this.getCodeContentsFromDifferences();
  }

  get formattedPath(): string {
    const match = /jovoReference[.](.*)/.exec(this.update.path);
    return match?.[1] ? match[1] : this.update.path;
  }

  serialize(data: unknown): string {
    return typeof data !== 'undefined' ? JSON.stringify(data, undefined, 2) : '';
  }

  private getCodeContentsFromDifferences(): Change[] {
    return this.differences.reduce((codeContents: Change[], line) => {
      // Get the result from highlight.js
      const highlightResult = hljs.highlight(line.value, {
        language: 'json',
      });

      const parts = highlightResult.value
        // split the html result from highlighting by line breaks
        .split('\n')
        // filter out empty parts
        .filter((part) => !!part)
        // map to an object that contains line information as well as value
        .map((part) => {
          return { ...line, value: part };
        });
      codeContents.push(...parts);
      return codeContents;
    }, []);
  }
}
</script>
