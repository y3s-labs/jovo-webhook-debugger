import JovoWebClientVue, { JovoWebClientVueConfig } from '@jovotech/client-web-vue2';
import JovoUIComponents from '@jovotech/ui-components';
import hljs from 'highlight.js/lib/core';

import json from 'highlight.js/lib/languages/json';
import Vue from 'vue';
import { client } from './client';

hljs.registerLanguage('json', json);

Vue.use(JovoUIComponents);

Vue.use<JovoWebClientVueConfig>(JovoWebClientVue, client);
