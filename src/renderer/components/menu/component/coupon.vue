<template>
  <div class="popupMask dark center">
    <div class="editor">
      <header>
        <h5></h5>
        <h3>{{$t('title.coupon')}}</h3>
      </header>
      <div class="wrap">
        <card v-for="(coupon,index) in coupons" :key="index" :promotion="coupon"></card>
      </div>
      <footer>
        <div class="opt">

        </div>
        <button class="btn">{{$t('button.input')}}</button>
        <button class="btn">{{$t('button.scan')}}</button>
        <button class="btn" @click="init.resolve">{{$t('button.confirm')}}</button>
      </footer>
    </div>
  </div>
</template>

<script>
import card from "./card";
export default {
  props: ["init"],
  components: { card },
  data() {
    return {
      coupons: this.init.coupons.slice()
    };
  },
  methods: {}
};
</script>
