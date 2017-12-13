<template>
    <aside>
        <div class="btn" @click="editOrder">
            <i class="fa fa-pencil-square-o"></i>
            <span class="text">{{$t('button.edit')}}</span>
        </div>
        <div class="btn" @click="reOpenOrder" v-if="this.order && this.order.status !== 1">
            <i class="fa fa-ban"></i>
            <span class="text">{{$t('button.recover')}}</span>
        </div>
        <div class="btn" @click="voidOrder" v-else>
            <i class="fa fa-ban"></i>
            <span class="text">{{$t('button.void')}}</span>
        </div>
        <button class="btn" @click="isSettled" :disabled="order.settled">
            <i class="fa fa-money"></i>
            <span class="text">{{$t('button.payment')}}</span>
        </button>
        <div class="btn" @click="receipt">
            <i class="fa fa-print"></i>
            <span class="text">{{$t('button.receipt')}}</span>
        </div>
        <div class="btn" @click="print">
            <i class="fa fa-print"></i>
            <span class="text">{{$t('button.print')}}</span>
        </div>
        <div class="btn" @click="calendar">
            <i class="fa fa-calendar"></i>
            <span class="text">{{$t('button.calendar')}}</span>
        </div>
        <div class="btn" @click="search">
            <i class="fa fa-search"></i>
            <span class="text">{{$t('button.search')}}</span>
        </div>
        <div class="btn" @click="terminal">
            <i class="fa fa-tablet"></i>
            <span class="text">{{$t('button.terminal')}}</span>
        </div>
        <div class="btn" @click="report">
            <i class="fa fa-file-text"></i>
            <span class="text">{{$t('button.report')}}</span>
        </div>
        <button class="btn" @click="paymentHistory" :disabled="!reportable">
            <i class="fa fa-bar-chart"></i>
            <span class="text">{{$t('button.stats')}}</span>
        </button>
        <div :is="component" :init="componentData"></div>
    </aside>
</template>

<script>
import { mapGetters, mapActions } from "vuex";

import paymentMark from "../payment/mark";
import Dialoger from "../common/dialoger";
import Reason from "./component/reason";
import payLog from "./component/payLog";
import Payment from "../payment/index";
import Report from "../report/index";
import Calendar from "./calendar";
import Terminal from "./terminal";
import history from "./history";
import Search from "./search";

