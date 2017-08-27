<template>
  <div class="container" @click.self="toggleKeyboard(false)">
    <dock></dock>
    <router-view></router-view>
  </div>
</template>

<script>
import { mapActions } from 'vuex'
import dock from './dock'
export default {
  components: { dock },
  mounted() {
    window.addEventListener("click", this.record, false);
  },
  beforeDestroy() {
    window.removeEventListener("click", this.record, false);
  },
  methods: {
    record() {
      this.setApp({ opLastAction: new Date().getTime() })
    },
    ...mapActions(['setApp', 'toggleKeyboard'])
  }
}
</script>

<style></style>
