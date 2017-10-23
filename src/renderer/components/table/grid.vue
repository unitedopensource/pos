<template>
    <div>
        <button class="btn" @click="editOrder" :disabled="order.content.length === 0">
            <i class="fa fa-list-alt"></i>
            <span class="text">{{$t('button.edit')}}</span>
        </button>
        <button class="btn" @click="switchTable" v-if="transfer">
            <i class="fa fa-exchange"></i>
            <span class="text">{{$t("button.switchTable")}}</span>
        </button>
        <button class="btn" @click="$emit('switch',false)" v-else>
            <i class="fa fa-ban"></i>
            <span class="text">{{$t('button.cancel')}}</span>
        </button>
        <button class="btn" @click="combineTicket">
            <i class="fa fa-link"></i>
            <span class="text">{{$t('button.combineTicket')}}</span>
        </button>
        <button class="btn" @click="prePayment">
            <i class="fa fa-print"></i>
            <span class="text">{{$t('button.receipt')}}</span>
        </button>
        <button class="btn" @click="settle">
            <i class="fa fa-money"></i>
            <span class="text">{{$t('button.payment')}}</span>
        </button>
        <button class="btn" @click="switchStaff" :disabled="true">
            <i class="fa fa-user-times"></i>
            <span class="text">{{$t('button.switch')}}</span>
        </button>
        <button class="btn" @click="split">
            <i class="fa fa-clone"></i>
            <span class="text">{{$t('button.split')}}</span>
        </button>
        <button class="btn" @click="exit">
            <i class="fa fa-times"></i>
            <span class="text">{{$t('button.exit')}}</span>
        </button>
        <button class="btn" @click="clearTable">
            <i class="fa fa-recycle"></i>
            <span class="text">{{$t('button.clearTable')}}</span>
        </button>
        <div :is="component" :init="componentData"></div>
    </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import dialoger from "../common/dialoger";
