<template>
    <div class="activation">
        <header>United POS Activation</header>
        <div class="inner">
            <input type="text" v-model="code">
        </div>
        <footer>
            <button class="btn" @click="checkLicense"></button>
        </footer>
    </div>
</template>

<script>
export default {
  props: ["init"],
  data() {
    return {
        code:""
    };
  },
  methods: {
      checkLicense(){

      },
      activate(){
          
      }
  }
};
</script>

<style scoped>
.activation {
  width: 400px;
}
</style>