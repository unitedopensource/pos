<template>
    <div>
        <router-link tag="header" :to="{name:'Setting.promotion'}">
            <i class="fa fa-chevron-left"></i>
            <span>{{$t('button.back')}}</span>
        </router-link>
        <table>
          <thead>
            <tr>
              <th></th>
              <th></th>
              <th></th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(coupon,index) in coupons" :key="index">
              <td>{{coupon.for}}</td>
              <td>{{coupon.discount}}</td>
              <td>{{coupon.expiration}}</td>
              <td></td>
            </tr>
          </tbody>
        </table>
    </div>
</template>

<script>
export default {
  props: ["init"],
  data() {
    return {
      coupons: []
    };
  },
  created() {
    this.$socket.emit("[COUPON] LIST", coupons => {
      this.coupons = coupons;
    });
  }
};
</script>

<style scoped></style>