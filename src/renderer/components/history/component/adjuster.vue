<template>
  <div class="popupMask dark center">
    <div class="editor">
      <header>
        <div class="title">
          <h3>{{$t('title.setTips')}}</h3>
          <h5>{{$t('tip.foundRecords',transactions.length)}}</h5>
        </div>
        <nav>

        </nav>
      </header>
      <div class="wrap">
        <section class="list">
          <v-touch tag="ul" :style="scroll" @panup="move" @pandown="move" @panstart="panStart" @panend="panEnd" class="records">
            <li v-for="(record,idx) in transactions" :key="idx" @click.prevent.stop="index = record.index" :data-index="record.index">
              <div class="inner">
                <i class="fa fa-check-circle-o gray" v-if="record.status === 1"></i>
                <i class="fa fa-check-circle green" v-else></i>
                <div class="index">
                  <span class="sharp">#</span>{{record.index}}</div>
                <span class="account">...{{record.account.number}}</span>
                <span class="amount">$ {{record.amount.approve}}</span>
                <span class="card">{{record.account.type}}</span>
              </div>
            </li>
          </v-touch>
        </section>
        <section class="entryWrap">
          <div class="header">
            <h3 v-if="transaction && transaction.order">
              <span class="index">
                <span class="sharp">#</span>{{transaction.order.number}}</span>
              <span>{{$t('type.'+ transaction.order.type)}}</span>
            </h3>
            <h3 v-else></h3>
            <p>
              <span>{{$t('text.authCode')}}</span>
              <span class="auth" v-if="transaction">{{transaction.host.auth}}</span>
            </p>
          </div>
          <div class="inner">
            <input type="text" v-model="tip" :placeholder="placeholder">
          </div>
          <div class="pad">
            <section class="numpad">
              <div @click="input('7')" class="numKey">7</div>
              <div @click="input('8')" class="numKey">8</div>
              <div @click="input('9')" class="numKey">9</div>
              <div @click="input('4')" class="numKey">4</div>
              <div @click="input('5')" class="numKey">5</div>
              <div @click="input('6')" class="numKey">6</div>
              <div @click="input('1')" class="numKey">1</div>
              <div @click="input('2')" class="numKey">2</div>
              <div @click="input('3')" class="numKey">3</div>
              <div @click="input('0')" class="numKey">0</div>
              <div @click="input('00')" class="double numKey">00</div>
            </section>
            <aside class="padCtrl">
              <div @click="del">&#8592;</div>
              <div @click="clear">C</div>
              <div @click="enter">&#8626;</div>
            </aside>
          </div>
        </section>
      </div>
      <footer>
        <div class="opt">
          <checkbox v-model="batch" label="text.readyBatch"></checkbox>
        </div>
        <button class="btn" v-if="batch" @click="init.resolve">{{$t('button.batch')}}</button>
        <button class="btn" v-else @click="init.reject(false)">{{$t('button.done')}}</button>
      </footer>
    </div>
    <div :is="component" :init="componentData"></div>
  </div>
</template>

<script>
import dialoger from "../../common/dialoger";
import processor from "../../common/processor";
import checkbox from "../../setting/common/checkbox";

