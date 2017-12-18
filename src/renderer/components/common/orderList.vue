<template>
    <div>
        <header v-if="layout === 'order'" class="simple">
            <span class="qty">{{$t('text.qty')}}</span>
            <span class="item">{{$t('text.item')}}</span>
            <span class="price">{{$t('text.price')}}</span>
        </header>
        <header v-else class="info">
            <div class="bar">
                <span class="number">{{order.number}}</span>
                <span class="type" v-show="order.type">{{$t('type.'+order.type)}}</span>
                <span class="provider" v-show="order.source !== 'POS'">{{order.source}}</span>
                <span class="timePass">
                    <i class="fa fa-clock-o"></i>{{order.time | fromNow}}
                </span>
            </div>
            <div class="content" v-if="order.type === 'DINE_IN'">
                <span class="time">{{order.time | moment('YYYY-MM-DD HH:mm:ss')}}</span>
                <span class="corner" v-if="undoneItems">{{$t('text.progressTicket',undoneItems)}}</span>
                <span class="corner" v-else>{{$t('text.doneTicket')}}</span>
                <div>
                    <span class="text">{{$t('text.guest')}}</span>
                    <span class="value">{{order.guest}}</span>
                </div>
            </div>
            <div class="content" v-else>
                <span class="time">{{order.time | moment('YYYY-MM-DD HH:mm:ss')}}</span>
                <div>
                    <span class="value">{{(order.customer && order.customer.phone) | phone}}</span>
                </div>
                <div>
                    <span class="value">{{order.customer && order.customer.address}}</span>
                </div>
            </div>
        </header>
        <div class="order" @click.self="resetHighlight" v-if="layout === 'order'">
            <v-touch class="inner" :style="scroll" @panup="move" @pandown="move" @panstart="panStart" @panend="panEnd" tag="ul">
                <list-item v-for="(item,index) in order.content" :data-category="item.category" :key="index" :item="item" :checkbox="todo"></list-item>
            </v-touch>
        </div>
        <div class="order" v-else>
            <v-touch class="inner" :style="scroll" @panup="move" @pandown="move" @panstart="panStart" @panend="panEnd" tag="ul">
                <list-item v-for="(item,index) in order.content" :data-category="item.category" :key="index" :item="item" :class="{print:!item.print,pending:item.pending}" @click.native="addToSpooler(item)"></list-item>
            </v-touch>
        </div>
        <div class="middle">
            <div class="fnWrap">
                <button class="fn fa fa-credit-card-alt" @click="openCreditCard" :disabled="$route.name !== 'Menu'"></button>
                <button class="fn" @click="separator" :disabled="$route.name !== 'Menu'">-----</button>
                <button class="fn fa fa-print" @click="directPrint" v-if="$route.name !=='Menu'"></button>
                <button class="fn fa fa-check-square-o" v-else @click="toggleTodoList" :disabled="app.mode ==='edit'"></button>
                <button class="fn fa fa-keyboard-o" @click="openKeyboard" :disabled="$route.name !== 'Menu'"></button>
            </div>
            <div class="settle" @click="openConfig">
                <div>
                    <span class="text">{{$t("text.subtotal")}}:</span>
                    <span class="value">{{payment.subtotal | decimal}}</span>
                </div>
                <div>
                    <span class="text">{{$t("text.tax")}}:</span>
                    <span class="value">{{payment.tax | decimal}}</span>
                </div>
                <template v-if="order.type === 'DELIVERY'">
                  <div :class="{hidden:parseFloat(payment.tip) === 0}">
                    <span class="text">{{$t("text.tip")}}:</span>
                    <span class="value">{{payment.tip | decimal}}</span>
                  </div>
                  <div>
                    <span class="text">{{$t("text.deliveryFee")}}:</span>
                    <span class="value">{{payment.delivery | decimal}}</span>
                  </div>
                </template>
                <template v-else>
                  <div :class="{hidden:parseFloat(payment.tip) === 0}">
                    <span class="text">{{$t("text.tip")}}:</span>
                    <span class="value">{{payment.tip | decimal}}</span>
                  </div>
                  <div :class="{hidden:parseFloat(payment.discount) === 0}">
                    <span class="text">{{$t("text.discount")}}:</span>
                    <span class="value">- {{payment.discount | decimal}}</span>
                  </div>
                </template>
                <div>
                    <span class="text">{{$t("text.total")}}:</span>
                    <span class="value">{{payment.due | decimal}}</span>
                </div>
            </div>
        </div>
        <div :is="component" :init="componentData" @trigger="update"></div>
    </div>
