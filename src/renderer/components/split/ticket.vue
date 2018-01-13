<template>
  <ul @click.self="tap" v-if="enable" :class="[unique,{ban}]">
    <li v-for="(item,index) in order.content" :key="index" @click="pick(item)" :data-unique="item.unique" v-show="!item.split">
      <item :item="item" :split="master" :language="language"></item>
    </li>
    <template v-if="master">
      <li class="function" v-if="buffer.length === 0" @click="selectAll">
        <i class="fa fa-check-square-o"></i>
        <span>{{$t('button.selectAll')}}</span>
      </li>
      <li class="function" v-else @click="selectAll">
        <i class="fa fa-square-o"></i>
        <span>{{$t('button.unset')}}</span>
      </li>
    </template>
    <template v-else>
      <li class="tooltip">
        <i class="fa fa-warning"></i>
        <span>{{reason}}</span>
      </li>
      <li class="settle">
        <p class="total">$ {{order.payment.total | decimal}}
          <span class="tip">( {{order.payment.tax | decimal}} )</span>
        </p>
        <i class="fa fa-bars"></i>
      </li>
    </template>
  </ul>
</template>

<script>
import { mapGetters } from "vuex";
import item from "./component/item";

export default {
  props: ["data", "master", "index"],
  components: { item },
  computed: {
    enable() {
      return this.master
        ? this.order.content.filter(i => !i.split).length !== 0
        : true;
    },
    ...mapGetters(["tax", "dinein", "store"])
  },
  data() {
    return {
      order: JSON.parse(JSON.stringify(this.data)),
      language: this.$store.getters.language,
      reason: "",
      ban: false,
      buffer: [],
      unique:
        "s" +
        Math.random()
          .toString(36)
          .substr(2, 2)
    };
  },
  created() {
    if (this.master) {
      this.$bus.on("reset", this.hide);
      this.$bus.on("restore", this.restore);
    } else {
      this.$bus.on("reset", this.remove);
      this.$bus.on("transfer", this.transfer);

      if (this.order.settled) {
        this.ban = true;
        this.reason = this.$t("dialog.ticketClosed");
      } else if (this.order.payment.log.length) {
        this.ban = true;
        this.reason = this.$t("dialog.paymentFound");
      }
    }
  },
  mounted() {
    this.calculator(this.order.content);
  },
  beforeDestroy() {
    if (this.master) {
      this.$bus.off("reset", this.hide);
      this.$bus.off("restore", this.restore);
    } else {
      this.$bus.off("reset", this.remove);
      this.$bus.off("transfer", this.transfer);
    }
  },
  methods: {
    pick(item) {
      if (this.master) {
        item = JSON.parse(JSON.stringify(item));
        item.parent = item.unique;
      }

      const index = this.buffer.findIndex(i => i.unique === item.unique);
      index !== -1 ? this.buffer.splice(index, 1) : this.buffer.push(item);
    },
    hide(item) {
      this.buffer.forEach(item => {
        const { unique } = item;
        const index = this.order.content.findIndex(i => i.unique === unique);
        this.order.content[index].split = true;
      });
      this.order.content.splice();
      this.buffer = [];

      const remain = this.order.content.filter(i => !i.split).length;
      remain === 0 && this.$emit("done");
    },
    remove() {
      this.buffer.forEach(item => {
        const { unique } = item;
        const index = this.order.content.findIndex(i => i.unique === unique);
        this.order.content.splice(index, 1);
      });
      this.buffer = [];
    },
    restore(items) {
      this.order.content.forEach(item => {
        if (items.includes(item.unique)) item.split = false;
      });
      this.buffer = [];
      this.order.content.splice();
      this.$bus.emit("reset");
    },
    transfer({ unique, items }) {
      this.unique === unique && this.order.content.push(...items);
      this.$bus.emit("reset");
    },
    tap() {
      this.buffer = [];
      this.$emit("acquire", { index: this.index, unique: this.unique });
    },
    selectAll() {
      this.order.content.filter(i => !i.split).forEach(item => this.pick(item));
    },
    calculator(items) {
      const {
        type,
        guest,
        coupons,
        taxFree = false,
        deliveryFree = false,
        gratuityFree = false
      } = this.order;
      const { enable, rules } = this.dinein.surcharge;

      let delivery =
        type === "DELIVERY" && this.store.delivery && !deliveryFree
          ? parseFloat(this.store.deliveryCharge)
          : 0;

      let { tip, gratuity, paid } = this.order.payment;
      let subtotal = 0,
        tax = 0,
        discount = 0;

      items.forEach(item => {
        if (item.void) return;

        const single = parseFloat(item.single);
        const qty = item.qty || 1;
        const taxClass = this.tax.class[item.taxClass];

        let amount = toFixed(single * qty, 2);

        item.choiceSet.forEach(set => {
          const p = parseFloat(set.single);
          const s = set.qty || 1;
          const t = toFixed(p * s, 2);
          amount = toFixed(amount + t, 2);
        });

        subtotal = toFixed(subtotal + amount, 2);

        if (!taxFree && taxClass.apply[type])
          tax += taxClass.rate / 100 * amount;
      });

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
        /**
         * Tax apply Before Discount (For Example: 10% Tax Rate, 20% Discount)
         *
         * Subtotal: 10.00
         * Tax:       1.00
         * Discount:  2.00
         * Total:     9.00
         * ------------------------------------------------------------------
        **/
        tax += toFixed(delivery * taxRate / 100, 2);
      }

      if (type === "DINE_IN" && !gratuityFree && enable) {
        //find rule
        try {
          const { fee, percentage } = rules
            .sort((a, b) => a.guest < b.guest)
            .find(r => guest >= r.guest);
          gratuity = percentage ? toFixed(subtotal * fee / 100, 2) : fee;
        } catch (e) {}
      }

      if (coupons && coupons.length > 0) {
        let offer = 0;
        coupons.forEach(coupon => {
          const { reference } = coupon;

          switch (coupon.type) {
            // 'rebate':        '满减券',
            // 'giveaway':      '礼物券',
            // 'voucher':       '现金券',
            // 'discount':      '折扣券',
            case "rebate":
              offer += coupon.discount;
              break;
            case "voucher":
              offer += coupon.discount;
              break;
            case "discount":
              switch (coupon.apply) {
                case "category":
                  let _offer = 0;
                  this.order.content.forEach(item => {
                    if (reference.includes(item.category)) {
                      _offer += coupon.discount / 100 * item.single * item.qty;
                    }
                  });
                  offer += _offer;
                  break;
                case "item":
                  break;
                default:
                  offer += coupon.discount / 100 * subtotal;
              }
              break;
          }
        });

        discount += offer;
      }

      const total = subtotal + tax + delivery;
      const due = Math.max(0, total - discount);
      const surcharge = tip + gratuity;
      const balance = due + surcharge;
      const remain = balance - paid;

      Object.assign(this.order.payment, {
        subtotal: toFixed(subtotal, 2),
        tax: toFixed(tax, 2),
        total: toFixed(total, 2),
        discount: toFixed(discount, 2),
        due: toFixed(due, 2),
        balance: toFixed(balance, 2),
        paid: toFixed(paid, 2),
        remain: toFixed(remain, 2),
        tip: toFixed(tip, 2),
        gratuity: toFixed(gratuity, 2),
        delivery: toFixed(delivery, 2),
        surcharge: toFixed(surcharge, 2)
      });
    }
  },
  watch: {
    buffer(items) {
      const uniques = items.map(i => i.unique);
      const picked = document.querySelectorAll(`ul.${this.unique} li.picked`);
      for (let dom of picked) {
        dom.classList.remove("picked");
      }

      uniques.forEach(unique => {
        const dom = document.querySelector(`[data-unique="${unique}"]`);
        dom && dom.classList.add("picked");
      });
    },
    "order.content": {
      handler(items) {
        this.calculator(items);
      },
      deep: true
    }
  }
};
</script>

