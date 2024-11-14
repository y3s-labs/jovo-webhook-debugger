<template>
  <div id="language-select-container" title="Locale">
    <jv-select
      id="language-select"
      :options="selectOptions"
      :value="selectedLocale"
      @input="onLocaleChange"
    />
  </div>
</template>

<script lang="ts">
import { SelectOption } from '@jovotech/ui-components';
import { Component, Vue } from 'vue-property-decorator';

@Component({
  name: 'language-select',
})
export default class LanguageSelect extends Vue {
  get selectedLocale(): string {
    return this.$store.getters.selectedLocale;
  }

  get languages(): string[] {
    return this.$store.getters.debuggerConfig.locales.slice() || ['en'];
  }

  get sortedLanguages(): string[] {
    const languages = this.languages.slice();
    const indexOfSelectedLanguage = languages.indexOf(this.selectedLocale);
    if (indexOfSelectedLanguage >= 0) {
      languages.unshift(languages.splice(indexOfSelectedLanguage, 1)[0]);
    }
    return languages;
  }

  get selectOptions(): SelectOption[] {
    return this.sortedLanguages.map((language) => ({ label: language, value: language }));
  }

  onLocaleChange(locale: string) {
    this.$store.commit('setSelectedLocale', locale);
    this.$client.config.locale = locale;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (this.$client.speechRecognizer as any).recognition.lang = locale;
    this.$client.speechSynthesizer.config.language = locale;
  }
}
</script>

<style>
@import '../assets/css/theme.pcss';
#language-select {
  @apply focus:ring-0 !important;
}

#language-select-container > div > div {
  @apply mt-0 !important;
  @apply w-24 bottom-full left-1/2 transform -translate-x-1/2 mb-1 max-h-30 overflow-y-auto scrollbar border border-gray-300;
}
</style>