import payment from "../payment/index";
import unlock from "../common/unlock";
import split from "../menu/split";
import list from "./list";
export default {
  props: ["transfer"],
  components: { dialoger, unlock, payment, split, list },
  data() {
    return {
      componentData: null,
      component: null
    };
  },
  methods: {
    editOrder() {
      if (this.order.settled) {
        this.handleSettledOrder();
        return;
      }

      if (this.currentTable.server !== this.op.name) {
        this.$denyAccess(true)
          .then(op => {
            if (this.approval(op.modify, "order")) {
              let language = op.language || "usEN";
              moment.locale(language === "usEN" ? "en" : "zh-cn");
              this.$setLanguage(language);
              this.setOp(op);
              this.setApp({ mode: "edit", language });
              this.setTicket({ type: "DINE_IN", number: this.order.number });
              this.$router.push({ path: "/main/menu" });
            } else {
              throw new Error();
            }
          })
          .catch(() => {
            this.editDenied();
            this.$q();
          });
      } else {
        this.setApp({ mode: "edit" });
        this.setTicket({ type: "DINE_IN", number: this.order.number });
        this.$router.push({ path: "/main/menu" });
      }
    },
    editDenied() {
      this.$dialog({
        title: "dialog.cannotModify",
        msg: ["dialog.noRightToModify", this.order.server],
        buttons: [{ text: "button.confirm", fn: "resolve" }]
      }).then(() => {
        this.$q();
      });
    },
    handleSettledOrder() {
      this.$dialog({
        title: ["dialog.settledOrderReopen", this.order.number],
        msg: [
          "dialog.settledOrderReopenTip",
          this.$t("type." + this.order.payment.type)
        ],
        buttons: [
          { text: "button.removePayment", fn: "resolve" },
          { text: "button.cancel", fn: "reject" }
        ]
      })
        .then(() => {
          this.$q();
          this.removeOrderPayment();
        })
        .catch(() => {
          this.$q();
        });
    },
    removeOrderPayment() {
      this.$dialog({
        title: "dialog.paymentRemoveConfirm",
        msg: [
          "dialog.paymentRemoveConfirmTip",
          this.$t("type." + this.order.payment.type)
        ]
      })
        .then(() => {
          this.$q();
          this.removePayment();
          this.$socket.emit("[UPDATE] INVOICE", this.order);
          this.askEditOrder();
        })
        .catch(() => {
          this.$q();
        });
    },
    askEditOrder() {
      this.$dialog({
        title: "dialog.paymentRemoved",
        msg: ["dialog.paymentRemovedTip", this.order.number],
        buttons: [
          { text: "button.cancel", fn: "reject" },
          { text: "button.edit", fn: "resolve" }
        ]
      })
        .then(() => {
          this.editOrder();
        })
        .catch(() => {
          this.$q();
        });
    },
    switchTable() {
      if (!this.currentTable) return;
      this.$dialog({
        title: "dialog.switchTable",
        msg: "dialog.switchTableTip"
      })
        .then(() => {
          this.$emit("switch", this.currentTable);
          this.$q();
        })
        .catch(() => {
          this.$emit("switch", false);
          this.$q();
        });
    },
    combineTicket() {
      this.$p("list", { combineMode: true });
    },
    prePayment() {
      if (this.isEmptyTicket) return;
      if (this.order.settled) {
        this.settledOrder();
      } else if (this.order.print) {
        this.$dialog({
          type: "question",
          title: "dialog.prePayment",
          msg: ["dialog.prePaymentTip", this.order.table],
          buttons: [
            { text: "button.cancel", fn: "reject" },
            { text: "button.print", fn: "resolve" }
          ]
        })
          .then(() => {
            this.$q();
            this.$nextTick(() => {
              this.order.split
                ? this.askSplitPrePayment()
                : this.printPrePayment();
            });
          })
          .catch(() => {
            this.$q();
          });
      } else {
        let remain = this.order.content.filter(item => !item.print).length;
        this.$dialog({
          title: "dialog.prePaymentFailed",
          msg: ["dialog.prePaymentFailedTip", remain],
          buttons: [
            { text: "button.cancel", fn: "reject" },
            { text: "button.printAnyway", fn: "resolve" }
          ]
        })
          .then(() => {
            this.$q();
            this.printPrePayment();
          })
          .catch(() => {
            this.$q();
          });
      }
    },
    printPrePayment() {
      let order = JSON.parse(JSON.stringify(this.order));
      Object.assign(order, {
        type: "PRE_PAYMENT",
        cashier: this.op.name
      });
      Printer.setTarget("Receipt").print(order);
      this.$socket.emit("[TABLE] UPDATE", { _id: order.tableID, status: 3 });
    },
    askSplitPrePayment() {
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
          this.$q(), this.splitPrint();
        })
        .catch(() => {
          this.$q(), this.printPrePayment();
        });
    },
    splitPrint() {
      let split = [].concat
        .apply([], this.order.content.map(item => item.sort))
        .filter((v, i, s) => s.indexOf(v) === i).length;
      let ticket = JSON.parse(JSON.stringify(this.order));
      for (let i = 1; i < split + 1; i++) {
        ticket.content = this.order.content.filter(
          item =>
            Array.isArray(item.sort) ? item.sort.includes(i) : item.sort === i
        );
        ticket.payment = this.order.splitPayment[i - 1];
        ticket.number = `${this.order.number}-${i}`;
        Printer.setTarget("Receipt").print(ticket);
      }
      this.$socket.emit("[TABLE] UPDATE", {
        _id: this.order.tableID,
        status: 3
      });
    },
    settle() {
      if (this.isEmptyTicket) return;
      if (this.op.cashCtrl !== "enable" && this.op.cashCtrl !== "staffBank") {
        this.$denyAccess();
        return;
      }
      if (this.order.settled) {
        this.settledOrder();
        return;
      }
      this.$p("payment");
    },
    settledOrder() {
      this.$dialog({
        title: "dialog.invoiceSettled",
        msg: "dialog.invoiceSettledTip",
        buttons: [{ text: "button.confirm", fn: "resolve" }]
      }).then(() => {
        this.$q();
      });
    },
    switchStaff() {},
    split() {
      if (this.isEmptyTicket) return;
      if (this.order.settled) {
        this.settledOrder();
        return;
      }
      this.$p("split");
    },
    exit() {
      this.resetAll();
      this.$router.push({ path: "/main" });
    },
    clearTable() {
      if (!this.currentTable) return;
      if (
        this.currentTable.status === 4 ||
        this.currentTable.invoice.length === 0
      ) {
        this.$dialog({
          title: "dialog.tableClear",
          msg: ["dialog.tableClearTip", this.currentTable.name],
          buttons: [
            { text: "button.cancel", fn: "reject" },
            { text: "button.clear", fn: "resolve" }
          ]
        })
          .then(() => {
            this.resetMenu();
            this.$socket.emit("[TABLE] RESET", { _id: this.currentTable._id });
            this.$q();
          })
          .catch(() => {
            this.$q();
          });
      } else {
        this.$dialog({
          type: "info",
          title: "dialog.tableClearFailed",
          msg: ["dialog.tableClearFailedTip", this.currentTable.name],
          buttons: [{ text: "button.confirm", fn: "resolve" }]
        }).then(() => {
          this.$q();
        });
      }
    },
    ...mapActions([
      "setOp",
      "setApp",
      "resetMenu",
      "resetAll",
      "setTicket",
      "removePayment",
      "setTableInfo"
    ])
  },
  computed: {
    ...mapGetters(["op", "order", "isEmptyTicket", "currentTable"])
  }
};
</script>