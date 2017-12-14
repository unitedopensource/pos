<template>
    <div class="popupMask center dark">
        <div class="terminal" v-show="!component">
            <header>
                <div class="title">
                    <h3>{{$t('title.terminalRecords')}}</h3>
                    <h5>{{$t('tip.foundRecords',filteredTransactions.length)}}</h5>
                </div>
                <nav class="filter">
                    <dropdown label="filter.station" :options="stations" filter="filterStation"></dropdown>
                </nav>
            </header>
            <table>
                <thead>
                     <tr>
                        <th class="index">ID</th>
                        <th>{{$t('thead.type')}}</th>
                        <th>{{$t('thead.time')}}</th>
                        <th>{{$t('thead.station')}}</th>
                        <th>{{$t('thead.for')}}</th>
                        <th>{{$t('thead.ticket')}}</th>
                        <th>{{$t('thead.card')}}</th>
                        <th>{{$t('thead.auth')}}</th>
                        <th>{{$t('thead.amount')}}</th>
                        <th>{{$t('thead.tip')}}</th>
                        <th class="action">{{$t('thead.action')}}</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(record,index) in records" :key="index" :class="{voided:record.status === 0}">
                        <td class="index">{{record.index}}</td>
                        <td>{{record.transType}}</td>
                        <td>{{record.time | moment("HH:mm:ss")}}</td>
                        <td>{{record.station}}</td>
                        <td>{{$t('type.'+record.for)}}</td>
                        <td v-if="record.for === 'Order'" class="ticket">
                            <span class="type">{{$t('type.'+record.order.type)}}</span>
                            <span class="number">#{{record.order.number}}</span>
                        </td>
                        <td v-else></td>
                        <td class="card">
                            <i :class="ccType(record.account.type)"></i>
                            <span class="number" :title="record.addition.CARDBIN">...{{record.account.number}}</span>
                        </td>
                        <td class="auth">
                            <span>{{record.host.auth}}</span>
                        </td>
                        <td class="amount">$ {{record.amount.approve}}</td>
                        <td class="amount">$ {{record.amount.tip}}</td>
                        <td v-if="!record.close" class="action">
                            <span class="print" @click="print(record)">{{$t('button.print')}}</span>
                            <span class="void" @click="voidSale(record)">{{$t('button.void')}}</span>
                        </td>
                        <td v-else class="action">
                            <span class="refund">{{$t('button.refund')}}</span>
                        </td>
                    </tr>
                </tbody>
                <tfoot>
                    <tr>
                        <td>
                            <div class="value">
                                <span class="text">{{$t('text.tip')}}</span>
                                <span class="amount">$ {{totalTip}}</span>
                            </div>
                            <div class="value">
                                <span class="text">{{$t('text.total')}}</span>
                                <span class="amount">$ {{totalAmount}}</span>
                            </div>
                        </td>
                    </tr>
                </tfoot>
            </table>
            <footer>
                <button class="btn" @click="openAdjuster">{{$t('button.adjustTips')}}</button>
                <div class="f1">
                    <pagination :of="filteredTransactions" :max="12" :contain="13" @page="setPage"></pagination>
                </div>
                <button class="btn" @click="exit">{{$t('button.exit')}}</button>
            </footer>
        </div>
        <div :is="component" :init="componentData"></div>
    </div>
</template>

<script>
import { mapGetters } from "vuex";
import dialoger from "../common/dialoger";
import dropdown from "./component/dropdown";
import pagination from "../common/pagination";
import processor from "../common/processor";
import adjuster from "./component/adjuster";