</template>
<script>
import { mapGetters, mapActions } from "vuex";
import dialoger from "../common/dialoger";
import entry from "../menu/component/entry";
import listItem from "./listItem";
import config from "./config";
export default {
  components: { config, dialoger, listItem, entry },
  props: ["layout", "group", "display", "sort"],
  data() {
    return {
      payment: {
        subtotal: 0,
        tax: 0,
        total: 0, // subtotal + tax + delivery
        discount: 0,
        due: 0, // total - discount
        balance: 0, // due + surcharge
        paid: 0,
        remain: 0, // balance - paid
        change: 0, // depreciate
        tip: 0,
        gratuity: 0,
        delivery: 0,
        surcharge: 0, // tip + gratuity
        log: []
      },
      lastDelta: 0,
      offset: 0,
      todo: false,
      component: null,
      componentData: null,
      spooler: []
    };
  },
  mounted() {
    if (this.$route.name === "Table" && this.order.content.length > 0) {
      this.payment = this.order.payment;
    } else {
      this.calculator(this.order.content);
    }
  },
  methods: {
    resetHighlight() {
      let dom = document.querySelector("li.item.active");
      dom && dom.classList.remove("active");
      dom = document.querySelector(".sub.target");
      dom && dom.classList.remove("target");
      this.resetChoiceSet();
      this.resetPointer();
    },
    openConfig() {
      if (this.component === "config") return;
      if (this.$route.name !== "Menu") return;
      let taxFree = this.order.taxFree || false;
      let deliveryFree = this.order.deliveryFree || false;
      let menuID = this.config.display.menuID;
      let { seatOrder } = this.dinein.seatOrder;
      this.$p("config", { taxFree, deliveryFree, menuID, seatOrder });
    },
    openMarker() {
      if (this.isEmptyTicket) return;
    },
    addToSpooler(item) {
      if (item.print) return;
      for (let i = 0; i < this.spooler.length; i++) {
        if (this.spooler[i].unique === item.unique) {
          item.pending = false;
          this.spooler.splice(i, 1);
          return;
        }
      }
      item.pending = true;
      this.spooler.push(item);
    },
    directPrint() {
      if (this.spooler.length === 0) return;
      let error = false;
      let sendItem = this.spooler.length;
      let order = JSON.parse(JSON.stringify(this.order));
      let items = order.content.map(item => {
        if (item.pending) item.print = true;
        return item;
      });
      let remain = items.filter(item => !item.print).length;
      order.content = this.spooler;
      order.delay = +new Date();
      Printer.setTarget("Order").print(order);
      this.spooler.forEach(item => {
        item.print = true;
      });
      if (remain === 0) {
        Object.assign(this.order, { print: true });
      } else {
        let txt =
          remain > 0
            ? this.$t("dialog.remainPrintItem", remain)
            : this.$t("dialog.noRemainItem");
        this.$dialog({
          type: "info",
          title: "dialog.itemSent",
          msg: ["dialog.printResult", sendItem, txt],
          buttons: [{ text: "button.confirm", fn: "resolve" }]
        }).then(() => {
          this.$q();
        });
      }
      this.spooler = [];
      this.$socket.emit("[UPDATE] INVOICE", this.order);
    },
    move(e) {
      this.offset = this.lastDelta + e.deltaY;
    },
    panStart(e) {
      let dom = document.querySelector(".order .scrollable");
      dom && dom.classList.remove("scrollable");
    },
    panEnd() {
      let dom = document.querySelector(".order .inner");
      dom && dom.classList.add("scrollable");

      let { top, bottom, height } = dom.getBoundingClientRect();
      let offset = this.$route.name === "Menu" ? 55 : 179;
      top -= offset;
      bottom -= offset;
      if (top > 0) {
        this.offset = 0;
      } else if (height < 350) {
        this.offset = 0;
      } else if (height > 350 && bottom < 335) {
        this.offset = -(height - 329);
      }
      this.lastDelta = this.offset;
    },
    separator() {
      if (!this.item) return;
      let dash = {
        zhCN: `----------`,
        usEN: `----------`,
        qty: 1,
        single: 0,
        price: "0.00",
        key: Math.random()
          .toString(36)
          .substr(2, 5)
      };
      this.setChoiceSet(dash);
    },
    openKeyboard() {
      if (this.isEmptyTicket) return;
      this.component === "entry" ? (this.component = null) : this.$p("entry");
    },
    update(config) {
      this.setOrder(config);
      this.calculator(this.order.content);
    },
    openCreditCard() {

    },
    toggleTodoList() {
      this.todo = !this.todo;

      if (!this.todo) {
        this.order.content.forEach(item => (item.pending = false));
      }
    },
    calculator(items) {
      if (items.length === 0) {
        let delivery =
          this.ticket.type === "DELIVERY" &&
            this.store.delivery &&
            !this.order.deliveryFree
            ? parseFloat(this.store.deliveryCharge)
            : 0;

        this.payment = Object.assign(this.order.payment, {
          subtotal: 0,
          tax: 0,
          total: 0, // subtotal + tax + delivery
          discount: 0,
          due: 0, // total - discount
          balance: 0, // due + surcharge
          paid: 0,
          remain: 0, // balance - paid
          change: 0, // depreciate
          tip: 0,
          gratuity: 0,
          delivery,
          surcharge: 0, // tip + gratuity
          log: []
        });
        return;
      }

      const { type, guest, coupons } = this.order;
      const { enable, rules } = this.dinein.surcharge;

      let { tip, gratuity, discount, paid } = this.order.payment;
      let subtotal = 0, tax = 0;

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

        if (!this.order.taxFree && taxClass.apply[type]) {
          tax += taxClass.rate / 100 * amount;
        }
      });

      if (type === "DINE_IN" && enable) {
        //find rule
        const rule = rules.find(condition => guest >= condition.guest);
        const { fee, percentage } = rule;

        gratuity = percentage ? toFixed(subtotal * fee / 100, 2) : fee;
      }


      if (coupons && coupons.length > 0) {
        let offer = 0;
        coupons.forEach(coupon => {
          switch (coupon.type) {
            // 'rebate':        '满减券',
            // 'giveaway':      '礼物券',
            // 'voucher':       '现金券',
            // 'discount':      '折扣券',
            case "rebate":
              offer += coupon.discount;
              break;
            case "giveaway":
              break;
            case "voucher":
              break;
            case "discount":
              break;
          }
        })

        discount += offer;
      }





      let delivery =
        type === "DELIVERY" && this.store.delivery && !this.order.deliveryFree
          ? parseFloat(this.store.deliveryCharge)
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

      let total = parseFloat(subtotal.toFixed(2)) + toFixed(tax, 2) + delivery;
      let due = Math.max(0, total - discount);
      let surcharge = tip + gratuity;
      let balance = due + surcharge;
      let remain = balance - paid;

      this.payment = Object.assign({}, this.payment, {
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
      Object.assign(this.order, { payment: this.payment });
    },
    ...mapActions([
      "setChoiceSet",
      "setPointer",
      "resetPointer",
      "resetChoiceSet",
      "setChoiceSetTarget",
      "setOrder"
    ])
  },
  computed: {
    scroll() {
      return { transform: `translate3d(0,${this.offset}px,0)` };
    },
    undoneItems() {
      return this.order.content.map(i => !i.print).reduce((a, b) => a + b, 0);
    },
    ...mapGetters([
      "app",
      "tax",
      "store",
      "config",
      "dinein",
      "item",
      "order",
      "ticket",
      "language",
      "isEmptyTicket"
    ])
  },
  watch: {
    "order.content": {
      handler(items) {
        this.display
          ? (this.payment = this.order.payment)
          : this.calculator(items);
      },
      deep: true
    },
    payment() {
      this.$nextTick(() => {
        let dom = document.querySelector(".order .inner");
        let { height } = dom.getBoundingClientRect();
        height > 329 && dom.classList.add("scrollable");
        let target = document.querySelector(".item.active");
        if (this.todo) return;
        if (target && height > 329) {
          this.offset -= target.getBoundingClientRect().height;
        } else {
          this.offset = height > 329 ? 329 - height : 0;
        }
      });
    }
  }
};
</script>

