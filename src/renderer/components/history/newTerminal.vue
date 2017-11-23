<template>
    <div class="popupMask center dark">
        <div class="wrap" v-show="!component">
        <header>
            <div>
                <h3>{{$t('title.terminalTransactions')}}</h3>
                <h5>{{$t('tip.foundPaymentRecords',transactions.length)}}</h5>
            </div>
            <nav class="filter">
              <dropdown label="filter.station" :options="machines" filter="machine"></dropdown>
            </nav>
        </header>
        <table>
            <thead>
                <tr>
                   <th class="index">ID</th>
                   <th>Type</th>
                   <th>Time</th>
                   <th>station</th>
                   <th>for</th>
                   <th>Order</th>
                   <th>card</th>
                   <th>Auth</th>
                   <th>Amount</th>
                   <th>Tip</th>
                   <th class="action">Action</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(record,index) in records" :key="index" :class="{void:record.status === 0}">
                    <td class="index">{{index + 1}}</td>
                    <td>{{record.transType}}</td>
                    <td>{{record.time | moment("HH:mm:ss")}}</td>
                    <td>{{record.station}}</td>
                    <td>{{record.for}}</td>
                    <td v-if="record.for === 'Order'" class="ticket">
                        <span class="type">{{$t('type.'+record.order.type)}}</span>
                        <span class="number">#{{record.order.number}}</span>
                    </td>
                    <td v-else></td>
                    <td class="card">
                        <i :class="cardType(record.account.type)"></i>
                        <span class="number" :title="record.addition.CARDBIN">...{{record.account.number}}</span>
                    </td>
                    <td class="auth">
                        <span>{{record.host.auth}}</span>
                    </td>
                    <td class="amount">$ {{record.amount.approve}}</td>
                    <td class="amount">$ {{record.amount.tip}}</td>
                    <td v-if="!record.close" class="action">
                        <span class="print">Print</span>
                        <span class="void" @click="voidSale(record)">Void</span>
                    </td>
                    <td v-else class="action">
                        <span class="refund">Refund</span>
                    </td>
                </tr>
            </tbody>
            <tfoot>
                <tr>
                    <td class="num"></td>
                    <td class="type"></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td class="settlement"></td>
                    <td class="amount">$</td>
                    <td class="amount">$</td>
                </tr>
            </tfoot>
        </table>
        <footer>
            <div class="btn" @click="adjustAllTips" :disabled="!deviceReady">{{$t('button.adjustTips')}}</div>
            <div class="f1">
                <!-- <pagination :of="filteredTransactions" :max="12" :contain="13" @page="setPage"></pagination> -->
            </div>
            <div class="btn" @click="init.resolve">{{$t('button.exit')}}</div>
        </footer>
        </div>
        <div :is="component" :init="componentData"></div>
    </div>
</template>

<script>
import { mapGetters } from "vuex";
import tip from "./component/tipper";
import looper from "./component/looper";
import loader from "../common/processor";
import dialoger from "../common/dialoger";
import dropdown from "./component/dropdown";
import pagination from "../common/pagination";