export default {
  props: ["init"],
  components: { dialoger, dropdown, pagination, processor, adjuster },
  computed: {
    filteredTransactions() {
      let records = this.transactions;

      if (this.filterStation)
        records = records.filter(t => (t.station = this.station.alias));

      return records;
    },
    records() {
      let min = this.page * 13;
      let max = min + 13;

      return this.filteredTransactions.slice(min, max);
    },
    totalAmount() {
      return this.filteredTransactions
        .map(i => parseFloat(i.amount.approve))
        .reduce((a, b) => a + b, 0)
        .toFixed(2);
    },
    totalTip() {
      return this.filteredTransactions
        .map(i => parseFloat(i.amount.tip))
        .reduce((a, b) => a + b, 0)
        .toFixed(2);
    },
    ...mapGetters(["op", "station"])
  },
  data() {
    return {
      releaseComponentLock: false,
      transactions: [],
      componentData: null,
      component: null,
      adjustable: false,
      filterStation: null,
      stations: [],
      devices: [],
      terminal: null,
      date: today(),
      page: 0
    };
  },
  created() {
    this.checkPermission()
      .then(this.checkOccupy)
      .then(this.initialConfig)
      .then(this.initialData)
      .catch(this.initialFailed);
    this.$bus.on("filter", this.applyFilter);
  },
  beforeDestroy() {
    this.$bus.off("filter", this.applyFilter);
  },
  methods: {
    checkPermission() {
      return new Promise((next, reject) => {
        let data = {
          title: "dialog.accessDenied",
          msg: "dialog.accessDeniedTip",
          timeout: { duration: 1000, fn: "resolve" },
          buttons: [{ text: "button.confirm", fn: "resolve" }]
        };

        this.adjustable = this.approval(this.op.modify, "tip");
        this.approval(this.op.access, "terminal") ? next() : reject(data);
      });
    },
    checkOccupy() {
      return new Promise((next, reject) => {
        let data = {
          title: "dialog.accessDenied",
          msg: "dialog.terminalBatching",
          timeout: { duration: 1000, fn: "resolve" },
          buttons: [{ text: "button.confirm", fn: "resolve" }]
        };
        next();
      });
    },
    initialConfig() {
      return new Promise((next, reject) => {
        this.$socket.emit("[TERMINAL] DEVICE", devices => {
          let data = {
            type: "warning",
            title: "dialog.noTerminal",
            msg: "dialog.missTerminalConfig",
            timeout: { duration: 1000, fn: "resolve" },
            buttons: [{ text: "button.confirm", fn: "resolve" }]
          };
          this.devices = devices;
          devices.length === 0 ? reject(data) : next();
        });
      });
    },
    initialData() {
      this.$socket.emit("[TERMINAL] TODAY", data => {
        let stations = new Set();
        data.map(t => t.station).forEach(name => stations.add(name));
        this.stations = Array.from(stations).map(n => ({ text: n, value: n }));
        this.transactions = data;
      });
    },
    initialFailed(content) {
      this.$dialog(content).then(() => this.init.resolve());
    },
    getParser(model) {
      switch (model) {
        case "SP30":
        case "S80":
        case "S300":
          return require("../payment/parser/pax.js");
        case "NX2200":
          return require("../payment/parser/exadigm.js");
        default:
          return require("../payment/parser/pax.js");
      }
    },
    ccType(card) {
      switch (card) {
        case "Visa":
          return "fa fa-cc-visa";
        case "MasterCard":
          return "fa fa-cc-mastercard";
        case "American Express":
          return "fa fa-cc-amex";
        case "Discover":
          return "fa fa-cc-discover";
        default:
          return "fa fa-credit-card-alt";
      }
    },
    setPage(num) {
      this.page = num;
    },
    applyFilter(data) {
      const { value, type } = data;
      this[type] = value;
      this.page = 0;

      this.$nextTick(() => this.$bus.emit("applied"));
    },
    print(record) {
      Printer.printCreditCard(record, true);
    },
    voidSale(record) {
      let msg =
        record.for === "Order"
          ? [
              "dialog.voidCreditInvoice",
              record.order.number,
              this.$t("type." + record.order.type)
            ]
          : "dialog.voidCreditReload";

      let data = {
        title: "dialog.voidCreditSale",
        msg,
        buttons: [
          { text: "button.cancel", fn: "reject" },
          { text: "button.confirmPrint", fn: "resolve" }
        ]
      };

      this.$dialog(data)
        .then(() => {
          this.$p("processor", { timeout: 30000 });
          this.initialParser(record.terminal)
            .then(this.executeVoidSale.bind(null, record))
            .catch(this.executeFailed);
        })
        .catch(() => this.$q());
    },
    initialParser(terminal) {
      return new Promise((resolve, reject) => {
        const config = this.devices.find(d => d.alias === terminal);
        const { ip, port, sn, model } = config;
        this.terminal = this.getParser(model);
        this.terminal
          .initial(ip, port, sn, this.station.alias, terminal)
          .then(response => {
            this.device = this.terminal.check(response.data);
            this.device.code === "000000" ? resolve() : reject();
          });
      });
    },
    executeVoidSale(record) {
      const invoice = record.order.number;
      const transaction = record.trace.trans;

      this.terminal.voidSale(invoice, transaction).then(response => {
        let voidSale = this.terminal.explainTransaction(response.data);
        delete voidSale.order;

        if (voidSale.code === "000000") {
          Printer.printCreditCard(voidSale);
          Object.assign(record, voidSale, { status: 0 });
          this.$socket.emit("[TERMINAL] VOID", record);
          this.$q();
        } else {
          this.$dialog({
            type: "error",
            title: voidSale.msg,
            msg: ["terminal.error", voidSale.code],
            buttons: [{ text: "button.confirm", fn: "resolve" }]
          }).then(() => this.$q());
        }
      });
    },
    executeFailed(error) {
      console.log(error);
    },
    openAdjuster() {
      new Promise((resolve, reject) => {
        this.componentData = {
          resolve,
          reject,
          transactions: this.filteredTransactions,
          devices: this.devices
        };
        this.component = "adjuster";
      })
        .then(this.preBatch)
        .catch(() => this.$q());
    },
    preBatch() {
      const data = {
        title: "dialog.batchClose",
        msg: "dialog.batchCloseTip",
        buttons: [
          { text: "button.cancel", fn: "reject" },
          { text: "button.batch", fn: "resolve" }
        ]
      };

      this.$dialog(data)
        .then(() => this.processBatch())
        .catch(() => this.$q());
    },
    processBatch() {
      this.$p("processor", { timeout: 300000 });
      this.devices.forEach(config => {
        const { ip, port, sn, model, alias } = config;
        const terminal = this.getParser(model);

        terminal
          .initial(ip, port, sn, this.station.alias, alias)
          .then(response => {
            const check = terminal.check(response.data);
            check.code === "000000" && this.batch(terminal);
          });
      });
    },
    batch(terminal) {
      terminal.batch().then(response => {
        const result = terminal.explainBatch(response.data);

        if (result.code === "000000") {
          const { sn } = this.device;
          let updated = this.transactions.filter(t => !t.close).map(t => {
            t.hasOwnProperty("device") &&
              t.device.sn === sn &&
              (t.close = true);
            return t;
          });
          this.$socket.emit("[TERM] BATCH_TRANS_CLOSE", updated);
          Printer.printBatchReport(result);
          this.$socket.emit("[TERM] SAVE_BATCH_RESULT", result);
        } else {
          this.$dialog({
            type: "warning",
            title: result.msg,
            msg: ["terminal.error", result.code],
            buttons: [{ text: "button.confirm", fn: "resolve" }]
          }).then(() => this.$q());
        }
      });
    },
    exit() {
      this.init.resolve();
    }
  }
};
</script>

