<template>
  <div class="container" @click.self="toggleKeyboard(false)">
    <dock></dock>
    <router-view></router-view>
    <div :is="component" :init="componentData"></div>
  </div>
</template>

<script>
import { mapActions } from "vuex";
import dock from "./dock/dock";
import discount from "./payment/discount";
import coupon from "./menu/component/coupon";

export default {
  components: { dock, coupon, discount },
  data() {
    return {
      componentData: null,
      component: null
    }
  },
  created() {
    this.$bus.on("__THREAD__OPEN", this.openComponent)
  },
  beforeDestroy() {
    this.$bus.off("__THREAD__OPEN", this.openComponent)
  },
  methods: {
    openComponent({ threadID, component, args }) {
      switch (component) {
        case "discount":
          new Promise((resolve, reject) => {
            this.componentData = Object.assign({}, { resolve, reject }, args);
            this.component = component;
          }).then(result => {
            this.$bus.emit("__THREAD__CLOSE", { result, component, threadID });
            this.$q()
          }).catch(() => this.$q());
          break;
        case "coupon":
          this.$socket.emit("[COUPON] LIST", coupons => {
            coupons.forEach(coupon => Object.assign(coupon, { redeem: false, enable: true }));

            new Promise((resolve, reject) => {
              this.componentData = Object.assign({}, { resolve, reject, coupons }, args);
              this.component = component;
            }).then(result => {
              this.$bus.emit("__THREAD__CLOSE", { result, component, threadID });
              this.$q()
            }).catch(() => this.$q())
          });
      }
    },
    ...mapActions(["toggleKeyboard"])
  }
};
</script>
