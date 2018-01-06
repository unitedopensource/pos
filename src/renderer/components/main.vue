<template>
  <div class="container" @click.self="toggleKeyboard(false)">
    <dock></dock>
    <transition mode="out-in">
      <router-view></router-view>
    </transition>
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