<style scoped>
.terminal {
  background: #fff;
  width: 950px;
  border-radius: 4px 4px 0 0;
  box-shadow: var(--shadow);
}

header {
  display: flex;
  padding: 10px 20px;
}

h5 {
  color: #666;
  font-weight: normal;
  margin-top: 2px;
}

nav.filter {
  flex: 1;
  position: relative;
  align-items: center;
  margin-left: 35px;
  display: flex;
  justify-content: flex-end;
}

thead tr {
  background: #009688;
  color: #fff;
  text-shadow: 0 1px 1px #333;
}

thead th {
  font-weight: normal;
  padding: 3px 0;
  border-bottom: 1px solid #eeeeee;
}

tbody {
  display: block;
  height: 507px;
  text-align: center;
}

thead,
tbody tr,
tfoot tr {
  display: table;
  table-layout: fixed;
  width: 100%;
}

tbody td {
  padding: 10px 0;
}

tbody tr {
  background: #fafafa;
}

tbody tr:nth-child(even) {
  background: #eeeeee;
}

tfoot tr {
  border-top: 1px solid #e0e0e0;
  text-align: center;
}

tfoot td {
  padding: 5px 0;
  background: #eeeeee;
}

footer {
  display: flex;
  align-items: center;
  background: #f5f5f5;
  border-top: 1px solid #e0e0e0;
}

.print {
  background: #607d8b;
}

.void {
  background: #f44336;
}

.refund {
  background: #ff9800;
}

.fa-cc-visa {
  color: #5050e2;
}

.fa-cc-mastercard {
  color: #ff2b1c;
}

.fa-cc-discover {
  color: #ff9800;
}

.fa-cc-amex {
  color: var(--deepBlue);
}

.ticket .number {
  color: gray;
}

.amount {
  font-weight: bold;
  font-family: "Agency FB";
  color: #3c3c3c;
}

.action {
  width: 150px;
}

.auth span {
  background: #ff5722;
  color: #fff;
  padding: 2px 4px;
  border-radius: 4px;
  text-shadow: 0 1px 1px #631b05;
  box-shadow: 0 1px 1px #b5afaf;
}

.action span {
  padding: 4px 6px;
  margin: 0 2px;
  color: #fff;
  cursor: pointer;
  border-radius: 2px;
  box-shadow: 0 1px 1px #b5afaf;
}

.adjustable {
  cursor: pointer;
  color: #ff9800;
}

.sub {
  margin-left: 5px;
  color: gray;
}

.index {
  width: 40px;
}

.value {
  display: inline-flex;
  margin: 0 10px;
}

.value .text {
  margin-right: 10px;
}

tr.voided {
  background: #ffab91;
  filter: grayscale(0.75) opacity(0.5);
  pointer-events: none;
}
</style>