<style scoped>
header.simple {
  display: flex;
  flex-direction: row;
  height: 25px;
  line-height: 25px;
  border-bottom: 1px solid #ccc;
  background: #fafafa;
  color: #333;
}

header.info {
  background: #f5f5f5;
  color: #555;
  position: relative;
  height: 93px;
}

.number {
  font-family: "Agency FB";
  width: 30px;
  text-align: center;
  font-weight: bold;
  font-size: 22px;
  margin: 0 5px;
}

header i {
  margin-right: 5px;
}

.bar {
  height: 26px;
  background: #03a9f4;
  display: flex;
  align-items: center;
  color: #fff;
  position: relative;
  text-shadow: 0 1px 1px #333;
  box-shadow: inset 0px -1px 3px -1px rgb(17, 116, 160);
}

.table {
  padding: 0 10px;
}

.simple .qty {
  width: 40px;
  text-align: center;
}

.simple .item {
  flex: 1;
}

.simple .price {
  width: 45px;
  text-align: center;
}

.order {
  height: 329px;
  width: 285px;
  background: hsla(0, 9%, 66%, 0.15);
  overflow: hidden;
}

.scrollable {
  transition: transform 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.mark {
  position: absolute;
  width: 100%;
  top: -9px;
  font-size: 10px;
  left: 0;
  height: 10px;
  line-height: 10px;
  text-align: center;
  font-weight: 700;
  color: #ff5722;
  white-space: nowrap;
}

.list .price {
  min-width: 45px;
  text-align: right;
  padding-right: 10px;
  vertical-align: top;
  font-size: initial;
}

.middle {
  display: flex;
  margin-top: 1px;
}

.fnWrap {
  width: 127px;
  padding-left: 3px;
}

.fn {
  background: linear-gradient(#fefefe, #cfd0d3);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.7);
  text-shadow: 0 1px 1px #fff;
  width: 60px;
  height: 53px;
  text-align: center;
  padding: 16px 0;
  border-radius: 4px;
  border: none;
  font-family: fontAwesome;
  font-size: 18px;
  outline: none;
}

.fn:nth-child(n + 3) {
  margin-top: 4px;
}

.fn:active {
  background: linear-gradient(#e2e3e4, #aaadb4);
  color: #333;
}

.settle {
  width: 155px;
}

.settle div {
  border-bottom: 1px solid #eee;
  background: #fff;
  padding: 1px;
  display: flex;
}

.settle .text {
  width: 70px;
}

.settle .value {
  flex: 1;
  padding-right: 5px;
  overflow: hidden;
  vertical-align: text-top;
  text-overflow: ellipsis;
}

.settle .text,
.settle .value {
  text-align: right;
}

.settle div:last-child {
  font-weight: 700;
  font-size: larger;
  padding: 2.5px 0;
}

.timePass {
  position: absolute;
  right: 5px;
  text-align: center;
  font-size: 12px;
}

.print .itemWrap {
  width: 200px;
}

.list.print.pending {
  background: #eceff1;
}

.list i {
  display: none;
  padding-right: 25px;
}

.showCategory .item {
  position: relative;
}

.showCategory .item:before {
  content: attr(data-category);
  position: absolute;
  top: 0px;
  right: 0px;
  font-size: 9px;
  font-family: "Microsoft YaHei";
  background: #009688;
  color: #fff;
  padding: 0 5px;
  -webkit-font-smoothing: antialiased;
  font-weight: lighter;
}

.driver {
  width: 275px;
  margin: 5px;
  height: 40px;
  font-size: initial;
}

.content > div {
  display: flex;
}

.content .time {
  position: absolute;
  right: 5px;
  color: #607d8b;
  font-family: "Agency FB";
  font-weight: bold;
}

.content .corner {
  position: absolute;
  right: 5px;
  bottom: 2px;
  color: #e06d40;
  font-size: 14px;
  font-style: italic;
  font-weight: bold;
}

.content .text {
  min-width: 65px;
  text-align: right;
  padding-right: 10px;
  color: #607d8b;
}

.content {
  padding: 3px;
}

.content .value {
  color: #676767;
}

.hidden span {
  visibility: hidden;
}

.provider {
  margin-left: 10px;
}
</style>
