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
    <button class="btn" @click="receipt">
      <i class="fa fa-print"></i>
      <span class="text">{{$t('button.receipt')}}</span>
    </button>
    <button class="btn" @click="print">
      <i class="fa fa-print"></i>
      <span class="text">{{$t('button.print')}}</span>
    </button>
    <button class="btn" @click="calendar">
      <i class="fa fa-calendar"></i>
      <span class="text">{{$t('button.calendar')}}</span>
    </button>
    <button class="btn" @click="terminal">
      <i class="fa fa-tablet"></i>
      <span class="text">{{$t('button.terminal')}}</span>
    </button>
    <button class="btn" @click="report">
      <i class="fa fa-file-text"></i>
      <span class="text">{{$t('button.report')}}</span>
    </button>
    <button class="btn" @click="paymentTransaction" :disabled="!reportable">
      <i class="fa fa-bar-chart"></i>
      <span class="text">{{$t('button.stats')}}</span>
    </button>
    <div class="btn" @click="reconciliation">
      <i class="fa fa-check-square-o"></i>
      <span class="text">{{$t('button.reconc')}}</span>
    </div>
    <div :is="component" :init="componentData"></div>
  </aside>
</template>

<script>
import { mapGetters, mapActions } from "vuex";

import paymentMark from "../payment/mark";
import Dialoger from "../common/dialoger";
import transaction from "./transaction";
import Reason from "./component/reason";
import Payment from "../payment/index";
import logs from "./component/payLog";
import unlock from "../common/unlock";
import Report from "../report/index";
import Calendar from "./calendar";
import Terminal from "./terminal";
import Search from "./search";

export default {
  props: ["date"],
  components: {
    paymentMark,
    transaction,
    Calendar,
    Dialoger,
    Terminal,
    Payment,
    unlock,
    Reason,
    Report,
    logs
  },
  data() {
    return {
      today: today(),
      reportable: false,
      component: null,
      componentData: null
    };
  },
  created() {
    this.reportable = this.approval(this.op.access, "report");
  },
  methods: {
    editOrder() {
      if (this.isEmptyTicket) return;

      this.$checkPermission("modify", "order")
        .then(this.checkDate)
        .then(this.checkStatus)
        .then(this.checkSettlement)
        .then(this.edit)
        .catch(this.editFailed);
    },
    voidOrder() {
      if (this.isEmptyTicket) return;

      this.$checkPermission("modify", "order")
        .then(this.checkDate)
        .then(this.checkSettlement)
        .then(this.voidTicket)
        .catch(this.voidFailed);
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
        const ticketSettledError = {
          type: "question",
          title: "dialog.ticketClosed",
          msg: "dialog.removePaymentRecordFirst",
          buttons: [
            { text: "button.removePayment", fn: "resolve" },
            { text: "button.cancel", fn: "reject" }
          ]
        };
        const paymentFoundError = {
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
      this.setApp({ newTicket: false });
      this.setCustomer(this.order.customer);
      this.setOrder(JSON.parse(JSON.stringify(this.order)));
      this.$router.push({ path: "/main/menu" });
    },
    editFailed(reason) {
      this.$dialog(reason)
        .then(this.removeRecordFromList)
        .catch(() => this.$q());
    },
    voidTicket() {
      const prompt = {
        type: "warning",
        title: ["dialog.voidOrderConfirm", this.order.number, this.$t("type." + this.order.type)],
        msg: "dialog.voidOrderConfirmTip",
        buttons: [{ text: "button.cancel", fn: "reject" }, { text: "button.void", fn: "resolve" }]
      };

      this.$dialog().then(confirm => this.$p("Reason")).catch(() => this.$q());
    },
    voidFailed(reason) {
      this.$dialog(reason).then(this.removeRecordFromList).catch(() => this.$q());
    },
    removeRecordFromList() {
      new Promise((resolve, reject) => {
        this.$socket.emit("[PAYMENT] GET_LOG", this.order._id, logs => {
          const { number } = this.order;

          this.componentData = { resolve, reject, number, logs };
          this.component = "logs";
        });
      }).then(() => this.$q());
    },
    reOpenOrder() {
      if (this.isEmptyTicket) return;
      const prompt = {
        type: "question",
        title: ["dialog.recoverOrderConfirm", this.order.number],
        msg: ["dialog.recoverOrderConfirmTip", this.order.void.by,this.$t("reason." + this.order.void.note)]
      };

      this.$dialog(prompt)
        .then(() => {
          let order = JSON.parse(JSON.stringify(this.order));
          order.status = 1;
          delete order.void;
          this.updateInvoice(order);
          this.$q();
        })
        .catch(() => this.$q());
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
        .catch(() => this.$q());
    },
    isSettled() {
      if (this.isEmptyTicket) return;
      if (this.order.status === 0) {
        this.$dialog({
          title: "dialog.orderVoided",
          msg: "dialog.settleVoidedOrder",
          buttons: [{ text: "button.confirm", fn: "resolve" }]
        }).then(() => this.$q());
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
      }).then(() => this.$q());
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
        .then(() => this.$p("paymentMark"))
        .catch(() => this.$p("Payment", { regular: true }));
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
      this.$checkPermission("access", "terminal")
        .then(() => this.$p("Terminal"))
        .catch(() => this.accessFailedLog("terminal"));
    },
    report() {
      this.$checkPermission("access", "report")
        .then(() => this.$p("Report"))
        .catch(() => this.accessFailedLog("report"));
    },
    reconciliation() { 

    },
    accessFailedLog(component) {
      this.$socket.emit("[SYS] RECORD", {
        type: "Software",
        event: "access",
        status: 0,
        cause: "attempt access " + component,
        data: this.op
      });
    },
    updateInvoice(ticket) {
      this.$socket.emit("[UPDATE] INVOICE", ticket, true);
    },
    paymentTransaction() {
      let date = document.querySelector("#calendar .text").innerText;

      this.$socket.emit("[PAYMENT] VIEW_TRANSACTIONS", date, data => {
        this.$p("transaction", {
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