export default {
  props: ["init"],
  components: { dialoger, checkbox, processor },
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
      placeholder: "0.00",
      lastDelta: 0,
      batch: false,
      terminal: null,
      device: null,
      tip: "",
      offset: 0,
      reset: true,
      index: 0
    };
  },
  created() {
    this.transactions = this.init.transactions.filter(
      t => t.status !== 0 && !t.close
    );
    const next = this.transactions.find(t => t.status !== 2);
    this.index = next ? next.index : 0;
  },
  mounted() {
    window.addEventListener("keydown", this.entry, false);
  },
  beforeDestroy() {
    window.removeEventListener("keydown", this.entry, false);
  },
  methods: {
    entry(e) {
      switch (e.key) {
        case "Enter":
          this.enter();
          break;
        case "ArrowUp":
          this.index = this.transactions.some(t => t.index === this.index - 1)
            ? this.index - 1
            : this.index;
          break;
        case "ArrowDown":
          this.index = this.transactions.some(t => t.index === this.index + 1)
            ? this.index + 1
            : this.index;
          break;
      }
    },
    setIndex(record, index) {
      this.index = index;
    },
    move(e) {
      this.offset = this.lastDelta + e.deltaY;
    },
    panStart() {
      let dom = document.querySelector(".records.scrollable");
      dom && dom.classList.remove("scrollable");
    },
    panEnd(e) {
      let dom = document.querySelector("ul.records");
      dom && dom.classList.add("scrollable");

      const { top, bottom, height } = dom.getBoundingClientRect();

      console.log(top, bottom);
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
    clear() {
      this.tip = "";
      this.reset = true;
    },
    enter() {
      if (!this.transaction || isNaN(this.tip)) return;

      if (this.transaction.amount.tip === this.tip || !this.tip) {
        this.next();
      } else {
        let record = this.transaction;
        this.$p("processor", { timeout: 15000 });
        this.initialParser(this.transaction.terminal)
          .then(this.executeTipAdjustment)
          .catch(this.executeFailed);
      }
    },
    initialParser(terminal) {
      return new Promise((resolve, reject) => {
        let alias = this.$store.getters.station.alias;
        let config = this.init.devices.find(d => d.alias === terminal);
        if (config) {
          const { ip, port, sn, model } = config;
          this.terminal = this.getParser(model)();
          this.terminal
            .initial(ip, port, sn, alias, terminal)
            .then(response => {
              this.device = this.terminal.check(response.data);
              this.device.code === "000000" ? resolve() : reject();
            });
        } else {
          reject();
        }
      });
    },
    executeTipAdjustment() {
      let record = this.transaction;
      const amount = Math.round(this.tip * 100);
      const invoice = record.order.number;
      const transaction = record.trace.trans;
      this.terminal.adjust(invoice, transaction, amount).then(response => {
        this.$q();
        const result = this.terminal.explainTransaction(response.data);
        if (result.code === "000000") {
          Object.assign(record, {
            amount: result.amount,
            status: 2
          });
          this.$socket.emit("[TERMINAL] ADJUST", record);
          this.next();
        } else {
          let data = {
            type: "error",
            title: "dialog.tipAdjustDenied",
            msg: ["dialog.tipAdjustDeniedTip", result.code],
            buttons: [{ text: "button.confirm", fn: "resolve" }]
          };

          this.$dialog(data).then(() => this.$q());
        }
      });
    },
    executeFailed(e) {
      console.log(e);
    },
    next() {
      this.index = this.transactions.some(t => t.index === this.index + 1)
        ? this.index + 1
        : this.index;
    },
    getParser(model) {
      switch (model) {
        case "SP30":
        case "S80":
        case "S300":
          return require("../../payment/parser/pax.js");
        case "NX2200":
          return require("../../payment/parser/exadigm.js");
        default:
          return require("../../payment/parser/pax.js");
      }
    }
  },
  watch: {
    index(n) {
      let dom = document.querySelector("ul.records .active");
      dom && dom.classList.remove("active");

      document.querySelector(`[data-index="${n}"]`).classList.add("active");
      this.transaction = this.transactions.find(t => t.index === n);
      this.placeholder = this.transaction.amount.tip;
      this.reset = true;
      this.tip = "";
    }
  }
};
</script>

<style scoped>
.editor {
  width: 800px;
}

.editor > .wrap {
  display: flex;
  padding: 10px;
}

.scrollable {
  transition: transform 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

li {
  display: flex;
  padding: 8px 11px;
  background: #fff;
  position: relative;
  color: #3c3c3c;
  border: 2px solid transparent;
}

li.active {
  border: 2px solid #009688;
  background: #e0f2f1;
}

li .inner {
  display: flex;
  justify-content: center;
  align-items: center;
}

li .inner .index {
  font-family: "Agency FB";
  font-weight: bold;
  font-size: 22px;
}

.index .sharp {
  font-size: 0.8em;
  color: #666;
  margin-right: 3px;
}

.inner i {
  margin-right: 15px;
}

li:nth-child(even) {
  background: #eee;
}

section.entryWrap {
  display: flex;
  flex-direction: column;
  padding-left: 15px;
  border-left: 1px solid #fff;
}

.pad {
  display: flex;
}

section.numpad {
  display: flex;
  flex-wrap: wrap;
  width: 315px;
}

section.list {
  flex: 1;
  border-right: 1px solid #ddd;
  padding-right: 15px;
  height: 476px;
  overflow: hidden;
}

.entryWrap .header {
  text-align: center;
  padding: 5px 0 15px;
  height: 44px;
}

.entryWrap .inner {
  position: relative;
  margin-bottom: 5px;
}

.entryWrap input {
  border: none;
  width: calc(100% - 22px);
  font-size: 34px;
  text-align: right;
  padding: 5px 10px;
  font-weight: bold;
  font-family: "Agency FB";
  outline: none;
  border-radius: 4px;
  color: #3c3c3c;
  box-shadow: inset 0 1px 6px -1px rgba(0, 0, 0, 0.4);
}

.gray {
  color: var(--gray);
}

.green {
  color: var(--green);
}

.auth {
  font-weight: bold;
  padding: 2px 5px;
  background: #ff5722;
  color: #fff;
  text-shadow: 0 1px 1px #333;
  border-radius: 4px;
  margin: 0 5px;
}

p {
  margin-top: 5px;
}

.card {
  position: absolute;
  right: 2px;
  bottom: 0;
  font-family: fantasy;
  opacity: 0.75;
  text-shadow: 0 1px 1px #fff;
  color: #1b0f31;
}

.amount {
  position: absolute;
  right: 40px;
  font-family: "Agency FB";
  font-weight: bold;
  font-size: 24px;
}
</style>