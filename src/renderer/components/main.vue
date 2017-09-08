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
  mounted() {
    window.addEventListener('click', this.record, false)
    window.addEventListener('online', this.online, false)
    window.addEventListener('offline', this.offline, false)
  },
  beforeDestroy() {
    window.removeEventListener('click', this.record, false)
    window.removeEventListener('online', this.online, false)
    window.removeEventListener('offline', this.offline, false)
  },
  methods: {
    record() {
      this.setApp({ lastActivity: new Date().getTime() })
    },
    online() {
      this.setDevice({ online: true })
    },
    offline() {
      this.setDevice({ online: false })
    },
    ...mapActions(['setApp', 'setDevice', 'toggleKeyboard'])
  }
}
</script>
