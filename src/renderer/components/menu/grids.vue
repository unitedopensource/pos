<template>
  <div class="function" v-if="layout ==='DINE_IN'">
    <div class="top">
      <div class="btn" @click="less">
        <i class="fa fa-minus-square"></i>
        <span class="text">{{$t('button.less')}}</span>
      </div>
      <div class="btn" @click="more">
        <i class="fa fa-plus-square"></i>
        <span class="text">{{$t('button.more')}}</span>
      </div>
      <div class="btn" @click="request">
        <i class="fa fa-commenting-o"></i>
        <span class="text">{{$t('button.request')}}</span>
      </div>
    </div>
    <div class="bottomLeft">
      <div class="btn" @click="switchGuest" v-if="store.table.seatOrder">
        <i class="fa fa-users"></i>
        <span class="text">{{$t('button.switch')}}</span>
      </div>
      <div class="btn" @click="split" v-else>
        <i class="fa fa-columns"></i>
        <span class="text">{{$t('button.split')}}</span>
      </div>
      <div class="btn" @click="course">
        <i class="fa fa-clock-o"></i>
        <span class="text">{{$t('button.timer')}}</span>
      </div>
      <div class="btn" @click="search">
        <i class="fa fa-search"></i>
        <span class="text">{{$t('button.search')}}</span>
      </div>
      <div class="btn" @click="done(false)">
        <i class="fa fa-save"></i>
        <span class="text">{{$t('button.hold')}}</span>
      </div>
      <button class="btn" @click="modify">
        <i class="fa fa-calculator"></i>
        <span class="text">{{$t('button.modify')}}</span>
      </button>
      <div class="btn" @click="dineInExit">
        <i class="fa fa-times"></i>
        <span class="text">{{$t('button.exit')}}</span>
      </div>
    </div>
    <div class="bottomRight">
      <button class="btn long" @click="done(true)">
        <i class="fa fa-print"></i>
        <span class="text">{{$t('button.done')}}</span>
      </button>
      <div class="btn" @click="switchLanguage">
        <i class="fa fa-language"></i>
        <span class="text">{{$t('button.language')}}</span>
      </div>
    </div>
    <div :is="component" :init="componentData"></div>
  </div>
  <div class="grid" v-else-if="layout === 'BUFFET'">
    <div class="btn" @click="less">
      <i class="fa fa-minus-square"></i>
      <span class="text">{{$t('button.less')}}</span>
    </div>
    <div class="btn" @click="more">
      <i class="fa fa-plus-square"></i>
      <span class="text">{{$t('button.more')}}</span>
    </div>
    <button class="btn" @click="modify">
      <i class="fa fa-calculator"></i>
      <span class="text">{{$t('button.modify')}}</span>
    </button>
    <div class="btn settle" @click="settle">
      <i class="fa fa-money"></i>
      <span class="text">{{$t('button.payment')}}</span>
    </div>
    <div class="btn split" @click="split">
      <i class="fa fa-columns"></i>
      <span class="text">{{$t('button.split')}}</span>
    </div>
    <div class="btn" @click="save(false)">
      <i class="fa fa-save"></i>
      <span class="text">{{$t('button.save')}}</span>
    </div>
    <div class="btn" @click="exit">
      <i class="fa fa-times"></i>
      <span class="text">{{$t('button.exit')}}</span>
    </div>
    <div class="btn" @click="switchLanguage">
      <i class="fa fa-language"></i>
      <span class="text">{{$t('button.language')}}</span>
    </div>
    <div :is="component" :init="componentData"></div>
  </div>
  <div class="function" v-else>
    <div class="btn" @click="less">
      <i class="fa fa-minus-square"></i>
      <span class="text">{{$t('button.less')}}</span>
    </div>
    <div class="btn" @click="more">
      <i class="fa fa-plus-square"></i>
      <span class="text">{{$t('button.more')}}</span>
    </div>
    <div class="btn" @click="request">
      <i class="fa fa-commenting-o"></i>
      <span class="text">{{$t('button.request')}}</span>
    </div>
    <div class="btn" @click="settle">
      <i class="fa fa-money"></i>
      <span class="text">{{$t('button.payment')}}</span>
    </div>
    <div class="btn" @click="timer">
      <i class="fa fa-clock-o"></i>
      <span class="text">{{$t('button.timer')}}</span>
    </div>
    <button class="btn" @click="save(true)">
      <i class="fa fa-print"></i>
      <span class="text">{{$t('button.print')}}</span>
    </button>
    <div class="btn" @click="search">
      <i class="fa fa-search"></i>
      <span class="text">{{$t("button.search")}}</span>
    </div>
    <div class="btn" @click="split">
      <i class="fa fa-columns"></i>
      <span class="text">{{$t("button.split")}}</span>
    </div>
    <div class="btn" @click="save(false)">
      <i class="fa fa-save"></i>
      <span class="text">{{$t("button.save")}}</span>
    </div>
    <button class="btn" @click="modify">
      <i class="fa fa-calculator"></i>
      <span class="text">{{$t("button.modify")}}</span>
    </button>
    <div class="btn" @click="exit">
      <i class="fa fa-times"></i>
      <span class="text">{{$t("button.exit")}}</span>
    </div>
    <div class="btn" @click="switchLanguage">
      <i class="fa fa-language"></i>
      <span class="text">{{$t("button.language")}}</span>
    </div>
    <div :is="component" :init="componentData"></div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import dialoger from "../common/dialoger";
