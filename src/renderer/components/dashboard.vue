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
import { ipcRenderer } from 'electron'
import { mapActions, mapGetters } from 'vuex'
import moment from 'moment'
import Preset from '../preset'
import MAC from 'getmac'
import dialoger from './common/dialoger'
export default {
  data() {
    return {
      component: null,
      componentData: null
    }
  },
  mounted() {
    this.$socket.emit("INQUIRY_TICKET_NUMBER");
    CLODOP.webskt.onclose = function (e) { };
    if (!this.station) {
      this.activateStation();
    } else {
      this.device.poleDisplay && this.welcome();
      this.store.timeCard && this.checkClockIn();
    }
  },
  methods: {
    go(grid) {
      this.setApp({ opLastAction: new Date });
      if (!grid.enable) return;
      let route = grid.route;
      switch (route) {
        case "sale":
          this.setTicket({ type: 'PAYMENT' });
          this.$router.push({ path: '/main/menu' });
          break;
        case "order":
          this.setTicket({ type: 'WALK_IN' });
          this.$router.push({ path: '/main/menu' });
          break;
        case "pickup":
          this.setTicket({ type: 'PICK_UP' });
          this.$router.push({ path: '/main/info' });
          break;
        case "delivery":
          this.setTicket({ type: 'DELIVERY' });
          this.ring && this.setCustomer(this.callHistory[0]);
          this.$router.push({ path: '/main/info' });
          break;
        case "table":
          if (this.store.table.layout) {
            this.$router.push({ path: '/main/table' });
          } else {
            this.$dialog({ title: "DINE_IN_DISABLED", msg: "TIP_DINE_IN_ENABLE" }).then(() => { this.$exitComponent() })
          }
          break;
        case "history":
          this.$router.push({ path: '/main/history' });
          break;
        case "setting":
          this.approval(this.op.access, route) ?
            this.$router.push({ path: '/main/setting' }) :
            this.$denyAccess();
          break;
        case "cashDrawer":
          if (!this.approval(this.op.access, "cashdrawer")) {
            this.$denyAccess();
            return;
          }
          CLODOP.SEND_PRINT_RAWDATA(String.fromCharCode(27) + String.fromCharCode(112) + String.fromCharCode(48) + String.fromCharCode(55) + String.fromCharCode(221))
          break;
        case "lock":
          this.resetDashboard();
          this.$router.push({ path: '/main/lock' });
          break;
        default:
      }
    },
    activateStation() {
      this.$dialog({
        type: "warning", title: 'STA_UNREG', msg: 'TIP_REG_STA', buttons: [{ text: 'ACTIVATION', fn: 'resolve' }]
      }).then(() => {
        MAC.getMac((err, mac) => {
          if (err) {
            this.$dialog({ type: "error", title: 'STA_REG_F', msg: this.text('TIP_REASON', err), buttons: [{ text: 'CANCEL', fn: 'resolve' }] }).then(() => { this.$exitComponent() });
          } else {
            let stations = Object.assign({}, this.store.station);
            let length = Object.keys(stations).length + 1;
            let alies = 'pc' + length;
            let station = Preset.station(alies, mac);
            stations[alies] = station;
            this.$socket.emit("[CONFIG] UPDATE_STATION", stations);

            //ipcRenderer.send("Relaunch");
            this.setStation(station)
            this.$exitComponent();
          }
        })
      })
    },
    welcome() {
      poleDisplay.write("\f");
      poleDisplay.write(line(this.station.pole.top, this.station.pole.btm));
    },
    checkClockIn() {
      this.op.wage.includes("H") && !this.op.clockIn && this.$dialog({ title: "CLOCK_IN_REQ", msg: "TIP_CLOCK_IN_REQ" }).then(() => { this.$exitComponent() })
    },
    ...mapActions(['setStation', 'setTicket', 'resetDashboard', 'setCustomer', 'setApp'])
  },
  computed: {
    ...mapGetters(['store', 'station', 'time', 'op', 'ring', 'callHistory', 'device'])
  },
  components: {
    dialoger
  }
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
  color: gray;
}

h1 {
  font-weight: 500;
  font-size: 3em;
  margin-top: 45px;
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
