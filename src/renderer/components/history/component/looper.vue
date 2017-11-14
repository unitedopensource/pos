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
                    <li v-for="(record,index) in transactions" :key="index" @click="setTarget(record,index,$event)" :data-trans="record.trace.trans">
                        <i class="fa fa-check-circle-o gray" v-if="record.status === 1"></i>
                        <i class="fa fa-check-circle green" v-else></i>
                        <span>#{{record.trace.trans}}</span>
                        <span class="account">{{record.account.number}}</span>
                        <span class="amount">$ {{record.amount.approve}}</span>
                        <span class="card">{{record.account.type}}</span>
                    </li>
                </v-touch>
              </section>
            <div class="wrap">
                <div class="header">
                  <h3 v-if="transaction && transaction.order">#{{transaction.order.number}} {{$t('type.'+transaction.order.type)}}</h3>
                  <h3 v-else></h3>
                  <h5 v-if="transaction">{{$t('text.authCode')}}: {{transaction.host.auth}}</h5>
                </div>
                <div class="input">
                    <span class="was" v-if="transaction">{{transaction.amount.tip}}</span>
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
                    <checkbox v-model="done" label="text.readyBatch"></checkbox>
                </div>
                <div class="btn" @click="init.reject" v-if="!done">{{$t('button.done')}}</div>
                <div class="btn" @click="batch" v-else>{{$t('button.batch')}}</div>
            </footer>
        </div>
        <div :is="component" :init="componentData"></div>
    </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import dialoger from "../../common/dialoger";
import checkbox from "../../setting/common/checkbox";
import processor from "../../common/processor";
export default {
  props: ["init"],
  components: { checkbox, dialoger, processor },
  computed: {
    scroll() {
      return { transform: `translate3d(0,${this.offset}px,0)` };
    }
  },
  data() {
    return {
      componentData: null,
      component: null,
      transactions: [],
      transaction: null,
      done: false,
      offset: 0,
      tip: "0.00",
      index: 0,
      lastDelta: 0,
      reset: true
    };
  },
  created() {
    this.transactions = this.init.transaction.filter(
      t => t.status !== 0 && !t.close
    );

    if (this.transactions.length !== 0) {
      let index = this.transactions.findIndex(t => t.status === 1);
      if (index !== -1) {
        this.index = index - 1;
        this.next();
      }
    }
  },
  mounted() {
    window.addEventListener("keydown", this.entry, false);
  },
  beforeDestroy() {
    window.removeEventListener("keydown", this.entry, false);
  },
  methods: {
    setTarget(record, index, e) {
      this.transaction = record;
      this.tip = "0.00";
      this.reset = true;
      this.index = index;

      let dom = document.querySelector("ul.orders .active");
      dom && dom.classList.remove("active");

      e.currentTarget.classList.add("active");
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
        this.offset = -(height - 504);
      }
      this.lastDelta = this.offset;
    },
    entry(e) {
      e.preventDefault();
      switch (e.key) {
        case "Enter":
          this.enter();
          break;
        case "Backspace":
          this.tip = this.tip.slice(0, -1);
          break;
        case "Escape":
        case "-":
          this.clear();
          break;
        case "+":
          this.prev();
          break;
        case "ArrowUp":
          this.clear();
          this.prev();
          break;
        case "ArrowDown":
          this.clear();
          this.next();
          break;
        default:
          if (e.key.length === 1 && /[0-9.]/i.test(e.key)) {
            this.tip = this.reset ? e.key : this.tip + e.key;
            this.reset = false;
          }
      }
    },
    input(val) {
      if (this.reset) {
        this.tip = (val / 100).toFixed(2);
      } else {
        let value = (this.tip * 100).toFixed(0) + val;
        this.tip = (value / 100).toFixed(2);
      }
      this.reset = false;
    },
    del() {
      this.tip = (this.tip.slice(0, -1) / 10).toFixed(2);
    },
    enter() {
      if (!isNumber(this.tip)) return;

      if (parseFloat(this.tip) > 0) {
        console.log("trigger")
        let record = this.transaction;
        this.$p("processor", { timeout: 30000 });
        let amount = Math.round(this.tip * 100);
        let invoice = record.order.number;
        let trans = record.trace.trans;
        this.init.terminal
          .adjust(invoice, trans, amount)
          .then(r => r.text())
          .then(response => {
            this.$q();
            let result = this.init.terminal.explainTransaction(response);
            if (result.code === "000000") {
              Object.assign(record, {
                amount: result.amount,
                status: 2
              });
              this.$socket.emit("[TERM] ADJUST_TRANSACTION", record);
              this.next();
            } else {
              this.$dialog({
                type: "error",
                title: "dialog.tipAdjustDenied",
                msg: ["dialog.tipAdjustDeniedTip", code],
                buttons: [{ text: "button.confirm", fn: "resolve" }]
              }).then(() => {
                this.$q();
              });
            }
          });
      } else {
        this.next();
      }
    },
    clear() {
      this.tip = "0.00";
      this.reset = true;
    },
    prev() {
      let next = this.transactions[this.index - 1];

      if (next) {
        this.index--;
        this.transaction = next;

        this.$nextTick(() => {
          let dom = document.querySelector("ul.orders .active");
          let { top, height } = dom.getBoundingClientRect();

          if (top > 560.5) {
            this.offset = -height;
          }
        });
        this.clear();
      }
    },
    next() {
      let next = this.transactions[this.index + 1];

      if (next) {
        this.index ++;
        this.transaction = next;

        this.$nextTick(() => {
          let dom = document.querySelector("ul.orders .active");
          let { top, height } = dom.getBoundingClientRect();

          if (top > 560.5) {
            this.offset = -height;
          }
        });
        this.reset = true;
      }
    },
    batch() {
      this.init.resolve();
    }
  },
  watch: {
    transaction(n) {
      let dom = document.querySelector("ul.orders .active");
      dom && dom.classList.remove("active");

      document
        .querySelector(`[data-trans="${n.trace.trans}"]`)
        .classList.add("active");
    }
  }
};
</script>

<style scoped>
.inner {
  display: flex;
  width: 739px;
}

section.outer {
  height: 506px;
  overflow: hidden;
}

ul.orders {
  width: 320px;
  margin-right: 2px;
}

.wrap {
  flex: 1;
}

h5 {
  color: #3c3c3c;
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
  color: #3c3c3c;
}

.wrap .pad {
  display: flex;
}

.numpad {
  display: flex;
  flex-wrap: wrap;
}

.header {
  height: 88px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.orders li {
  display: flex;
  padding: 5px;
  align-items: center;
  color: #3c3c3c;
  border-bottom: 1px solid #eeeeee;
  height: 45px;
  background: #fff;
  position: relative;
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

.card {
  position: absolute;
  bottom: 0;
  right: 2px;
  font-weight: bold;
  font-family: "Agency FB";
  color: #3c3c3c;
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

.active * {
  color: #fff !important;
}

.gray {
  color: rgba(0, 0, 0, 0.4);
}

.green {
  color: #009688;
}

span.account {
  flex: 1;
  text-indent: 1em;
}

li i {
  margin: 0 10px;
}

span.amount {
  font-family: "Agency FB";
  font-weight: bold;
  width: 60px;
  font-size: 22px;
  text-align: center;
  color: #009688;
}

.input {
  position: relative;
}

.was {
  position: absolute;
  padding: 10px;
  font-family: "Agency FB";
  font-weight: bold;
  font-size: 35px;
  color: #ff9800;
}

.scrollable {
  transition: transform 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
</style>