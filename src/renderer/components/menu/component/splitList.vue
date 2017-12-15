<template>
    <div class="split" :class="'ticket_'+split">
        <header v-if="split">#{{split}}</header>
        <div class="inner" :class="{paid}">
            <div v-for="(item,index) in instance" :key="index" @click.stop="pick(item.unique)" :data-key="item.unique">
                <div class="main">
                    <span class="itemWrap">
                        <span class="item">{{item[language]}}
                            <span class="mark">{{item.mark[0] | mark}}</span>
                        </span>
                        <span class="side">{{item.side[language]}}
                            <span class="mark">{{item.mark[1] | mark}}</span>
                        </span>
                    </span>
                    <span>{{item.total}}</span>
                </div>
                <div class="sub" v-for="(sub,index) in item.choiceSet" :key="index">
                    <span>{{sub[language]}}</span>
                    <span class="price" v-show="sub.price > 0">( {{sub.price | decimal}} )</span>
                </div>
            </div>
            <div class="space" v-if="instance.length > 7 && !hide"></div>
        </div>
        <div class="summary" v-if="!hide" @click="toggle = !toggle">
            <div class="total">
                <span class="text">{{$t('text.total')}}:</span>
                <span>${{payment.due | decimal}}
                    <span class="tax">({{payment.tax | decimal}})</span>
                </span>
            </div>
            <div class="apply">
                <checkbox v-model="isTax" label="text.tax"></checkbox>
                <checkbox v-model="isApplyCoupon" label="text.coupon"></checkbox>
                <div v-show="toggle">
                    <checkbox v-model="isChargeDelivery" label="text.deliveryFee"></checkbox>
                    <checkbox v-model="isApplyGratuity" label="text.gratuity"></checkbox>
                </div>
            </div>
        </div>
        <div class="selector" v-else @click="selectAll">
            <div class="total">
                <i class="fa fa-bars"></i>
                <span class="text">{{$t('button.selectAll')}}</span>
            </div>
        </div>
        <div class="done" v-show="paid">
            <div class="btn print" @click="print">{{$t('button.print')}}</div>
        </div>
    </div>
</template>

<script>
import { mapGetters } from "vuex";
import checkbox from "../../setting/common/checkbox";
export default {
  components: { checkbox },
  props: ["invoice", "split", "settle", "hide"],
  data() {
    return {
      queue: [],
      done: false,
      paid: false,
      isTax: true,
      toggle: false,
      isDiscount: true,
      isApplyCoupon: true,
      isApplyGratuity: true,
      isChargeDelivery: true
    };
  },
  created() {
    this.$bus.on("SPLIT_ORDER", this.reset);
    this.$bus.on("SPLIT_PAID", this.check);
    this.isChargeDelivery = this.ticket.type === "DELIVERY";
    this.settle && (this.paid = this.settle.settled);
  },
  methods: {
    pick(key) {
      let i = this.queue.indexOf(key);
      i === -1 ? this.queue.push(key) : this.queue.splice(i, 1);
    },
    reset() {
      this.queue = [];
    },
    check(split) {
      if (this.split === split) {
        this.paid = true;
        this.print();
      }
    },
    print() {
      this.$emit("print", this.split);
      document
        .querySelector(`.ticket_${this.split} .done .print`)
        .classList.add("active");
    },
    setDiscount() {},
    selectAll() {
      this.instance.forEach(item => {
        this.pick(item.unique);
      });
    },
    pay() {
      if (this.paid) return;
      let due =
        parseFloat(this.payment.total) +
        parseFloat(this.payment.tip) +
        parseFloat(this.payment.gratuity) -
        parseFloat(this.payment.discount);
      this.$emit("pay", {
        split: this.split,
        payment: Object.assign({}, this.payment, { due })
      });
    }
  },
  computed: {
    instance() {
      return this.split
        ? this.invoice.filter(
            item =>
              typeof item.sort === "object"
                ? item.sort.includes(this.split)
                : item.sort === this.split
          )
        : this.invoice.filter(item => item.sort === 0);
    },
    payment() {
      let type =
        this.$route.name === "Menu" ? this.ticket.type : this.order.type;
      let coupon = this.order.coupon;

      let tip = 0,
        gratuity = 0,
        discount = 0,
        delivery = 0,
        subtotal = 0,
        tax = 0,
        paid = 0,
        log = [];

      this.instance.forEach(item => {
        let amount = toFixed(item.single * item.qty, 2);
        item.choiceSet.forEach(set => {
          amount += toFixed(set.single * set.qty, 2);
        });

        if (this.isTax) {
          let taxClass = this.tax.class[item.taxClass];
          tax += taxClass.apply[type] ? taxClass.rate / 100 * amount : tax;
        }

        subtotal += amount;
      });

      delivery =
        type === "DELIVERY" &&
        this.isChargeDelivery &&
        this.store.delivery &&
        !this.invoice.deliveryFree
          ? this.store.deliveryCharge
          : 0;

      if (this.tax.deliveryTax) {
        /*
            is Delivery fee taxable?
            Find out default tax rate and apply to delivery charge
        */
        let taxRate = 0;
        Object.keys(this.tax.class).forEach(type => {
          this.tax.class[type].default === true &&
            (taxRate = this.tax.class[type].rate);
        });

        tax += toFixed(delivery * taxRate / 100, 2);
      }

      tax = toFixed(tax, 2);

      if (coupon && this.isApplyCoupon) {
        let value = parseFloat(coupon.discount.replace(/\D+/, ""));
        if (coupon.discount.includes("%")) {
          discount = toFixed(value / 100 * subtotal, 2);
        } else {
          discount = value;
        }
      }

      let { enable, when, penalty } = this.store.table.surcharge;
      if (
        this.isApplyGratuity &&
        this.order.type === "DINE_IN" &&
        enable &&
        this.order.guest > when
      ) {
        let value = parseFloat(penalty.replace(/[^0-9.]/g, ""));

        if (penalty.includes("%")) {
          value = value / 100;
          gratuity = toFixed(subtotal * value, 2);
        } else {
          gratuity = value;
        }
      }

      let total = toFixed(subtotal + tax + delivery, 2);
      let due = toFixed(total - discount, 2);
      let surcharge = toFixed(tip + gratuity, 2);
      let balance = toFixed(due + surcharge, 2);
      let remain = toFixed(balance - paid, 2);

      return this.settle && this.settle.settled
        ? this.settle
        : {
            tip,
            gratuity,
            discount,
            delivery,
            subtotal,
            paid,
            log,
            sort: this.split,
            applyCoupon: this.isApplyCoupon,
            total,
            due,
            tax,
            surcharge,
            balance,
            remain
          };
    },
    ...mapGetters(["tax", "ticket", "store", "order", "language"])
  },
  watch: {
    queue(n) {
      let doms = document.querySelectorAll(`.ticket_${this.split} .active`);
      doms.forEach(dom => {
        dom && dom.classList.remove("active");
      });
      doms = document.querySelectorAll(`.ticket_${this.split} [data-key]`);
      doms.forEach(dom => {
        this.queue.includes(dom.dataset.key) &&
          dom &&
          dom.classList.add("active");
      });
      this.$emit("queue", { origin: this.split, items: n });
    }
  },
  filters: {
    mark(text) {
      return text.join(" ");
    }
  },
  beforeDestroy() {
    this.$bus.off("SPLIT_ORDER", this.reset);
    this.$bus.off("SPLIT_PAID", this.check);
  }
};
</script>

