<template>
    <div class="popupMask center dark">
        <div class="driver window">
            <header class="title">
                <span>{{$t('title.setTips')}}</span>
                <i class="fa fa-times" @click="init.reject"></i>
            </header>
            <div class="inner">
              <section class="outer">
                <v-touch tag="ul" class="orders" :style="scroll" @panup="move" @pandown="move" @panstart="panStart" @panend="panEnd">
                    <li v-for="(transaction,index) in init.transaction" :key="index">
                        <span>#{{transaction.trace.trans}}</span>
                        <span>{{$t('type.'+transaction.order.type)}}</span>
                        <span class="ticket">(#{{transaction.order.number}})</span>
                        <span>{{transaction.account.number}}</span>
                        <span>{{transaction.host.auth}}</span>
                        <span></span>
                    </li>
                </v-touch>
              </section>
            <div class="wrap">
                <div class="input">
                    <input type="text" v-model="tip">
                </div>
                <div class="pad">
                <section class="numpad">
                    <div @click="input('7')">7</div>
                    <div @click="input('8')">8</div>
                    <div @click="input('9')">9</div>
                    <div @click="input('4')">4</div>
                    <div @click="input('5')">5</div>
                    <div @click="input('6')">6</div>
                    <div @click="input('1')">1</div>
                    <div @click="input('2')">2</div>
                    <div @click="input('3')">3</div>
                    <div @click="input('0')">0</div>
                    <div @click="input('00')" class="double">00</div>
                </section>
                <aside class="numpad">
                    <div @click="del">&#8592;</div>
                    <div @click="clear">C</div>
                    <div @click="enter">&#8626;</div>
                </aside>
                </div>

            </div>
            </div>
            <footer>
                <div class="f1">
                    <checkbox v-model="finish" label="text.doneTipEnter"></checkbox>
                </div>
                <div class="btn" @click="done">{{$t('button.done')}}</div>
            </footer>
        </div>
        <div :is="component" :init="componentData"></div>
    </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import checkbox from "../../setting/common/checkbox";
export default {
  props: ["init"],
  components: { checkbox },
  computed: {
    scroll() {
      return { transform: `translate3d(0,${this.offset}px,0)` };
    }
  },
  data() {
    return {
      target: null,
      letter: null,
      orders: null,
      order: null,
      finish: false,
      offset: 0,
      tip: 0,
      lastDelta: 0,
      component: null,
      componentData: null
    };
  },
  created() {},
  methods: {
    setTarget(order, e) {
      let { number, driver } = order;

      let dom = document.querySelector("ul.orders .active");
      dom && dom.classList.remove("active");

      e.currentTarget.classList.add("active");
      this.order = order;
    },
    move(e) {
      this.offset = this.lastDelta + e.deltaY;
    },
    panStart() {
      let dom = document.querySelector(".orders.scrollable");
      dom && dom.classList.remove("scrollable");
    },
    panEnd(e) {
      let dom = document.querySelector("ul.orders");
      dom && dom.classList.add("scrollable");

      let { top, bottom, height } = dom.getBoundingClientRect();
      let offset = this.$route.name === "Menu" ? 55 : 179;
      top -= offset;
      bottom -= offset;
      if (top > 0) {
        this.offset = 0;
      } else if (height < 322) {
        this.offset = 0;
      } else if (height > 322 && bottom < 440) {
        this.offset = -(height - 448);
      }
      this.lastDelta = this.offset;
    },
    input() {},
    del() {},
    enter() {},
    clear() {},
    setDriver(letter) {
      if (!this.order) return;

      Object.assign(this.order, { driver: letter });
      this.$socket.emit("[UPDATE] INVOICE", this.order, false);

      this.loop && this.next();
    },
    setTip() {
      new Promise((resolve, reject) => {
        this.componentData = { resolve, reject, payment: this.order.payment };
        this.component = "tips";
      })
        .then(value => {
          let { tip } = value;

          this.order.payment.tip = tip;
          this.order.payment.surcharge = toFixed(
            this.order.payment.gratuity + tip,
            2
          );

          this.order.payment.balance = toFixed(
            this.order.payment.total -
              this.order.payment.discount +
              this.order.payment.surcharge,
            2
          );

          this.order.payment.remain = toFixed(
            this.order.payment.balance - this.order.payment.paid,
            2
          );

          this.$socket.emit("[UPDATE] INVOICE", this.order, false);
          this.$q();
        })
        .catch(() => {
          this.$q();
        });
    },
    next(number) {
      if (number) {
        this.order = this.orders.find(ticket => ticket.number === number);
      } else {
        let next = this.orders.find(ticket => !ticket.driver);

        if (next) {
          this.order = next;

          this.$nextTick(() => {
            let dom = document.querySelector("ul.orders .active");
            let { top, height } = dom.getBoundingClientRect();

            if (top > 560.5) {
              this.offset = -height;
            }
          });
        }
      }
    },
    done() {
      this.finish ? this.init.resolve() : this.init.reject();
    }
  },
  watch: {
    order(n) {
      let dom = document.querySelector("ul.letters .active");
      dom && dom.classList.remove("active");
      dom = document.querySelector("ul.orders .active");
      dom && dom.classList.remove("active");

      document
        .querySelector(`[data-ticket="${n.number}"]`)
        .classList.add("active");

      if (n.driver) {
        document
          .querySelector(`[data-letter="${n.driver.toUpperCase()}"]`)
          .classList.add("active");
      }
    }
  }
};
</script>

<style scoped>
.inner {
  display: flex;
  width: 739px;
}

ul.letters {
  display: flex;
  flex-wrap: wrap;
  flex: 1;
}

.letters li {
  width: 70px;
  height: 60px;
  border: 1px solid #cfd8dc;
  background: #fff;
  margin: 1px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
}

.letters .active {
  background: #009688;
  color: #fff;
}

section.outer {
  height: 448px;
  overflow: hidden;
}

ul.orders {
  width: 320px;
  margin-right: 2px;
}

.wrap {
  flex: 1;
}

.input input {
  border: none;
  font-family: "Agency FB";
  font-weight: bold;
  text-align: right;
  width: 395px;
  padding: 10px;
  font-size: 35px;
  outline: none;
}

.wrap .pad {
  display: flex;
}

.numpad {
  display: flex;
  flex-wrap: wrap;
}

span.address {
  color: #009688;
}

.orders li {
  display: flex;
  padding: 5px;
  align-items: center;
  color: #3c3c3c;
  border-bottom: 1px solid #eeeeee;
  height: 45px;
  background: #fff;
}

.orders .number {
  width: 35px;
  text-align: center;
  font-family: "Agency FB";
  font-weight: bold;
  font-size: 20px;
  margin-right: 5px;
}
.orders .info {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.orders .prices {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.orders .total {
  min-width: 50px;
  text-align: center;
}
.orders .tip {
  color: lightgray;
  font-size: 14px;
}

.f1 {
  display: flex;
  align-items: center;
}

li.clear {
  width: 144px;
  background: #ff5722;
  color: #fff;
}

.orders .active {
  background: #009688;
  color: #fff;
  text-shadow: 0 1px 1px #333;
}

.orders .active .address {
  color: #fff;
}

span.driver {
  width: 24px;
  height: 24px;
  text-indent: 2px;
  border: 2px solid #00897b;
  text-align: center;
  line-height: 24px;
  background: #fafafa;
  border-radius: 50%;
  color: #009688;
  text-shadow: 0 1px 1px #607d8b;
}

.scrollable {
  transition: transform 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
</style>