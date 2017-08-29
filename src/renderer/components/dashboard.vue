<template>
  <div class="dashboard">
    <div class="cardWrap" v-if="station">
      <div class="card" v-for="(grid,index) in station.interface" @click="go(grid)" :class="{disable:!grid.enable}" :key="index">
        <i class="fa" :class="[grid.icon]"></i>
        <h1>{{grid.head}}</h1>
        <h4>{{grid.subhead}}</h4>
      </div>
    </div>
    <div class="clock">
      <div class="time">{{time | moment('hh:mm')}}</div>
      <div class="date">{{time | moment('dddd, MMMM D')}}</div>
    </div>
    <div :is="component" :init="componentData"></div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import dialoger from './common/dialoger'
import counter from './common/counter'
import Printer from '../print'
import Preset from '../preset'
import MAC from 'getmac'

export default {
  components: { dialoger, counter },
  data() {
    return {
      component: null,
      componentData: null
    }
  },
  created() {
    this.$socket.emit("[INQUIRY] TICKET_NUMBER", number => { this.setTicket({ number }) });
    this.setApp({ opLastAction: new Date().getTime() });
  },
  mounted() {
    this.station ? this.initial() : this.activateStation();
  },
  methods: {
    initial() {
      this.device.poleDisplay && this.welcomeScreen();
      this.store.timeCard && this.checkClockIn();
      ~~this.station.timeout !== 0
        ? this.setApp({ autoLock: true, opLastAction: new Date().getTime() })
        : this.setApp({ autoLock: false });
    },
    go(grid) {
      this.setApp({ opLastAction: new Date().getTime() });
      if (!grid.enable) return;
      let { route } = grid;
      switch (route) {
        case "buffet":
          this.setTicket({ type: 'BUFFET' });
          this.$router.push({ path: '/main/menu' });
          break;
        case "sale":
          this.setTicket({ type: 'SALES' });
          this.$router.push({ path: '/main/menu' });
          break;
        case "order":
          this.setTicket({ type: 'WALK_IN' });
          this.$router.push({ path: '/main/menu' });
          break;
        case "pickup":
          this.setTicket({ type: 'PICK_UP' });
          this.ring && this.setCustomer(this.callLog[0]);
          this.$router.push({ path: '/main/info' });
          break;
        case "delivery":
          this.setTicket({ type: 'DELIVERY' });
          this.ring && this.setCustomer(this.callLog[0]);
          this.$router.push({ path: '/main/info' });
          break;
        case "table":
          this.store.table.layout ?
            this.$router.push({ path: '/main/table' }) :
            this.$dialog({
              title: "dialog.dineInDisabled", msg: "dialog.dineInEnableTip",
              buttons: [{ text: 'button.confirm', fn: 'resolve' }]
            }).then(() => { this.$q() })
          break;
        case "pickupList":
          this.$router.push({ path: '/main/list' })
          break;
        case "history":
          this.$router.push({ path: '/main/history' })
          break;
        case "setting":
          this.approval(this.op.access, route) ?
            this.$router.push({ path: '/main/setting' }) : this.$denyAccess();
          break;
        case "cashDrawer":
          this.station.cashDrawer.enable ? this.cashDrawerAvailable() : this.missCashDrawer();
          break;
        case "lock":
          this.resetDashboard();
          this.$router.push({ path: '/main/lock' });
          break;
        default:
      }
    },
    cashDrawerAvailable(operation) {
      this.approval(this.op.access, "cashdrawer") ? this.cashFlowCtrl() : this.$denyAccess();
    },
    missCashDrawer() {
      this.$dialog({
        title: "dialog.cashDrawerNotAvailable", msg: "dialog.cashDrawerNotAvailableTip",
        buttons: [{ text: 'button.confirm', fn: 'resolve' }]
      }).then(() => { this.$q() })
    },
    cashFlowCtrl() {
      this.store.stuffBank ?
        this.cashInflow(this.op.name) : this.station.cashDrawer.cashFlowCtrl ?
          this.cashInflow(this.station.cashDrawer.name) : Printer.init(this.config).openCashDrawer();
    },
    activateStation() {
      this.$dialog({
        type: "warning", title: 'dialog.stationUnregistered',
        msg: 'dialog.stationUnregisteredTip', buttons: [{ text: 'button.activation', fn: 'resolve' }]
      }).then(() => {
        MAC.getMac((err, mac) => {
          if (err) {
            this.$dialog({
              type: "error", title: 'dialog.stationRegisterFailed', msg: ['dialog.stationRegisterFailedTip', err],
              buttons: [{ text: 'button.confirm', fn: 'resolve' }]
            }).then(() => { this.$q() })
          } else {
            let stations = Object.assign({}, this.store.station);
            let length = Object.keys(stations).length + 1;
            let alies = 'pc' + length;
            let station = Preset.station(alies, mac);
            stations[alies] = station;
            this.$socket.emit("[CONFIG] UPDATE_STATION", stations);
            //ipcRenderer.send("Relaunch");
            this.setStation(station)
            this.setStations(stations)
            this.$q();
          }
        })
      })
    },
    welcomeScreen() {
      let { top, btm } = this.station.pole;
      poleDisplay.write("\f");
      poleDisplay.write(line(top, btm));
    },
    checkClockIn() {
      this.op.timecard && !this.op.clockIn && this.reqClockIn();
    },
    reqClockIn() {
      this.$dialog({
        title: "dialog.clockInRequire", msg: "dialog.clockInRequireTip",
        buttons: [{ text: 'button.confirm', fn: 'resolve' }]
      }).then(() => { this.$q() })
    },
    cashInflow(cashDrawer) {
      new Promise((resolve, reject) => {
        this.$socket.emit("[CASHFLOW] CHECK", { date: today(), cashDrawer, close: false });
        this.$options.sockets["CASHFLOW_RESULT"] = (boolean) => { boolean ? resolve() : reject() }
      }).then(() => { this.recordCashDrawerAction() }).catch(() => { this.askCashIn() })
    },
    askCashIn() {
      this.$dialog({ title: "dialog.cashIn", msg: "dialog.cashInTip" })
        .then(() => { this.countCash(this.station.cashDrawer.initialAmount) }).catch(() => { this.$q() })
    },
    countCash(total) {
      if (isNumber(total) && total > 0) {
        Printer.init(this.config).openCashDrawer();
        this.$dialog({ title: 'dialog.cashInConfirm', msg: this.text('dialog.cashInConfirmTip', parseFloat(total).toFixed(2)) })
          .then(() => { this.cashin(total) }).catch(() => { this.countCash() })
      } else {
        new Promise((resolve, reject) => {
          this.componentData = { resolve, reject };
          this.component = "counter";
        }).then((total) => { this.countCash(total) }).catch(() => { this.$q() })
      }
    },
    cashin(amount) {
      let record = {
        date: today(),
        cashDrawer: this.store.stuffBank ? this.op.name : this.station.cashDrawer.name,
        operator: this.op.name,
        begin: amount.toFixed(2),
        beginTime: +new Date,
        end: null,
        endTime: null,
        close: false,
        activity: [{
          type: "START",
          inflow: parseFloat(amount),
          outflow: 0,
          time: +new Date,
          ticket: null,
          operator: this.op.name
        }]
      }
      this.$socket.emit("[CASHFLOW] CASH_IN_INITIAL", record);
      Printer.init(this.config).setJob("cashin report").print(record);
      this.$q();
    },
    recordCashDrawerAction() {
      Printer.init(this.config).openCashDrawer();
      let cashDrawer = this.store.stuffBank ? this.op.name : this.station.cashDrawer.name;
      let activity = {
        type: "OPEN",
        inflow: 0,
        outflow: 0,
        time: +new Date,
        ticket: null,
        operator: this.op.name
      }
      this.$socket.emit("[CASHFLOW] NEW_ACTIVITY", { cashDrawer, activity });
    },
    ...mapActions(['setApp', 'setTicket', 'setCustomer', 'setStation', 'setStations', 'resetDashboard'])
  },
  computed: {
    ...mapGetters(['op', 'time', 'ring', 'callLog', 'device', 'config', 'store', 'station', 'history'])
  }
  // sockets: {
  //   TICKET_NUMBER(n) {
  //     (this.history.length !== (n - 1)) && this.$socket.emit("INQUIRY_TODAY_ORDER_LIST");
  //   }
  // }
}
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
  transition: background, box-shadow .22s ease;
  position: relative;
}

.card.disable {
  cursor: not-allowed;
}

.card.disable::after {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  background: #fff;
  z-index: 1;
  content: ' ';
}

.card:active {
  background: #f6f6f6;
  color: #666;
  box-shadow: inset 0 1px 6px rgba(0, 0, 0, 0.55);
}

.card:nth-child(n+5) {
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
  font-weight: 500;
  font-size: 46px;
  margin-top: 50px;
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
