<template>
  <div class="popupMask dark center">
    <div class="record">
      <header>
        <h3>{{$t('title.payLog')}}</h3>
        <h5>{{$t('tip.paidRecords',init.number,init.logs.length)}}
          <span class="warning" v-show="!terminalAvailable">
            <i class="fa fa-exclamation-circle"></i>
            {{$t(msg)}}
            </span>
          </h5>
      </header>
      <table>
        <thead>
          <tr>
            <th>{{$t('thead.time')}}</th>
            <th>{{$t('thead.paymentType')}}</th>
            <th>{{$t('thead.amount')}}</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(log,index) in logs" :key="index">
            <td>{{log.time | moment("HH:mm:ss")}}</td>
            <td v-if="log.type ==='CASH'">{{$t('type.'+log.type)}}</td>
            <td v-else-if="log.type === 'CREDIT'" class="info">
              <span>{{$t('type.'+log.type)}}<span class="last">({{log.lfd}})</span></span>
              <span>{{log.subType}}</span>
            </td>
            <td v-else-if="log.type ==='GIFT'">
              <span>{{$t('type.'+log.type)}}<span class="last">({{log.lfd}})</span></span>
            </td>
            <td class="amount" :title="tenderDetail(log)">$ {{log.actual | decimal}}</td>
            <td>
              <button @click="removeConfirm(log,index)" :disabled="log.type === 'CREDIT' && !terminalAvailable">{{$t("button.remove")}}</button>
              <span v-if="log.hasOwnProperty('splitPayment')" class="split">#{{log.splitPayment + 1}}</span>
            </td>
          </tr>
        </tbody>
      </table>
      <footer>
        <button class="btn" @click="removeAllConfirm" :disabled="true">{{$t("button.removeAll")}}</button>
        <div class="f1">
          <pagination :of="init.logs" @page="setPage" :contain="10" :max="6"></pagination>
        </div>
        <button class="btn" @click="close">{{$t('button.close')}}</button>
      </footer>
    </div>
    <div :is="component" :init="componentData"></div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import dialoger from "../../common/dialoger";
import pagination from "../../common/pagination";

export default {
  props: ["init"],
  components: { dialoger, pagination },
  computed: {
    logs() {
      let min = this.page * 10;
      let max = min + 10;
      return this.init.logs.slice(min, max);
    },
    ...mapGetters(["op", "station"])
  },
  data() {
    return {
      terminalAvailable: false,
      componentData: null,
      component: null,
      terminal: null,
      msg: "terminal.connecting",
      page: 0
    };
  },
  created() {
    this.station.terminal.enable
      ? this.initialTerminal()
      : (this.msg = "terminal.paymentFailedTip");
  },
  methods: {
    initialTerminal() {
      let terminal = this.station.terminal;

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
          this.device.code === "000000"
            ? (this.terminalAvailable = true)
            : (this.msg = "terminal.connectError");
        });
    },
    setPage(number) {
      this.page = number;
    },
    tenderDetail(log) {
      return this.$t(
        "text.tenderDetail",
        log.paid.toFixed(2),
        log.change.toFixed(2)
      );
    },
    removeConfirm(payment, index) {
      let data = {
        type: "warning",
        title: "dialog.paymentRemoveConfirm",
        msg: [
          "dialog.paymentRemoveConfirmTip",
          this.$t("type." + payment.type)
        ],
        buttons: [
          { text: "button.cancel", fn: "reject" },
          { text: "button.remove", fn: "resolve", load: true }
        ]
      };
      this.$dialog(data)
        .then(() => {
          switch (payment.type) {
            case "CREDIT":
              this.$socket.emit(
                "[TERM] GET_TRANSACTION_DETAIL",
                payment.credential,
                record => {
                  let invoice = record.order.number;
                  let transaction = record.trace.trans;

                  this.terminal
                    .voidSale(invoice, transaction)
                    .then(r => r.text())
                    .then(data => {
                      this.$q();
                      let voidSale = this.terminal.explainTransaction(data);
                      delete voidSale.order;
                      if (voidSale.code === "000000") {
                        Printer.printCreditCard(voidSale);
                        Object.assign(record, voidSale, { status: 0 });
                        this.$socket.emit("[TERM] UPDATE_TRANSACTION", record);
                        this.remove(payment, index);
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
                }
              );
              break;
            case "GIFT":
              this.$socket.emit(
                "[GIFTCARD] REFUND",
                payment.credential,
                callback => {
                  console.log("callback");
                  this.$q();
                  this.remove(payment, index);
                }
              );
              break;
            default:
              this.remove(payment, index);
          }
        })
        .catch(() => {
          this.$q();
        });
    },
    removeAllConfirm() {
      let data = {
        type: "warning",
        title: "dialog.removeAllPaymentConfirm",
        msg: "dialog.removeAllPaymentConfirmTip"
      };
      this.$dialog(data)
        .then(() => {
          this.$q();
        })
        .catch(() => {
          this.$q();
        });
    },
    remove(payment, index) {
      this.$q();
      this.$socket.emit("[PAYMENT] REMOVE", payment);
      this.init.logs.splice(index, 1);
    },
    close() {
      this.init.resolve();
    },
    getFile(device) {
      switch (device) {
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
  }
};
</script>

<style scoped>
.record {
  background: #fff;
  width: 500px;
  border-radius: 4px 4px 0 0;
  box-shadow: 0 2px 3px rgba(0, 0, 0, 0.4);
}

header {
  padding: 15px 20px 10px;
  border-bottom: 1px solid #eee;
}

h3 {
  color: #333;
}

h5 {
  font-weight: normal;
  color: #757575;
  margin-top: 3px;
}

table {
  table-layout: auto;
  border-spacing: 0;
  width: 100%;
}

thead th {
  padding: 5px 0;
  background: #009688;
  color: #fff;
  text-shadow: 0 1px 1px #333;
}

tbody {
  background: #fafafa;
  display: block;
  height: 390px;
}

thead,
tbody tr {
  text-align: center;
  display: table;
  width: 100%;
  table-layout: fixed;
}

tbody td {
  text-align: center;
  padding: 5px 0;
}

td button {
  border: none;
  background: #ff5722;
  color: #fff;
  padding: 7px 10px;
  font-family: Yuanti-SC;
  border-radius: 3px;
  cursor: pointer;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

tbody tr:nth-child(odd) {
  background: #eeeeee;
}
.amount {
  font-weight: bold;
  font-family: "Agency FB";
  color: #3c3c3c;
}
footer {
  display: flex;
  border-top: 1px solid #eee;
  background: #fafafa;
}

.f1 {
  display: flex;
  justify-content: center;
}

.last {
  font-size: 14px;
  margin-left: 5px;
  color: #ff5722;
}

.warning {
  color: #ff9800;
  font-style: italic;
  float: right;
}

.warning i {
  margin: 0 2px;
}

.info {
  display: flex;
  flex-direction: column;
}

.split {
  color: #607d8b;
  font-style: italic;
  width: 40px;
  display: inline-block;
}
</style>