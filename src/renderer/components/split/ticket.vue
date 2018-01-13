<template>
  <div class="relative">
    <ul @click.self="tap" v-if="enable" :class="[unique,{ban}]">
      <li v-for="(item,index) in order.content" :key="index" @click="pick(item)" :data-unique="item.unique" v-show="!item.split">
        <div class="main">
          <span class="qty">{{item.qty}}</span>
          <span>
            <span class="item">{{item[language]}}</span>
            <span class="side">{{item.side[language]}}</span>
          </span>
          <template v-if="false">
            <i class="fa fa-lock" @click.stop="toggleLock(index)" v-if="item.lock"></i>
            <i class="fa fa-unlock" @click.stop="toggleLock(index)" v-else></i>
          </template>
          <template v-else>
            <span></span>
          </template>
        </div>
        <div class="sub">
          <p v-for="(sub,idx) in item.choiceSet" :key="idx">
            <span class="qty">{{item.qty}}</span>
            <span>{{sub[language]}}</span>
          </p>
        </div>
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
          <p class="total">$ {{order.payment.remain | decimal}}
            <span class="tip">( {{order.payment.tax | decimal}} )</span>
          </p>
          <i class="fa fa-bars" @click="ticketConfig"></i>
        </li>
      </template>
    </ul>
    <div :is="component" :init="componentData" @config="applyConfig" @discount="setDiscount" @coupon="setCoupon" @resetDiscount="resetDiscount"></div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import evener from "./component/evener";
import options from "./component/options";

export default {
  props: ["data", "master", "index"],
  components: { evener, options },
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
      componentData: null,
      component: null,
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
      this.$bus.on("remove", this.hide);
      this.$bus.on("restore", this.restore);

      this.order.content.forEach(item => (item.lock = false));
    } else {
      this.$bus.on("remove", this.remove);
      this.$bus.on("transfer", this.transfer);
      this.$bus.on("__THREAD__CLOSE", this.handleThreadResult)

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
    this.$calculatePayment(this.order.content);
  },
  beforeDestroy() {
    if (this.master) {
      this.$bus.off("remove", this.hide);
      this.$bus.off("restore", this.restore);
    } else {
      this.$bus.off("remove", this.remove);
      this.$bus.off("transfer", this.transfer);
      this.$bus.off("__THREAD__CLOSE", this.handleThreadResult)
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
      this.buffer.filter(item => !item.lock).forEach(({ unique }) => {
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
      this.$bus.emit("remove");
    },
    transfer({ unique, items }) {
      if (this.unique === unique) {
        this.order.content.push(...items.filter(item => !item.lock));

        const evenSplit = items.filter(item => item.lock);
        evenSplit.length > 0 && this.popDialogFor(evenSplit);
      }
      this.$bus.emit("remove");
    },
    popDialogFor(items) {
      new Promise((resolve, reject) => {
        this.componentData = { resolve, reject };
        this.component = "evener";
      }).then(option => {
        console.log(option);
        this.$q();
      });
    },
    ticketConfig() {
      const taxFree = this.order.taxFree || false;
      const deliveryFree = this.order.deliveryFree || false;
      const gratuityFree = this.order.gratuityFree || false;
      const isDiscount = this.order.payment.discount > 0;
      const { type } = this.order;
      !this.component
        ? this.$open("options", { taxFree, deliveryFree, gratuityFree, type, isDiscount })
        : this.$q()
    },
    applyConfig(params) {
      Object.assign(this.order, params);
      this.$calculatePayment(this.order.content);
    },
    setDiscount() {
      this.$bus.emit("__THREAD__OPEN", {
        threadID: this.unique,
        component: "discount",
        args: {
          payment: this.order.payment
        }
      })
    },
    resetDiscount() {
      this.order.coupons = [];
      this.$calculatePayment(this.order.content);
    },
    setCoupon() {
      this.$bus.emit("__THREAD__OPEN", {
        threadID: this.unique,
        component: "coupon",
        args: {
          order: this.order
        }
      })
    },
    handleThreadResult({ result, component, threadID }) {
      if (threadID !== this.unique) return;
      
      switch (component) {
        case "discount":
          const { discount, coupon } = result;

          let coupons = this.order.coupons.filter(coupon => coupon.code !== 'UnitedPOS Inc');
          discount > 0 && coupons.push(coupon);

          this.order.coupons = coupons;
          this.componentData.isDiscount = discount > 0;
          break;
        case "coupon":
          const refs = result
            .filter(coupon => coupon.type === "giveaway")
            .map(coupon => coupon.reference)
            .reduce((a, b) => a.concat(b), []);

          refs.forEach(item => {
            Object.assign(item, {
              unique: Math.random().toString(36).substr(2, 5),
              print: false,
              pending: false,
              void: false,
              qty: 1,
              choiceSet: [],
              single: parseFloat(item.price[0]),
              total: item.price[0].toFixed(2)
            });
            this.order.content.push(item);
          });

          this.order.coupons = result;
          break;
      }
      this.$calculatePayment(this.order.content);
      this.componentData.isDiscount = this.order.payment.discount > 0;
    },
    tap() {
      this.buffer = [];
      this.$emit("acquire", { index: this.index, unique: this.unique });
    },
    selectAll() {
      this.order.content.filter(i => !i.split).forEach(item => this.pick(item));
    },
    toggleLock(index) {
      const item = this.order.content[index];
      item.lock = !item.lock;
      this.order.content.splice(index, 1, item);

      const target = this.buffer.find(i => i.unique === item.unique);
      target.lock = item.lock;
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
        this.$calculatePayment(items);
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

.main {
  position: relative;
}

.main i {
  display: none;
  position: absolute;
  right: -5px;
  top: -5px;
  padding: 5px 15px;
  background: #9e9e9e;
  cursor: pointer;
}

.picked .main i {
  display: initial;
}

.main .qty {
  display: inline-block;
  min-width: 20px;
  text-align: center;
}

.side {
  color: rgba(0, 0, 0, 0.5);
  margin-left: 2px;
}

.sub {
  color: #ff9800;
  font-size: 0.8em;
  text-indent: 2em;
}

.sub .qty:after {
  content: " x ";
}

li.picked .main,
li.picked .main .side,
li.picked .sub {
  color: #fff;
}
</style>