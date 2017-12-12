<template>
    <div></div>
</template>

<script>
export default {
  data() {
    return {
        cc:"1234 2234 3234 4234",
        exp:"11/09"
    };
  },
  created(){
      window.ec = this.$encrypt;
      window.dc = this.$decrypt;
  }
};
</script>