<style scoped>
ul {
  width: 250px;
  height: 490px;
  overflow: hidden;
  margin: 5px;
  background: #fafafa;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
  position: relative;
}

li {
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 30px;
  background: #fff;
  border-bottom: 1px solid #eee;
  padding: 5px;
}

li.picked {
  background: #9e9e9e;
  text-shadow: 0 1px 1px #333;
}

li.function {
  flex-direction: row;
  align-items: center;
  background: #90a4ae;
  bottom: 0;
  position: absolute;
  width: 240px;
  border: none;
  cursor: pointer;
  color: #fcfcfc;
}

.function i {
  margin-right: 5px;
}

li.settle {
  flex-direction: row;
  align-items: center;
  padding: 5px 15px;
  position: absolute;
  width: 220px;
  bottom: 0;
  border-top: 1px solid #eee;
}

li.settle p {
  flex: 1;
}

.settle i {
  cursor: pointer;
}

.total {
  font-weight: bold;
  font-family: "Agency FB";
  color: #009688;
}

.tip {
  font-weight: lighter;
  margin-left: 5px;
  font-size: 0.8em;
  color: rgba(0, 0, 0, 0.5);
}

ul.ban {
  pointer-events: none;
}

ul.ban:after {
  content: " ";
  background: rgba(0, 0, 0, 0.3);
  width: 250px;
  height: 449px;
  position: absolute;
  top: 0;
  z-index: 0;
}

ul.ban li.tooltip {
  display: flex;
}

li.tooltip {
  bottom: 50%;
  position: absolute;
  width: 250px;
  flex-direction: row;
  align-items: center;
  padding: 0;
  color: #fafafa;
  background: #f44336;
  text-shadow: 0 1px 1px #333;
  display: none;
  z-index: 1;
  border: none;
}
</style>