export default {
  props: ["date"],
  components: {
    paymentMark,
    history,
    Calendar,
    Dialoger,
    Terminal,
    Payment,
    Reason,
    Report,
    payLog
  },
  data() {
    return {
      today: today(),
      editable: false,
      reportable: false,
      component: null,
      componentData: null
    };
  },
  created() {
    this.editable = this.approval(this.op.modify, "order");
    this.reportable = this.approval(this.op.access, "report");
  },
  methods: {
    editOrder() {
      if (this.isEmptyTicket) return;

      this.checkPermission(this.editable)
        .then(this.checkDate)
        .then(this.checkStatus)
        .then(this.checkSettlement)
        .then(this.edit)
        .catch(this.editFailed);
    },
    voidOrder() {
      if (this.isEmptyTicket) return;

      this.checkPermission(this.editable)
        .then(this.checkDate)
        .then(this.checkSettlement)
        .then(this.voidTicket)
        .catch(this.voidFailed);
    },
    checkPermission(boolean) {
      return new Promise((resolve, reject) => {
        boolean
          ? resolve()
          : reject({
              type: "warning",
              title: "dialog.accessDenied",
              msg: "dialog.accessDeniedTip",
              timeout: { duration: 5000, fn: "reject" },
              buttons: [{ text: "button.confirm", fn: "reject" }]
            });
      });
    },
    checkDate() {
      return new Promise((resolve, reject) => {
        this.date === this.today
          ? resolve()
          : reject({
              title: "dialog.unableEdit",
              msg: "dialog.editPrevOrderTip",
              buttons: [{ text: "button.confirm", fn: "reject" }]
            });
      });
    },
    checkStatus() {
      return new Promise((resolve, reject) => {
        this.order.status === 1
          ? resolve()
          : reject({
              title: "dialog.unableEdit",
              msg: ["dialog.editVoidOrderTip", this.order.void.by],
              buttons: [{ text: "button.confirm", fn: "reject" }]
            });
      });
    },
    checkSettlement() {
      return new Promise((resolve, reject) => {
        let ticketSettledError = {
          type: "question",
          title: "dialog.ticketClosed",
          msg: "dialog.removePaymentRecordFirst",
          buttons: [
            { text: "button.removePayment", fn: "resolve" },
            { text: "button.cancel", fn: "reject" }
          ]
        };
        let paymentFoundError = {
          type: "question",
          title: "dialog.paymentFound",
          msg: "dialog.removePaymentRecordFirst",
          buttons: [
            { text: "button.removePayment", fn: "resolve" },
            { text: "button.cancel", fn: "reject" }
          ]
        };
        if (this.order.settled) throw ticketSettledError;

        this.$socket.emit("[PAYMENT] CHECK", this.order._id, count => {
          count > 0 ? reject(paymentFoundError) : resolve();
        });
      });
    },
    edit() {
      this.setTicket({ type: this.order.type, number: this.order.number });
      this.setApp({ mode: "edit" });
      this.setCustomer(this.order.customer);
      this.setOrder(JSON.parse(JSON.stringify(this.order)));
      this.$router.push({ path: "/main/menu" });
    },
    editFailed(reason) {
      this.$dialog(reason)
        .then(this.removeRecordFromList)
        .catch(() => {
          this.$q();
        });
    },
    voidTicket() {
      this.$dialog({
        type: "warning",
        title: [
          "dialog.voidOrderConfirm",
          this.order.number,
          this.$t("type." + this.order.type)
        ],
        msg: "dialog.voidOrderConfirmTip",
        buttons: [
          { text: "button.cancel", fn: "reject" },
          { text: "button.void", fn: "resolve" }
        ]
      })
        .then(confirm => {
          this.$p("Reason");
        })
        .catch(() => {
          this.$q();
        });
    },
    voidFailed(reason) {
      this.$dialog(reason)
        .then(this.removeRecordFromList)
        .catch(() => {
          this.$q();
        });
    },
    removeRecordFromList() {
      new Promise((resolve, reject) => {
        this.$socket.emit("[PAYMENT] GET_LOG", this.order._id, logs => {
          this.componentData = {
            resolve,
            reject,
            number: this.order.number,
            logs
          };
          this.component = "payLog";
        });
      }).then(() => {
        this.$q();
      });
    },
    reOpenOrder() {
      if (this.isEmptyTicket) return;
      this.$dialog({
        type: "question",
        title: ["dialog.recoverOrderConfirm", this.order.number],
        msg: [
          "dialog.recoverOrderConfirmTip",
          this.order.void.by,
          this.$t("reason." + this.order.void.note)
        ]
      })
        .then(() => {
          let order = JSON.parse(JSON.stringify(this.order));
          order.status = 1;
          delete order.void;
          this.updateInvoice(order);
          this.$q();
        })
        .catch(() => {
          this.$q();
        });
    },
    calendar() {
      new Promise((resolve, reject) => {
        this.componentData = { resolve, reject };
        this.component = "Calendar";
      })
        .then(date => {
          this.$emit("change", date);
          this.$q();
        })
        .catch(() => {
          this.$q();
        });
    },
    isSettled() {
      if (this.isEmptyTicket) return;
      if (this.order.status === 0) {
        this.$dialog({
          title: "dialog.orderVoided",
          msg: "dialog.settleVoidedOrder",
          buttons: [{ text: "button.confirm", fn: "resolve" }]
        }).then(() => {
          this.$q();
        });
        return;
      }
      this.order.settled
        ? this.handleSettledInvoice()
        : this.order.source === "POS"
          ? this.$p("Payment")
          : this.askSettleType();
    },
    handleSettledInvoice() {
      this.$dialog({
        title: "dialog.orderSettled",
        msg: "dialog.orderSettledTip",
        buttons: [{ text: "button.confirm", fn: "resolve" }]
      }).then(() => {
        this.$q();
      });
    },
    askSettleType() {
      this.$dialog({
        type: "question",
        title: "dialog.thirdPartyInvoice",
        msg: "dialog.thirdPartyInvoiceTip",
        buttons: [
          { text: "button.pay", fn: "reject" },
          { text: "button.markAsPaid", fn: "resolve" }
        ]
      })
        .then(() => {
          this.$p("paymentMark");
        })
        .catch(() => {
          this.$p("Payment", { regular: true });
        });
    },
    print() {
      if (this.isEmptyTicket) return;

      let order = JSON.parse(JSON.stringify(this.order));
      order.split ? this.askSplitPrint(order) : this.printTicket(order);
    },
    receipt() {
      if (this.isEmptyTicket) return;

      let order = JSON.parse(JSON.stringify(this.order));
      order.split
        ? this.askSplitPrintReceipt(order)
        : this.printTicket(order, true);
    },
    askSplitPrint(order) {
      this.$dialog({
        type: "question",
        title: "dialog.printSplitTicket",
        msg: "dialog.printSplitTicketTip",
        buttons: [
          { text: "button.combinePrint", fn: "reject" },
          { text: "button.splitPrint", fn: "resolve" }
        ]
      })
        .then(() => {
          this.$q(), this.splitPrint(order);
        })
        .catch(() => {
          this.$q(), this.printTicket(order);
        });
    },
    askSplitPrintReceipt(order) {
      this.$dialog({
        type: "question",
        title: "dialog.printSplitTicket",
        msg: "dialog.printSplitTicketTip",
        buttons: [
          { text: "button.combinePrint", fn: "reject" },
          { text: "button.splitPrint", fn: "resolve" }
        ]
      })
        .then(() => {
          this.$q(), this.splitPrint(order, true);
        })
        .catch(() => {
          this.$q(), this.printTicket(order, true);
        });
    },
    printTicket(order, receipt) {
      this.updateInvoice(order);
      order.content.forEach(item => (item.diffs = "unchanged"));
      receipt
        ? Printer.setTarget("Receipt").print(order, true)
        : Printer.setTarget("All").print(order);
    },
    splitPrint(order, receipt) {
      this.updateInvoice(order);

      let split = [].concat
        .apply([], order.content.map(item => item.sort))
        .filter((v, i, s) => s.indexOf(v) === i).length;
      let ticket = JSON.parse(JSON.stringify(order));
      for (let i = 1; i < split + 1; i++) {
        ticket.content = order.content.filter(
          item =>
            Array.isArray(item.sort) ? item.sort.includes(i) : item.sort === i
        );
        ticket.content.forEach(item => (item.diffs = "unchanged"));
        ticket.payment = order.splitPayment[i - 1];
        ticket.number = `${order.number}-${i}`;

        receipt
          ? Printer.setTarget("Receipt").print(ticket, true)
          : Printer.setTarget("All").print(ticket);
      }
    },
    terminal() {
      this.station.terminal
        ? this.$p("Terminal")
        : this.$dialog({
            title: "dialog.noTerminal",
            msg: "dialog.stationNoTerminal",
            buttons: [{ text: "button.confirm", fn: "resolve" }]
          }).then(() => {
            this.$q();
          });
    },
    report() {
      this.reportable ? this.$p("Report") : this.$denyAccess();
    },
    search() {},
    updateInvoice(ticket) {
      this.$socket.emit("[UPDATE] INVOICE", ticket, true);
    },
    paymentHistory() {
      let date = document.querySelector("#calendar .text").innerText;

      this.$socket.emit("[PAYMENT] VIEW_TRANSACTIONS", date, data => {
        this.$p("history", {
          data: data
            .filter(t => t.for === "Order")
            .sort((a, b) => (a.ticket.number > b.ticket.number ? -1 : 1))
        });
      });
    },
    ...mapActions([
      "setApp",
      "setOrder",
      "setTicket",
      "resetMenu",
      "setCustomer",
      "removePayment"
    ])
  },
  computed: {
    ...mapGetters(["op", "order", "station", "isEmptyTicket"])
  }
};
</script>

<style scoped>
aside {
  display: flex;
  flex-direction: column;
  padding: 4px;
}
</style>