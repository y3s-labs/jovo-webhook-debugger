import '@/assets/css/theme.pcss';
import '@/class-component-hooks';
import '@/plugins';
import { Platform } from '@jovotech/framework';
import { AlexaPlatform } from '@jovotech/platform-alexa';
import { CorePlatform } from '@jovotech/platform-core';
import { WebPlatform } from '@jovotech/platform-web';
import 'reflect-metadata';
import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';

export const PLATFORMS: Platform[] = [
  new AlexaPlatform(),
  new CorePlatform(),
  new WebPlatform(),
  // new FacebookMessengerPlatform({
  //   pageAccessToken: '',
  // }),
  // new GoogleAssistantPlatform(),
  // new GoogleBusinessPlatform({
  //   serviceAccount: {},
  // }),
];

// // create async function in root
// async function main() {
//   console.log(PLATFORMS.length)
//   const output = await outputTemplateConverter.fromResponse({
//     foo: "bar",
//   } as any);
// }

// main();

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount('#app');
