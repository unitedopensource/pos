<template>
    <div class="coupon">
        <table>
            <thead>
                <tr>
                    <th>for</th>
                    <th>Discount</th>
                    <th>Expire</th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(coupon,index) in coupons" :key="index">
                    <td>{{coupon.for}}</td>
                    <td>{{coupon.discount}}</td>
                    <td>{{coupon.expire}}</td>
                    <td><i class="fa fa-ellipsis-v"></i></td>
                </tr>
            </tbody>
            <tfoot></tfoot>
        </table>
    </div>
</template>

<script>
export default {
  data() {
    return {
      coupons: []
    };
  },
//   beforeRouteEnter(to, from, next) {
//     next(vm => {
//       vm.$socket.emit("[COUPON] LIST", data => {
//         vm.coupons = data;
//       });
//     });
//   }
};
</script>

<style scoped>
.coupon {
  width: 650px;
}
</style>