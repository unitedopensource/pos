<template>
  <div class="container" @click.self="toggleKeyboard(false)">
    <dock></dock>
    <router-view></router-view>
  </div>
</template>

<script>
import { mapActions } from 'vuex'
import dock from './dock/dock'
export default {
  components: { dock },
  methods: {
    ...mapActions(['toggleKeyboard'])
  }
}
</script>
