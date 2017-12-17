<template>
    <div>
        <switches v-model="coupon.redeem"></switches>
        <div class="inner">
            <span>{{coupon.alias}}</span>
            <span>{{coupon.description}}</span>
        </div>
    </div>
</template>

<script>
import switches from "../../setting/common/switches";
export default {
  props: ["promotion"],
  components: { switches },
  data() {
    return {
      coupon: Object.assign({}, this.promotion, {
        redeem: false
      })
    };
  }
};
</script>