import unlock from "../common/unlock";
import modify from "./modify";
export default {
  props: ["layout"],
  components: { dialoger, unlock, modify },
  data() {
    return {
      isDisplayGuests: false,
      componentData: null,
      component: null
    };
  },
  methods: {
    callComponent(name) {
      this.$emit("open", name);
    },
    less() {
      if (this.isEmptyTicket) return;
      let boolean =
        !document.querySelector(".item.active") &&
        (!!document.querySelector("div.request") ||
          !!this.item.choiceSet.length);

      if (this.app.mode === "create" || this.item.new) {
        this.lessQty(boolean);
      } else {
        this.approval(this.op.modify, "item")
          ? this.lessQty(boolean)
          : this.requestAccess()
              .then(op => {
                if (this.approval(op.modify, "item")) {
                  this.$q();
                  this.lessQty(boolean);
                } else {
                  this.accessDenied();
                }
              })
              .catch(() => {
                this.accessDenied();
              });
      }
    },
    more() {
      let focus = document.querySelector(".item.active");
      let subItemCount = Array.isArray(this.item.choiceSet)
        ? this.item.choiceSet
            .filter(item => item.subItem)
            .map(item => item.qty)
            .reduce((a, b) => a + b, 0)
        : 0;

      if (!focus && this.item.hasOwnProperty("rules")) {
        let max = this.item.rules.maxSubItem || Infinity;
        let overCharge = this.item.rules.overCharge || 0;
        if (subItemCount >= max && overCharge === 0) {
          this.$dialog({
            title: "dialog.unableAdd",
            msg: ["dialog.maxSubItem", this.item[this.language], max],
            timeout: { duration: 5000, fn: "resolve" },
            buttons: [{ text: "button.confirm", fn: "resolve" }]
          }).then(() => {
            this.$q();
          });
          return true;
        }
      }
      this.moreQty();
    },
    requestAccess() {
      return new Promise((resolve, reject) => {
        this.componentData = { resolve, reject };
        this.component = "unlock";
      });
    },
    accessDenied() {
      this.$dialog({
        title: "dialog.accessDenied",
        msg: "dialog.accessDeniedTip",
        buttons: [{ text: "button.confirm", fn: "resolve" }]
      }).then(() => {
        this.$q();
      });
    },
    modify() {
      if (this.isEmptyTicket) return;
      let target = !!document.querySelector(".sub.target");
      target
        ? this.$p("modify", {
            item: {
              qty: this.choiceSet ? this.choiceSet.qty : 1,
              single: this.choiceSet ? this.choiceSet.single : 0,
              discount: 0
            },
            type: "choiceSet"
          })
        : this.$p("modify", { item: this.item });
    },
    course() {
      if (this.isEmptyTicket) return;
      this.callComponent("course");
    },
    settle() {
      if (this.isEmptyTicket) return;
      if (this.op.cashCtrl !== "enable" && this.op.cashCtrl !== "staffBank")
        return;
      this.callComponent("settle");
    },
    request() {
      this.callComponent("request");
    },
    search() {},
    timer() {
      if (this.isEmptyTicket) return;
      this.callComponent("timer");
    },
    split() {
      if (this.isEmptyTicket) return;
      this.callComponent("split");
    },
    switchGuest() {
      this.callComponent("guest");
    },
    save(print) {
      if (this.isEmptyTicket) return;
      let { doneLock } = this.station;
      let order = this.combineOrderInfo({ print });

      if (this.app.mode === "create") {
        this.$socket.emit("[SAVE] INVOICE", order, print, content => {
          print && Printer.setTarget("All").print(content);
        });
      } else {
        if (print) {
          let diffs = this.analyzeDiffs(order);
          Printer.setTarget("All").print(diffs);
          this.$socket.emit("[UPDATE] INVOICE", order, print);
        } else {
          this.$socket.emit("[UPDATE] INVOICE", order, print);
        }
      }
      if (doneLock) {
        this.setOp(null);
        this.resetAll();
        this.$router.push({ path: "/main/lock" });
      } else {
        this.resetAll();
        this.$router.push({ path: "/main" });
      }
    },
    done(print) {
      if (this.isEmptyTicket) return;
      let { doneLock } = this.station;
      let { printOnDone, lockOnDone } = this.store.table;
      let order = this.combineOrderInfo({ print });

      if (this.app.mode === "create") {
        Object.assign(this.currentTable, { invoice: [order._id] });
        this.$socket.emit("[TABLE] SETUP", this.currentTable);
        this.$socket.emit("[SAVE] INVOICE", order, print, content => {
          if (print) {
            printOnDone
              ? Printer.setTarget("All").print(content)
              : Printer.setTarget("Order").print(content);
          }
        });
      } else {
        this.$socket.emit("[UPDATE] INVOICE", order, print);
        if (print) {
          printOnDone
            ? Printer.setTarget("All").print(this.analyzeDiffs(order))
            : Printer.setTarget("Order").print(this.analyzeDiffs(order));
        }
      }

      if (lockOnDone || doneLock) {
        this.setOp(null);
        this.resetAll();
        this.$router.push({ path: "/main/lock" });
      } else {
        this.setOrder(order);
        this.$router.push({ name: "Table" });
      }
    },
    combineOrderInfo(extra) {
      let customer = Object.assign({}, this.customer);
      let print = extra.hasOwnProperty("print") ? extra.print : true;
      let order = Object.assign({}, this.order);
      if (this.app.mode === "create") {
        delete customer.extra;
        Object.assign(order, {
          customer,
          type: this.ticket.type,
          number: this.ticket.number,
          source: this.op.role !== "ThirdParty" ? "POS" : this.op.name,
          modify: 0,
          status: 1,
          time: +new Date(),
          date: today()
        });
      } else {
        Object.assign(order, {
          customer,
          lastEdit: +new Date(),
          editor: this.op.name,
          modify: isNumber(this.order.modify) ? this.order.modify + 1 : 1
        });
      }
      return Object.assign({}, order, extra);
    },
    analyzeDiffs(current) {
      current = JSON.parse(JSON.stringify(current));

      let items = [];
      let compare = current.content;

      this.diffs.forEach(prev => {
        let key = prev.unique;
        let index = compare.findIndex(item => item.unique === key);
        if (index !== -1) {
          let now = compare[index];

          //compare quantity
          if (now.qty < prev.qty) {
            compare[index].diffs = "less";
            compare[index].print = false;
          } else if (now.qty > prev.qty) {
            compare[index].diffs = "more";
            compare[index].print = false;
          } else {
            compare[index].diffs = "unchanged";
          }
          compare[index].origin = prev.qty;
          items.push(compare[index]);
        } else {
          prev.diffs = "removed";
          prev.print = false;
          items.push(prev);
        }
      });

      items.push(
        ...current.content.filter(item => item.new).map(item => {
          item.diffs = "new";
          return item;
        })
      );
      return Object.assign(current, { content: items });
    },
    exit() {
      this.isEmptyTicket
        ? this.exitOut()
        : this.$dialog({
            title: "dialog.exitConfirm",
            msg: "dialog.exitConfirmTip"
          })
            .then(() => {
              this.exitOut();
            })
            .catch(() => {
              this.$q();
            });
    },
    exitOut() {
      this.resetAll();
      this.setApp({ mode: "create" });
      this.$router.push({ path: "/main" });
    },
    dineInExit() {
      this.isEmptyTicket
        ? this.resetTableExit()
        : this.$dialog({
            title: "dialog.exitConfirm",
            msg: "dialog.exitConfirmTip"
          })
            .then(() => {
              this.resetTableExit();
            })
            .catch(() => {
              this.$q();
            });
    },
    resetTableExit() {
      this.app.mode === "create" &&
        this.$socket.emit("[TABLE] RESET", { _id: this.currentTable._id });
      this.exitOut();
    },
    switchLanguage() {
      let language = this.app.language === "usEN" ? "zhCN" : "usEN";
      this.$setLanguage(language);
      this.setApp({ language });
      moment.locale(language === "usEN" ? "en" : "zh-cn");
      this.$forceUpdate();
    },
    ...mapActions([
      "setOp",
      "setApp",
      "lessQty",
      "moreQty",
      "resetAll",
      "setOrder",
      "setTableInfo"
    ])
  },
  computed: {
    ...mapGetters([
      "op",
      "app",
      "item",
      "diffs",
      "language",
      "order",
      "ticket",
      "store",
      "customer",
      "station",
      "isEmptyTicket",
      "currentTable",
      "choiceSet"
    ])
  }
};
</script>

<style scoped>
.bottomLeft {
  display: inline-block;
  width: 184px;
}

.bottomRight {
  display: inline-block;
  width: 90px;
  vertical-align: top;
}

.long {
  height: 129px;
}

.guests {
  display: inline-flex;
}

.grid {
  display: grid;
  grid-template-columns: auto auto auto;
  grid-template-rows: auto auto auto;
  padding: 3px 0 0 3px;
}

.btn.settle {
  grid-column-start: 1;
  grid-column-end: 3;
  grid-row-start: 2;
  grid-row-end: 4;
  width: 185px;
  height: 129px;
}

.btn.split {
  grid-column-start: 3;
  grid-column-end: 3;
  grid-row-start: 2;
  grid-row-end: 4;
  height: 129px;
}
</style>
