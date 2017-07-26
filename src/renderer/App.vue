<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import store from './vuex/store'
export default {
  store,
  computed: {
    ...mapGetters(['op'])
  },
  watch: {
    op(n) {
      if (n) {
        this.op.role === 'Admin' ?
          document.getElementById("app").classList.add("admin") :
          document.getElementById("app").classList.remove("admin");
      }
    }
  }
}
</script>

<style>
@import url(./assets/css/font-awesome.min);
@import url(./assets/css/icon.css);
@import url(./assets/css/style.css);
</style>
