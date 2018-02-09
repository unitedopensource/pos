<template>
  <div class="phone">
    <label>{{$t('text.phone')}}</label>
    <div class="wrap">
      <i class="fa fa-phone icon"></i>
      <input :value="value" v-mask="'### ### ####'">
    </div>
  </div>
</template>

<script>
export default {
  props: ["value"],
  data() {
    return {};
  },
  created() {
    console.log(this.value);
  }
};
</script>

<style scoped>
.phone {
  display: inline-flex;
  flex-direction: column;
  position: relative;
}

.wrap {
  border: 2px solid #eee;
}

.wrap i {
  padding: 0 5px;
  color: #3c3c3c;
  font-size: 24px;
}

input {
  border: none;
  background: transparent;
  font-size: 24px;
  outline: none;
  width: 170px;
}
</style>