<template>
  <div id="app" class="flex flex-col h-screen">
    
    <jv-title-bar>
      <div class="flex items-center">
        <img class="h-8 w-auto" src="@/assets/images/logo.png" alt="logo" />
        <span class="ml-0.5 text-base font-extralight text-white">DEBUGGER</span>
      </div>
    </jv-title-bar>
    <router-view class="flex-grow h-0" />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

@Component({
  components: {},
})
export default class App extends Vue {
  closed = false;
  created() {
    return this.$store.dispatch('connectSocket', this.$route.params.id);
  }

   mounted() {
    console.log('mounted app');
  }
}
</script>
<style>
.v4-announcement {
  font-size: 15px;
  padding: 6px;
  text-align: center;
  a {
    text-decoration: underline;
    &:hover {
      text-decoration: none;
    }
  }
  svg {
    width: 16px;
    margin-top: 3px;
    margin-left: 5px;
    opacity: 0.7;
    &:hover {
      opacity: 1;
      cursor: pointer;
    }
  }
}
</style>
