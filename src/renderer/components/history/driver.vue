<template>
  <div class="popupMask center dark" @click.self="exit">
    <div class="driver">
      <header class="title">{{text('SET_DRIVER')}}</header>
    </div>
  </div>
</template>

<script>
export default {
  methods:{
    exit(){
      this.$emit('exit')
    }
  }
}
</script>

<style>
  .driver{

  }
</style>
