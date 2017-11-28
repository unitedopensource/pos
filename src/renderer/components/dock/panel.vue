<template>
    <div class="popupMask dark" @click.self="init.resolve">
        <transition appear name="fadeDown">
            <ul class="panel">
                <div v-if="op.timecard">
                    <li v-if="op.clockIn" @click="askClockOut">
                        <i class="fa fa-2x fa-clock-o"></i>
                        <div>
                            <h3>{{$t('dock.clockOut')}}</h3>
                            <h5>
                                <span class="pass">{{time | moment('HH:mm:ss')}}</span>
                                <span class="pass">{{op.clockIn | fromNow(true)}}</span>
                            </h5>
                        </div>
                    </li>
                    <li v-else @click="askClockIn">
                        <i class="fa fa-2x fa-clock-o"></i>
                        <div>
                            <h3>{{$t('dock.clockIn')}}</h3>
                            <h5>
                                <span class="pass">{{time | moment('HH:mm:ss')}}</span>
                            </h5>
                        </div>
                    </li>
                </div>
                <li @click="getTerminal" v-show="station.terminal.enable">
                    <i class="fa fa-2x fa-credit-card"></i>
                    <div>
                        <h3>{{$t('dock.terminal')}}</h3>
                        <h5>{{$t('dock.terminalTip')}}</h5>
                    </div>
                </li>
                <li @click="giftCardPanel">
                    <i class="fa fa-2x fa-gift"></i>
                    <div>
                        <h3>{{$t('dock.giftCard')}}</h3>
                        <h5>{{$t('dock.giftCardTip')}}</h5>
                    </div>
                </li>
                <li @click="openPayout" v-if="station.cashDrawer.enable" v-show="op.role === 'Admin' || op.role === 'Manager'">
                    <i class="fa fa-2x fa-money"></i>
                    <div>
                        <h3>{{$t('dock.payout')}}</h3>
                        <h5>{{$t('dock.payoutTip')}}</h5>
                    </div>
                </li>
                <li @click="setting" v-show="op.role === 'Admin' || op.role === 'Manager'">
                    <i class="fa fa-2x fa-cog"></i>
                    <div>
                        <h3>{{$t('dock.setting')}}</h3>
                        <h5>{{$t('dock.settingTip')}}</h5>
                    </div>
                </li>
                <li @click="changeLanguage">
                    <i class="fa fa-2x fa-language"></i>
                    <div>
                        <h3>{{$t('dock.language')}}</h3>
                        <h5>{{$t('dock.languageTip')}}</h5>
                    </div>
                </li>
                <li @click="logout">
                    <i class="fa fa-2x fa-sign-out"></i>
                    <div>
                        <h3>{{$t('dock.logout')}}</h3>
                        <h5>{{$t('dock.logoutTip')}}</h5>
                    </div>
                </li>
                <div :is="component" :init="componentData"></div>
            </ul>
        </transition>
    </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import terminal from "../history/terminal";
