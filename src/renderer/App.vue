<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
import store from './vuex/store'
import serialport from 'serialport'
export default {
  store
}
</script>

<style>
@import url(./assets/css/font-awesome.min);
@import url(./assets/css/icon.css);
@import url(./assets/css/style.css);
</style>
