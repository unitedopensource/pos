<template>
<div class="popupMask dark center">
  <div class="editor">
    <header>
      <h5></h5>
      <h3>{{$t('title.coupon')}}</h3>
    </header>
    <div class="wrap">

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
  methods: {

  }
}
</script>
