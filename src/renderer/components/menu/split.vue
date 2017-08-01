<template>
  <div class="popupMask center dark" @click.self="init.reject">
    <div class="window" v-show="!component">
      <header class="title">
        <span>{{text('ORDER_SPLIT')}}</span>
        <i class="fa fa-times" @click="cancel"></i>
      </header>
      <section>
        <split-list :order="order" @queue="setQueue" v-show="remain !==0"></split-list>
        <div class="wrap">
          <div class="inner">
            <i class="fa fa-3x fa-angle-left page" @click="page = page===(split-1) ? page : page+1" v-show="split > 2"></i>
            <div class="extend" :style="offset">
              <split-list :order="order" :done="lock" v-for="i in split" :split="i" :key="i" @queue="setQueue" @click.native="trigger(i)" @print="printInvoice" @pay="settle"></split-list>
            </div>
            <i class="fa fa-3x fa-angle-right page" @click="page = page===0 ? 0 : page-1" v-show="split > 2"></i>
          </div>
          <div class="spliter" @click="addSplit"></div>
        </div>
      </section>
      <footer>
        <div class="f1">
          <div class="btn confirm" @click="confirm($event)">{{text('PAYMENT')}}</div>
          <div class="btn" @click="printAll">{{text('PRINT_ALL')}}</div>
          <div class="btn" @click="evenly">{{text('EVEN_SPLIT')}}</div>
        </div>
        <div class="btn" @click="sort(1)">{{text('SORT')}}</div>
        <div class="btn" @click="save">{{text('SAVE')}}</div>
      </footer>
    </div>
    <div :is="component" :init="componentData"></div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import splitList from './splitList'
import Printer from '../../print'
import payment from '../payment/payment'
import dialoger from '../common/dialoger'
export default {
  components: { splitList, payment, dialoger },
  props: ['init'],
  created() {
    this.order = this.flatten(this.init.order.content);
    this.split = this.check(this.order);
  },
  data() {
    return {
      page: 0,
      split: 0,
      order: [],
      lock: false,
      origin: null,
      component: null,
      componentData: null,
      transferItems: [],
      splitPayment: {}
    }
  },
  methods: {
    flatten(list) {
      let flatten = [];
      for (let i = 0; i < list.length; i++) {
        let qty = list[i].qty;
        let sort = list[i].sort || 0;
        while (qty > 0) {
          let clone = Object.assign({}, list[i], {
            qty: 1,
            sort,
            total: (list[i].single).toFixed(2),
            unique: Math.random().toString(36).substr(2, 5)
          });
          flatten.push(clone);
          qty--;
        }
      }
      return flatten;
    },
    check(list) {
      return list.map(item => item.sort).filter((v, i, s) => s.indexOf(v) === i).length
    },
    addSplit() {
      this.transferItems.length ?
        this.transfer(++this.split) :
        this.split++;
    },
    trigger(i) {
      this.transferItems.length && this.transfer(i);
    },
    setQueue(transfer) {
      if (transfer.items.length === 0) return;
      this.origin = transfer.origin;
      this.transferItems = transfer.items;
    },
    sort(index) {
      let unique = this.order.map(item => item.sort).filter((v, i, s) => s.indexOf(v) === i);
      let max = Math.max(...unique);
      if (!unique.includes(index)) {
        let origin = unique[index - 1];
        this.order = this.order.map(item => {
          item.sort = item.sort === origin ? index : item.sort;
          return item
        })
      }
      ++index <= max ?
        this.sort(index) :
        (this.split = this.order.map(item => item.sort).filter((v, i, s) => s.indexOf(v) === i).length);
    },
    evenly() {
      this.split !== 0 && this.transfer([], true);
    },
    transfer(index, even) {
      let doms = document.querySelectorAll(`.split .active`);
      doms.forEach(dom => {
        dom && dom.classList.remove("active");
      });
      if (even) {
        for (let i = 1; i < this.split + 1; i++) {
          index.push(i);
        }
      }
      this.order.forEach(item => {
        if (this.transferItems.includes(item.unique)) {
          item.sort = index;
          if (even) {
            if (item.total.includes("/")) return;
            item.single = parseFloat((item.single / index.length).toFixed(2));
            item.total = item.total + "/" + index.length;
          } else if (item.total.includes("/")) {
            let split = item.total.split("/")[1];
            item.single = parseFloat((item.single * split).toFixed(2));
            item.total = item.single.toFixed(2);
          }
        }
      });
      this.transferItems = [];
      this.$bus.emit("SPLIT_ORDER");
    },
    printInvoice(index) {
      this.print(index);
      this.order.forEach(item => item.print = true);
    },
    printAll() {
      this.sort(1);
      for (let i = 1; i < this.split + 1; i++) {
        this.print(i);
      }
      this.order.forEach(item => item.print = true);
      this.gatherPayments() && this.init.resolve(this.order)
    },
    print(i) {
      let content = this.order.filter(item => item.sort === i);
      let order = Object.assign({}, this.init.order);
      !order._id && Object.assign(order, {
        number: this.ticket.number + "-" + i,
        type: this.ticket.type
      })
      order.content = content;
      order.payment = this.splitPayment[i] || this.$children[i].payment;
      Printer.init(this.config).setJob('receipt').print(order)
    },
    cancel() {
      this.init.reject();
    },
    save() {
      this.sort(1);
      this.gatherPayments() && this.init.resolve(this.order);
    },
    settle(order) {
      let { split, payment } = order;
      this.poleDisplay("TOTAL DUE:", ["", parseFloat(payment.due).toFixed(2)]);
      new Promise((resolve, reject) => {
        this.componentData = { payment, resolve, reject };
        this.component = "payment";
      }).then(result => {
        this.$q();
        this.splitPayment[split] = result.payment;
        this.$bus.emit("SPLIT_PAID", split);
        result.print && this.print(split);
      }).catch(() => {
        delete payment.due;
        payment.log = [];
        this.$q();
      })
    },
    gatherPayments() {
      this.setOrder({ splitPayment: this.splitPayment });
      let payment = {
        tip: 0,
        gratuity: 0,
        discount: 0,
        delivery: 0,
        subtotal: 0,
        tax: 0,
        total: 0,
        due: 0,
        log: []
      };
      Object.keys(this.splitPayment).forEach(trans => {
        let split = this.splitPayment[trans];
        payment.tip += parseFloat(split.tip);
        payment.gratuity += parseFloat(split.gratuity);
        payment.discount += parseFloat(split.discount);
        payment.delivery += parseFloat(split.delivery);
        payment.subtotal += parseFloat(split.subtotal);
        payment.total += parseFloat(split.total);
        payment.due += parseFloat(split.due);
        payment.paid += parseFloat(split.paid);
        payment.log.push(...split.payment.log);
      })
      this.setOrder({ payment });
      return true
    },
    poleDisplay(line1, line2) {
      if (!this.device.poleDisplay) return;
      poleDisplay.write('\f');
      poleDisplay.write(line(line1, line2));
    },
    confirm(e) {
      this.sort(1);
      this.lock ?
        e.currentTarget.classList.remove("active") :
        e.currentTarget.classList.add("active");
      this.lock = !this.lock;
    },
    ...mapActions(['setOrder'])
  },
  computed: {
    offset() {
      let width = this.split * 250;
      let offset = this.page * 250;
      return { transform: `translate3d(${offset}px,0,0)` }
    },
    remain() {
      return this.order.filter(item => item.sort === 0).length
    },
    ...mapGetters(['op', 'config', 'store', 'device', 'ticket'])
  }
}
</script>

