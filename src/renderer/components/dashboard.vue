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
        <transition name="payment">
          <div class="popupMask center dark" v-if="component">
            <div :is="component" :init="componentData"></div>
          </div>  
        </transition>
        
    </div>
</template>

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
  background: rgba(255, 255, 255, 0.9);
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

<script>
import { mapActions, mapGetters } from "vuex";
import dialoger from "./common/dialoger";
import thirdParty from "./dock/source";
import counter from "./common/counter";
import toast from "./dashboard/toast";
import unlock from "./common/unlock";
import Preset from "../preset";
import Mac from "getmac";

export default {
  components: { dialoger, counter, toast, unlock, thirdParty },
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
  },
  data() {
    return {
      componentData: null,
      component: null
    };
  },
  created() {
    this.getTicketNumber()
      .then(this.checkStation)
      .then(this.checkTimecard)
      .then(this.checkCashCtrl)
      .then(this.initialized)
      .catch(this.initialFailed);
  },
  methods: {
    getTicketNumber() {
      return new Promise(next => {
        this.$socket.emit("[INQUIRY] TICKET_NUMBER", number => {
          this.setTicket({ number });
          next();
        });
      });
    },
    checkStation() {
      return new Promise((resolve, reject) => {
        if (this.station) {
          resolve();
        } else {
          let data = {
            type: "warning",
            title: "dialog.stationUnregistered",
            msg: "dialog.stationUnregisteredTip",
            buttons: [{ text: "button.activation", fn: "resolve" }]
          };

          this.$dialog(data).then(() => {
            Mac.getMac((err, mac) => {
              if (err) {
                this.$dialog({
                  type: "error",
                  title: "dialog.stationRegisterFailed",
                  msg: ["dialog.stationRegisterFailedTip", err],
                  buttons: [{ text: "button.confirm", fn: "resolve" }]
                }).then(() => {
                  this.$q();
                  this.$router.push({ name: "Login" });
                });
              } else {
                let stations = Object.assign({}, this.store.station);
                let length = Object.keys(stations).length + 1;
                let alias = "pc" + length;
                let station = Preset.station(alias, mac);
                stations[alias] = station;

                this.$socket.emit("[CONFIG] UPDATE_STATION", stations);
                this.setStation(station);
                this.setStations(stations);
                Printer.initial(CLODOP, this.config);
                resolve();
              }
            });
          });
        }
      });
    },
    checkTimecard() {
      return new Promise(next => {
        if (this.op.timecard && !this.op.clockIn) {
          this.$dialog({
            title: "dialog.clockInRequire",
            msg: "dialog.clockInRequireTip",
            buttons: [
              { text: "button.later", fn: "reject" },
              { text: "button.clockIn", fn: "resolve" }
            ]
          })
            .then(() => {
              this.setOp({ clockIn: this.time, session: ObjectId() });
              this.$socket.emit("[TIMECARD] CLOCK_IN", this.op);

              this.$dialog({
                type: "question",
                title: "dialog.clockInConfirm",
                msg: [
                  "dialog.clockInTip",
                  moment(this.time).format("hh:mm:ss a")
                ],
                buttons: [{ text: "button.confirm", fn: "resolve" }]
              }).then(() => {
                next();
              });
            })
            .catch(() => {
              next();
            });
        } else if (this.op.break) {
          let duration = moment
            .duration(+new Date() - this.op.break, "milliseconds")
            .humanize();

          this.$dialog({
            type: "question",
            title: "dialog.endBreakTime",
            msg: ["dialog.endBreakTimeTip", duration]
          })
            .then(() => {
              this.$socket.emit("[TIMECARD] BREAK_END", this.op);
              this.setOp({ break: null });
              next();
            })
            .catch(() => {
              next();
            });
        } else {
          next();
        }
      });
    },
    checkCashCtrl() {
      return new Promise(next => {
        let { enable, cashFlowCtrl } = this.station.cashDrawer;

        this.$socket.emit(
          "[CASHFLOW] CHECK",
          {
            date: today(),
            cashDrawer: this.station.cashDrawer.name,
            close: false
          },
          data => {
            let { name, initial } = data;
            if (initial && enable && cashFlowCtrl) {
              this.askCashIn();
              next();
            } else {
              next();
              this.$q();
            }
          }
        );
      });
    },
    askCashIn() {
      let amount = this.station.cashDrawer.initialAmount;
      this.$dialog({ title: "dialog.cashIn", msg: "dialog.cashInTip" })
        .then(() => {
          this.countInitialCash(amount);
        })
        .catch(() => {
          this.$q();
        });
    },
    countInitialCash(amount) {
      if (isNumber(amount)) {
        Printer.openCashDrawer();
        this.$dialog({
          title: "dialog.cashInConfirm",
          msg: ["dialog.cashInConfirmTip", amount.toFixed(2)],
          buttons: [
            { text: "button.modify", fn: "reject" },
            { text: "button.confirm", fn: "resolve" }
          ]
        })
          .then(() => {
            this.acceptCashIn(amount);
          })
          .catch(() => {
            this.countInitialCash();
          });
      } else {
        new Promise((resolve, reject) => {
          this.componentData = { resolve, reject };
          this.component = "counter";
        })
          .then(amount => {
            this.countInitialCash(amount);
          })
          .catch(() => {
            this.$q();
          });
      }
    },
    initialized() {
      this.device.poleDisplay && this.welcomeScreen();
      ~~this.station.timeout !== 0
        ? this.setApp({ autoLock: true, lastActivity: +new Date() })
        : this.setApp({ autoLock: false });
    },
    initialFailed(error) {
      console.log(error);
    },
    welcomeScreen() {
      let { top, bot } = this.station.pole;
      poleDisplay.write("\f");
      poleDisplay.write(line(top, bot));
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
        case "thirdParty":
          new Promise((resolve, reject) => {
            this.componentData = { resolve, reject };
            this.component = "thirdParty";
          })
            .then(source => {
              this.$q();
              this.setOrder({ source });
              this.setTicket({ type: "DELIVERY" });
              this.$router.push({ path: "/main/info" });
            })
            .catch(() => {
              this.$q();
            });
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
          this.approval(this.op.access, route)
            ? this.$router.push({ path: "/main/history" })
            : this.$denyAccess(true)
                .then(op => {
                  if (this.approval(op.access, route)) {
                    this.$router.push({ path: "/main/history" });
                  } else {
                    this.$denyAccess();
                  }
                })
                .catch(() => {
                  this.$denyAccess();
                });
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
          this.$socket.emit("[SYS] RECORD", {
            type: "User",
            event: "lockStation",
            status: 1
          });
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
    askSelfCashIn() {
      this.$dialog({ title: "dialog.selfCashIn", msg: "dialog.selfCashInTip" })
        .then(() => {
          this.countSelfCash();
        })
        .catch(() => {
          this.$q();
        });
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
    initialCashFlow(name) {
      this.op.cashCtrl === "enable" ? this.askCashIn() : this.askSelfCashIn();
    },
    ...mapActions([
      "setOp",
      "setApp",
      "setTicket",
      "setOrder",
      "setCustomer",
      "setStation",
      "setStations",
      "resetDashboard"
    ])
  }
};
</script>