<style scoped>
.split {
  min-width: 240px;
  min-height: 400px;
  margin: 5px;
  background: #fafafa;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
  display: flex;
  flex-direction: column;
  position: relative;
}

.inner {
  background: #fff;
  flex: 1;
  max-height: 506px;
  overflow: hidden;
  position: relative;
}

.inner > div {
  display: flex;
  flex-direction: column;
  padding: 10px;
  border-bottom: 1px solid #cfd8dc;
  background: #fafafa;
}

.inner .space {
  padding: 9px 0;
  border: 2px dashed #eee;
  text-align: center;
  display: block;
}

.space::before {
  content: "\f067";
  font-family: fontAwesome;
  color: lightgray;
}

header {
  text-align: center;
  background: #607d8b;
  color: #fff;
}

.split .qty {
  width: 30px;
  text-align: center;
}

.split .itemWrap {
  flex: 1;
}

.split .active {
  background: #a1887f;
  color: #fff;
  text-shadow: 0 1px 1px rgba(0, 0, 0, 0.8);
}

.summary,
.selector {
  display: flex;
  align-items: center;
  border-top: 1px solid #eee;
}

.selector {
  padding: 14px 0;
  cursor: pointer;
}

.total {
  flex: 2;
  display: flex;
  justify-content: center;
}

.text {
  font-weight: bold;
}

.tax {
  font-size: 12px;
  color: gray;
}

.checkbox {
  height: 20px;
  padding: 2px 0;
}

.done {
  position: absolute;
  top: 18px;
  width: 100%;
  height: calc(100% - 18px);
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.done .btn {
  padding: 0px 10px;
  margin: 10px;
}

.btn.active {
  background: linear-gradient(#ddd, #f5f5f5);
  color: #988e8e;
  text-shadow: 1px 1px 0 #fff;
  box-shadow: none;
}

.paid::after {
  content: " ";
  position: absolute;
  bottom: 0;
  right: 0;
  width: 100px;
  height: 100px;
  background: url(../../../assets/image/paid.png) no-repeat;
  background-size: cover;
}

.main {
  display: flex;
}

.sub {
  font-size: 12px;
  color: #ef6c00;
  text-indent: 1em;
}

.active .sub {
  color: #fff;
}
</style>