<style scoped>
.window {
  width: 1000px;
  background: url(../../assets/image/grid.png) #fcfcfc;
}

.title {
  padding: 15px;
}

.title i {
  padding: 15px 20px;
}

section {
  display: flex;
  flex-direction: row-reverse;
  min-height: 410px;
}

.wrap {
  display: flex;
  flex: 1;
  justify-content: flex-start;
  overflow: auto;
}

i.page {
  position: absolute;
  top: 180px;
  color: #37474F;
  text-align: center;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 3px 5px rgba(0, 0, 0, 0.4);
  cursor: pointer;
  z-index: 1;
}

i.page:active {
  background: #eee;
}

.fa-angle-left {
  left: 10px;
  padding: 0px 17px 0 16px;
}

.fa-angle-right {
  right: 10px;
  padding: 0px 15px 0 17px;
}

.inner {
  flex: 1;
  overflow: hidden;
  display: flex;
  justify-content: flex-end;
  position: relative;
}

.extend {
  display: flex;
  justify-content: flex-start;
  flex-wrap: nowrap;
  transition: transform 0.22s linear;
}

.spliter {
  width: 150px;
  height: inherit;
  background: #fff;
  border: 2px dashed #ddd;
  border-radius: 4px;
  margin: 5px;
  position: relative;
}

.spliter:before {
  font-family: fontAwesome;
  content: '\F067';
  position: absolute;
  top: calc(50% - 40px);
  left: 0;
  right: 0;
  margin: auto;
  width: 63px;
  display: block;
  font-size: 5em;
  color: gray;
}

.btn {
  margin: 5px;
  flex: 1;
  max-width: 100px;
}

.confirm.active {
  background: linear-gradient(#ddd, #f5f5f5);
  color: #666;
}
</style>
