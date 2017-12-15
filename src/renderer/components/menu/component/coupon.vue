<template>
<div class="popupMask dark center">
  <div class="editor">
    <header>
      <h5></h5>
      <h3>{{$t('title.coupon')}}</h3>
    </header>
    <div class="wrap">
      <div v-for="(coupon,index) in coupons" :key="index">
        <span>{{coupon.for}}</span>
        <span>{{coupon.discount}}</span>
      </div>
    </div>
    <footer>
      <div class="opt">

      </div>
      <button class="btn" @click="init.resolve">{{$t('button.confirm')}}</button>
    </footer>
  </div>
</div>
</template>

<script>
export default {
  props: ["init"],
  data() {
    return {
      coupons: []
    }
  },
  created() {
    this.coupons = this.init.coupons.map(coupon => {
      Object.assign(coupon, { redeem: false })
      return coupon
    })
  },
  methods: {

  }
}
</script>
