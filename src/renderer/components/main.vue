<template>
  <div class="container" @click.self="toggleKeyboard(false)">
    <dock></dock>
    <router-view></router-view>
  </div>
</template>

<script>
import dock from './dock'
import {mapActions} from 'vuex'
  export default {
    components:{
      dock
    },
    methods:{
      ...mapActions(['toggleKeyboard'])
    }
  }
</script>

<style>
</style>
