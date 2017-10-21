<template>
    <div class="dashboard">
        <div class="cardWrap" v-if="station" :class="{enlarge:station.enlargeTitle}">
            <div class="card" v-for="(grid,index) in station.interface" @click="go(grid)" :class="{disable:!grid.enable}" :key="index">
                <i class="fa" :class="[grid.icon]"></i>
                <h1>{{grid.head}}</h1>
                <h4>{{grid.subhead}}</h4>
            </div>
        </div>
        <div class="clock">
            <div class="time">{{time | moment('hh:mm')}}</div>
            <div class="date">{{time | moment('dddd MMM D')}}</div>
        </div>
        <toast></toast>
        <div :is="component" :init="componentData"></div>
    </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import dialoger from "./common/dialoger";
import counter from "./common/counter";
import toast from "./dashboard/toast";
import Preset from "../preset";
import MAC from "getmac";

export default {
  components: { dialoger, counter, toast },
  data() {
    return {
      componentData: null,
      component: null,
      tip: false
    };
  },
  created() {
    this.$socket.emit("[INQUIRY] TICKET_NUMBER", number => {
      this.setTicket({ number });
    });
  },
  mounted() {
    this.station ? this.initial() : this.activation();
  },
  methods: {
    initial() {
      this.device.poleDisplay && this.welcomeScreen();
      this.store.timeCard && this.checkClockInStatus();

      ~~this.station.timeout !== 0
        ? this.setApp({ autoLock: true, lastActivity: +new Date() })
        : this.setApp({ autoLock: false });
    },
    welcomeScreen() {
      let { top, btm } = this.station.pole;
      poleDisplay.write("\f");
      poleDisplay.write(line(top, btm));
    },
    checkClockInStatus() {
      this.op.timecard && !this.op.clockIn && this.askClockIn();
    },
    askClockIn() {
      this.$dialog({
        title: "dialog.clockInRequire",
        msg: "dialog.clockInRequireTip",
        buttons: [
          { text: "button.later", fn: "reject" },
          { text: "button.clockIn", fn: "resolve" }
        ]
      })
        .then(() => {
          this.clockIn();
        })
        .catch(() => {
          this.$q();
        });
    },
    clockIn() {
      this.setOp({ clockIn: this.time, timeCard: ObjectId() });
      this.$socket.emit("[TIMECARD] CLOCK_IN", this.op);
      this.$dialog({
        type: "question",
        title: "dialog.clockInConfirm",
        msg: ["dialog.clockInTip", moment(this.time).format("hh:mm:ss a")],
        buttons: [{ text: "button.confirm", fn: "resolve" }]
      }).then(() => {
        this.$q();
      });
    },
    go(grid) {
      if (!grid) return;

      let { route } = grid;
      switch (route) {
        case "buffet":
          this.setTicket({ type: "BUFFET" });
          this.$router.push({ path: "/main/menu" });
          break;
        case "sale":
          this.setTicket({ type: "SALES" });
          this.$router.push({ path: "/main/menu" });
          break;
        case "order":
          this.setTicket({ type: "WALK_IN" });
          this.$router.push({ path: "/main/menu" });
          break;
        case "pickup":
          this.setTicket({ type: "PICK_UP" });
          this.ring && this.setCustomer(this.callLog[0]);
          this.$router.push({ path: "/main/info" });
          break;
        case "delivery":
          this.setTicket({ type: "DELIVERY" });
          this.ring && this.setCustomer(this.callLog[0]);
          this.$router.push({ path: "/main/info" });
          break;
        case "table":
          this.store.table.layout
            ? this.$router.push({ path: "/main/table" })
            : this.$dialog({
                title: "dialog.dineInDisabled",
                msg: "dialog.dineInEnableTip",
                buttons: [{ text: "button.confirm", fn: "resolve" }]
              }).then(() => {
                this.$q();
              });
          break;
        case "pickupList":
          this.$router.push({ path: "/main/list" });
          break;
        case "history":
          this.$router.push({ path: "/main/history" });
          break;
        case "setting":
          this.approval(this.op.access, route)
            ? this.$router.push({ path: "/main/setting" })
            : this.$denyAccess();
          break;
        case "cashDrawer":
          this.station.cashDrawer.enable
            ? this.cashDrawerAvailable()
            : this.cashDrawerUnavailable();
          break;
        case "lock":
          this.resetDashboard();
          this.setOp(null);
          this.$router.push({ path: "/main/lock" });
          break;
        default:
      }
    },
    cashDrawerAvailable() {
      switch (this.op.cashCtrl) {
        case "enable":
          this.station.cashDrawer.cashFlowCtrl
            ? this.$socket.emit(
                "[CASHFLOW] CHECK",
                {
                  date: today(),
                  cashDrawer: this.station.cashDrawer.name,
                  close: false
                },
                data => {
                  let { name, initial } = data;
                  initial
                    ? this.initialCashFlow(name)
                    : this.recordCashFlow(name);
                }
              )
            : Printer.openCashDrawer();
          break;
        case "staffBank":
          this.$socket.emit(
            "[CASHFLOW] CHECK",
            { date: today(), cashDrawer: this.op.name, close: false },
            data => {
              let { name, initial } = data;
              initial ? this.initialCashFlow(name) : this.recordCashFlow(name);
            }
          );
          break;
        case "disable":
          this.$denyAccess();
          break;
        default:
          this.$denyAccess();
      }
    },
    cashDrawerUnavailable() {
      this.$dialog({
        title: "dialog.cashDrawerUnavailable",
        msg: "dialog.cashDrawerUnavailableTip",
        buttons: [{ text: "button.confirm", fn: "resolve" }]
      }).then(() => {
        this.$q();
      });
    },
    initialCashFlow(name) {
      this.op.cashCtrl === "enable" ? this.askCashIn() : this.askSelfCashIn();
    },
    askCashIn() {
      this.$dialog({ title: "dialog.cashIn", msg: "dialog.cashInTip" })
        .then(() => {
          this.countDrawerCash(this.station.cashDrawer.initialAmount);
        })
        .catch(() => {
          this.$q();
        });
    },
    askSelfCashIn() {
      this.$dialog({ title: "dialog.selfCashIn", msg: "dialog.selfCashInTip" })
        .then(() => {
          this.countSelfCash();
        })
        .catch(() => {
          this.$q();
        });
    },
    countDrawerCash(amount) {
      if (isNumber(amount) && amount > 0) {
        Printer.openCashDrawer();
        this.$dialog({
          title: "dialog.cashInConfirm",
          msg: ["dialog.cashInConfirmTip", amount.toFixed(2)]
        })
          .then(() => {
            this.acceptCashIn(amount);
          })
          .catch(() => {
            this.countDrawerCash();
          });
      } else {
        new Promise((resolve, reject) => {
          this.componentData = { resolve, reject };
          this.component = "counter";
        })
          .then(amount => {
            this.countDrawerCash(amount);
          })
          .catch(() => {
            this.$q();
          });
      }
    },
    countSelfCash(amount) {
      if (isNumber(amount)) {
        this.$dialog({
          title: "dialog.selfCashInConfirm",
          msg: ["dialog.selfCashInConfirmTip", amount.toFixed(2)]
        })
          .then(() => {
            this.acceptCashIn(amount);
          })
          .catch(() => {
            this.countSelfCash();
          });
      } else {
        new Promise((resolve, reject) => {
          this.componentData = { resolve, reject };
          this.component = "counter";
        })
          .then(amount => {
            this.countSelfCash(amount);
          })
          .catch(() => {
            this.$q();
          });
      }
    },
    acceptCashIn(amount) {
      let name =
        this.op.cashCtrl === "enable"
          ? this.station.cashDrawer.name
          : this.op.name;
      let record = Preset.cashIn(this.op.name, name, amount);
      this.$socket.emit("[CASHFLOW] INITIAL", record);
      Printer.printCashInReport(record);
      this.$q();
    },
    recordCashFlow(cashDrawer) {
      if (this.op.cashCtrl === "enable") {
        Printer.openCashDrawer();

        let activity = {
          type: "OPEN",
          inflow: 0,
          outflow: 0,
          time: +new Date(),
          ticket: null,
          operator: this.op.name
        };
        this.$socket.emit("[CASHFLOW] ACTIVITY", { cashDrawer, activity });
      } else {
        this.$dialog({
          title: "dialog.staffBankMode",
          msg: "dialog.staffBankModeTip",
          buttons: [{ text: "button.confirm", fn: "resolve" }]
        }).then(() => {
          this.$q();
        });
      }
    },
    activation() {
      this.$dialog({
        type: "warning",
        title: "dialog.stationUnregistered",
        msg: "dialog.stationUnregisteredTip",
        buttons: [{ text: "button.activation", fn: "resolve" }]
      }).then(() => {
        MAC.getMac((err, mac) => {
          if (err) {
            this.$dialog({
              type: "error",
              title: "dialog.stationRegisterFailed",
              msg: ["dialog.stationRegisterFailedTip", err],
              buttons: [{ text: "button.confirm", fn: "resolve" }]
            }).then(() => {
              this.$q();
            });
          } else {
            let stations = Object.assign({}, this.store.station);
            let length = Object.keys(stations).length + 1;
            let alies = "pc" + length;
            let station = Preset.station(alies, mac);
            stations[alies] = station;

            this.$socket.emit("[CONFIG] UPDATE_STATION", stations);
            this.setStation(station);
            this.setStations(stations);
            Printer.initial(CLODOP, this.config);
            this.$q();
          }
        });
      });
    },
    ...mapActions([
      "setOp",
      "setApp",
      "setTicket",
      "setCustomer",
      "setStation",
      "setStations",
      "resetDashboard"
    ])
  },
  computed: {
    ...mapGetters([
      "op",
      "time",
      "ring",
      "callLog",
      "device",
      "config",
      "store",
      "station",
      "history"
    ])
  }
};
</script>