import giftCard from "../giftCard/task";
import dialoger from "../common/dialoger";
import payout from "./payout";
export default {
  props: ["init"],
  components: { dialoger, terminal, giftCard, payout },
  data() {
    return {
      componentData: null,
      component: null
    };
  },
  computed: {
    ...mapGetters(["op", "app", "config", "time", "station"])
  },
  methods: {
    askClockIn() {
      this.$dialog({
        type: "question",
        title: "dialog.clockInConfirm",
        msg: ["dialog.clockInTip", moment(this.time).format("hh:mm:ss a")]
      })
        .then(() => {
          this.setOp({ clockIn: this.time, session: ObjectId() });
          this.$socket.emit("[TIMECARD] CLOCK_IN", this.op);
          this.$q();
        })
        .catch(() => {
          this.$q();
        });
    },
    askClockOut() {
      let diff = moment().diff(moment(this.op.clockIn));
      let h =
        ("0" + Math.floor(diff / 36e5)).slice(-2) + " " + this.$t("text.hour");
      let m =
        ("0" + Math.floor(diff / 6e4)).slice(-2) + " " + this.$t("text.minute");

      this.$dialog({
        type: "question",
        title: "dialog.clockOutConfirm",
        msg: [
          "dialog.clockOutTip",
          moment(this.op.clockIn).format("hh:mm:ss a"),
          h + " " + m
        ]
      })
        .then(() => {
          this.$socket.emit("[TIMECARD] CLOCK_OUT", this.op);
          this.setOp({ clockIn: null, session: null });
          this.$router.push({ path: "/main/lock" });
          this.init.resolve();
        })
        .catch(() => {
          this.$q();
        });
    },
    logout() {
      switch (this.op.cashCtrl) {
        case "enable":
          this.checkCashOut(this.station.cashDrawer.name, false);
          break;
        case "staffBank":
          this.checkCashOut(this.op.name, true);
          break;
        default:
          this.exit();
      }
    },
    checkCashOut(cashDrawer, staffBank) {
      this.$socket.emit(
        "[CASHFLOW] CHECK",
        { date: today(), cashDrawer, close: false },
        data => {
          let { name, initial } = data;
          initial
            ? this.exit()
            : staffBank ? this.staffCashOut(name) : this.regularCashOut(name);
        }
      );
    },
    staffCashOut(name) {
      this.$dialog({
        type: "question",
        title: "dialog.staffCashOut",
        msg: "dialog.staffCashOutTip"
      })
        .then(() => {
          this.cashOut(name);
        })
        .catch(() => {
          this.exit();
        });
    },
    regularCashOut(name) {
      this.$dialog({
        type: "question",
        title: "dialog.cashOut",
        msg: ["dialog.cashOutTip", name]
      })
        .then(() => {
          this.cashOut(name);
        })
        .catch(() => {
          this.exit();
        });
    },
    cashOut(cashDrawer) {
      this.$q();
      this.$socket.emit("[CASHFLOW] SETTLE", cashDrawer, cashFlow => {
        this.reconciliation(cashFlow);
      });
    },
    reconciliation(cashflow) {
      this.recordCashDrawerAction();
      let diff = (parseFloat(cashflow.end) - parseFloat(cashflow.begin)
      ).toFixed(2);

      cashflow.activity = cashflow.activity.filter(
        log =>
          log.type === "START" ||
          log.type === "CASHFLOW" ||
          log.type === "PAYOUT"
      );

      this.$dialog({
        type: "question",
        title: ["dialog.cashOutSettle", cashflow.end],
        msg: ["dialog.cashOutSettleTip", cashflow.begin, diff, cashflow.end],
        buttons: [
          { text: "button.printDetail", fn: "reject" },
          { text: "button.print", fn: "resolve" }
        ]
      })
        .then(() => {
          Printer.printCashOutReport(cashflow, false);
          this.exit();
        })
        .catch(() => {
          Printer.printCashOutReport(cashflow, true);
          this.exit();
        });
    },
    recordCashDrawerAction() {
      this.op.cashCtrl === "enable" && Printer.openCashDrawer();

      let activity = {
        type: "END",
        inflow: 0,
        outflow: 0,
        time: +new Date(),
        ticket: null,
        operator: this.op.name
      };
      this.$socket.emit("[CASHFLOW] ACTIVITY", {
        cashDrawer:
          this.op.cashCtrl === "enable"
            ? this.station.cashDrawer.name
            : this.op.name,
        activity
      });
    },
    getTerminal() {
      this.$p("terminal");
    },
    giftCardPanel() {
      this.$p("giftCard");
    },
    openPayout() {
      this.$p("payout");
    },
    changeLanguage() {
      let language = this.app.language === "usEN" ? "zhCN" : "usEN";
      this.$setLanguage(language);
      this.setApp({ language });
      moment.locale(language === "usEN" ? "en" : "zh-cn");
      this.$forceUpdate();
    },
    setting() {
      if (this.approval(this.op.access, "setting")) {
        this.$router.push({ path: "/main/setting" });
        this.init.reject();
      } else {
        this.$denyAccess();
      }
    },
    exit() {
      this.$router.push({ name: "Login" });
      this.$socket.emit("[SYS] RECORD", {
        type: "User",
        event: "logOut",
        status: 1
      });
    },
    ...mapActions(["setOp", "setApp"])
  }
};
</script>

<style scoped>
ul.panel {
  font-size: initial;
  width: 250px;
  position: absolute;
  top: 10px;
  right: 90px;
  padding: 4px 4px 0;
  background: rgba(255, 255, 255, 0.8);
  color: #263238;
  box-shadow: -2px 4px 12px rgba(0, 0, 0, 0.4);
}

li {
  background: #fff;
  margin-bottom: 5px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.5);
  display: flex;
  padding: 10px;
  align-items: center;
}

li:active {
  background: #eee;
}

i {
  width: 50px;
  margin: 0 13px 0 7px;
  color: #363636;
  text-align: center;
}

h3 {
  font-weight: normal;
}

h5 {
  font-weight: normal;
  color: #757575;
  font-size: 14px;
  line-height: 12px;
  display: flex;
  align-items: center;
  height: 14px;
}

.pass {
  color: #009688;
  font-size: 14px;
  padding-right: 5px;
  min-width: 60px;
}
</style>