export default {
  props: ["init"],
  components: { tip, pagination, dropdown, loader, looper, dialoger },
  data() {
    return {
      transactions: [],
      componentData: null,
      component: null,
      adjustable: false,
      machines: [],
      machine: null,
      page: 0,
      device: null,
      terminal: null,
      deviceReady: false,
      date: today()
    };
  },
  created() {
    this.checkPermission()
      .then(this.initialDevice)
      .then(this.initialData);
    //.catch(this.initialFailed);
  },
  methods: {
    checkPermission() {
      return new Promise((resolve, reject) => {
        let data = {
          type: "warning",
          title: "dialog.accessDenied",
          msg: "dialog.accessDeniedTip",
          timeout: {
            duration: 10000,
            fn: "confirm"
          },
          buttons: [
            {
              text: "button.confirm",
              fn: "confirm"
            }
          ]
        };
        this.adjustable = this.approval(this.op.modify, "tip");
        this.approval(this.op.access, "terminal") ? resolve() : reject(data);
      });
    },
    initialDevice() {
      return new Promise(resolve => {
        let error = {
          type: "warning",
          title: "dialog.noTerminal",
          msg: "dialog.stationNoTerminal",
          buttons: [{ text: "button.confirm", fn: "resolve" }]
        };
        if (!this.station.terminal.enable) throw error;

        let terminal = this.station.terminal;
        let machine = this.station.alies;

        this.terminal = this.getFile(terminal.model);
        this.terminal
          .initial(
            terminal.address,
            terminal.port,
            terminal.sn,
            this.station.alies
          )
          .then(r => r.text())
          .then(device => {
            this.device = this.terminal.check(device);
            if (this.device.code === "000000") {
              this.deviceReady = true;
            }
          });
        resolve();
      });
    },
    initialData() {
      return new Promise((resolve, reject) => {
        this.$socket.emit("[TERM] INITIAL", data => {
          let machines = new Set();
          data.map(t => t.station).forEach(name => machines.add(name));
          this.machines = Array.from(machines).map(station => {
            return {
              text: station,
              value: station
            };
          });

          this.transactions = data;
          resolve();
        });
      });
    },
    initialFailed(error) {
      this.$dialog(error).then(() => {
        this.init.resolve();
      });
    },
    setPage(number) {
      this.page = number;
    },
    getFile(device) {
      switch (device) {
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
    cardType(card) {
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
    voidSale(record) {
      let data =
        record.for === "Order"
          ? {
              title: "dialog.voidCreditSale",
              msg: [
                "dialog.voidCreditInvoice",
                record.order.number,
                this.$t("type." + record.order.type)
              ],
              buttons: [
                { text: "button.cancel", fn: "reject" },
                { text: "button.confirmPrint", fn: "resolve" }
              ]
            }
          : {
              title: "dialog.voidCreditSale",
              msg: ["dialog.voidCreditReload"],
              buttons: [
                { text: "button.cancel", fn: "reject" },
                { text: "button.confirmPrint", fn: "resolve" }
              ]
            };

      this.$dialog(data)
        .then(() => {
          let invoice = record.order.number;
          let transaction = record.trace.trans;

          this.terminal
            .voidSale(invoice, transaction)
            .then(r => r.text())
            .then(data => {
              let voidSale = this.terminal.explainTransaction(data);
              delete voidSale.order;

              if (voidSale.code === "000000") {
                Printer.printCreditCard(voidSale);
                Object.assign(record, voidSale, { status: 0 });
                this.$socket.emit("[TERM] VOID_TRANSACTION", record);
              } else {
                this.$dialog({
                  type: "error",
                  title: voidSale.msg,
                  msg: ["terminal.error", voidSale.code],
                  buttons: [{ text: "button.confirm", fn: "resolve" }]
                }).then(() => {
                  this.$q();
                });
              }
            });
          this.$q();
        })
        .catch(() => {
          this.$q();
        });
    },
    adjustAllTips() {
      new Promise((resolve, reject) => {
        this.componentData = {
          resolve,
          reject,
          transactions: this.transactions,
          terminal: this.terminal
        };
        this.component = "looper";
      })
        .then(() => {
          this.batch();
        })
        .catch(() => {
          this.$q();
        });
    }
  },
  computed: {
    records() {
      return this.transactions;
    },
    ...mapGetters(["op", "station"])
  }
};
</script>

<style scoped>
.wrap {
  box-shadow: var(--shadow);
  background: #fff;
  width: 950px;
  border-radius: 4px 4px 0 0;
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

table {
  border-spacing: 0;
  table-layout: auto;
  width: 100%;
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

.wrap header {
  display: flex;
  padding: 10px 20px;
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

.zero {
  color: #979797;
}

footer {
  display: flex;
  align-items: center;
  background: #f5f5f5;
  border-top: 1px solid #e0e0e0;
}

tfoot tr {
  border-top: 1px solid #e0e0e0;
  text-align: center;
}

tfoot td {
  padding: 5px 0;
  background: #eeeeee;
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

.auth span {
  background: #ff5722;
  color: #fff;
  padding: 2px 4px;
  border-radius: 4px;
  text-shadow: 0 1px 1px #631b05;
  box-shadow: 0 1px 1px #b5afaf;
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

.action span {
  padding: 4px;
  margin: 0 2px;
  color: #fff;
  cursor: pointer;
  border-radius: 2px;
  box-shadow: 0 1px 1px #b5afaf;
}

span.print {
  background: #607d8b;
}

span.void {
  background: #f44336;
}

span.refund {
  background: #ff9800;
}
</style>