<style scoped>
.cardWrap {
  display: flex;
  flex-wrap: wrap;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  margin: 50px;
  width: 704px;
  box-shadow: 0 0 20px 0 rgba(0, 0, 0, 0.2);
}

.card {
  width: 135px;
  height: 115px;
  padding: 20px;
  margin: 0px;
  cursor: pointer;
  background: #fff;
  border-right: 1px solid #eee;
  border-bottom: 1px solid #eee;
  transition: background, box-shadow 0.22s ease;
  position: relative;
}

.card.disable {
  pointer-events: none;
}

.card.disable::after {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  background: #fff;
  z-index: 1;
  content: " ";
}

.card:active {
  background: #f6f6f6;
  color: #666;
  box-shadow: inset 0 1px 6px rgba(0, 0, 0, 0.55);
}

.card:nth-child(n + 5) {
  border-bottom: none;
}

.card:nth-child(4),
.card:nth-child(8) {
  border-right: none;
}

.card i {
  position: absolute;
  right: 20px;
  font-size: 2em;
  color: #039be5;
  text-shadow: 0 -1px 0px rgba(0, 0, 0, 0.5);
}

h4 {
  font-weight: normal;
  color: #757575;
}

h1 {
  font-weight: normal;
  margin-top: 50px;
}

.enlarge h1 {
  font-size: 46px;
}

.dashboard .clock {
  position: absolute;
  bottom: 50px;
  left: 50px;
  color: #f1f1f1;
  text-shadow: 0 3px 5px rgba(0, 0, 0, 0.5);
}

.dashboard .time {
  font-size: 6em;
}

.dashboard .date {
  font-size: 2em;
  margin-top: -10px;
}
</style>