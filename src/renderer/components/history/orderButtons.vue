<template>
  <div>
    <button class="btn" @click="thirdParty" :disabled="disable || order.split">
      <i class="fa fa-google-wallet"></i>
      <span class="text">{{$t('button.thirdParty')}}</span>
    </button>
    <button class="btn" @click="split" :disabled="disable">
      <i class="fa fa-clone"></i>
      <span class="text">{{$t('button.split')}}</span>
    </button>
    <button class="btn" @click="combine" :disabled="true">
      <i class="fa fa-link"></i>
      <span class="text">{{$t('button.combine')}}</span>
    </button>
    <button class="btn" @click="discount" :disabled="disable || !discountable">
      <i class="fa fa-tag"></i>
      <span class="text">{{$t('button.discount')}}</span>
    </button>
    <button class="btn" @click="exit">
      <i class="fa fa-times"></i>
      <span class="text">{{$t('button.exit')}}</span>
    </button>
    <button class="btn" @click="driver" :disabled="order.type !== 'DELIVERY' || !assignable">
      <i class="fa fa-id-card-o"></i>
      <span class="text">{{$t('button.driver')}}</span>
    </button>
    <div :is="component" :init="componentData"></div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import paymentMark from "../payment/mark";
import discount from "../payment/discount";
import dialoger from "../common/dialoger";
import driver from "./component/driver";
import split from "../split/index";

export default {
  props: ["date"],
  components: { driver, dialoger, paymentMark, split, discount },
  data() {
    return {
      componentData: null,
      component: null,
      assignable: false,
      discountable: false,
      today: today()
    };
  },
  created() {
    this.discountable = this.approval(this.op.modify, "discount");
    this.assignable = this.approval(this.op.modify, "driver");
  },
  methods: {
    thirdParty() {
      this.$open("paymentMark");
    },
    split() {
      this.$open("split");
    },
    combine() {},
    discount() {
      this.$socket.emit("[COUPON] LIST", coupons => {
        new Promise((resolve, reject) => {
          const { payment } = this.order;
          this.componentData = { payment, coupons, resolve, reject };
          this.component = "discount";
        })
          .then(this.updatePayment)
          .catch(() => this.$q());
      });
    },
    updatePayment(result) {
      let { subtotal, tax, tip, gratuity, delivery, paid } = this.order.payment;

      const total = subtotal + tax + delivery;
      const discount = result.discount;
      const due = Math.max(0, total - discount);
      const surcharge = tip + gratuity;
      const balance = due + surcharge;
      const remain = Math.max(0, balance - paid);

      result.coupon
        ? Object.assign(this.order, { coupon: result.coupon })
        : Object.assign(this.order, { coupon: null });

      Object.assign(this.order.payment, {
        total: toFixed(total, 2),
        discount: toFixed(discount, 2),
        due: toFixed(due, 2),
        balance: toFixed(balance, 2),
        paid: toFixed(paid, 2),
        remain: toFixed(remain, 2)
      });

      this.$socket.emit("[UPDATE] INVOICE", this.order);
      this.$q();
    },
    driver() {
      this.$open("driver", { ticket: this.order.number });
    },
    exit() {
      this.resetMenu();
      this.$router.push({ path: "/main" });
    },
    ...mapActions(["resetMenu"])
  },
  computed: {
    disable() {
      return (
        this.order.settled ||
        this.today !== this.date ||
        this.order.status === 0
      );
    },
    ...mapGetters(["op", "order", "ticket", "isEmptyTicket"])
  }
};
</script>

<style scoped>
div {
  padding: 3px 0px 0px 3px;
}

div button {
  margin: 3px 0;
}
</style>
