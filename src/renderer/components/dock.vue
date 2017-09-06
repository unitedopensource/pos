<template>
  <transition name="slideDown" appear>
    <div class="dock">
      <span class="orderNumber">{{ticket.number}}</span>
      <span class="orderType" v-show="ticket.type" @click="toggleSwitcher">{{type}}</span>
      <div class="extra">
        <div class="customer" v-if="$route.name ==='Menu'" @click="modifyInfo">
          <span class="phone" v-show="customer.phone">{{customer.phone | tel}}</span>
          <span class="address" v-show="customer.address">{{customer.address}}</span>
          <span class="name" v-show="customer.name">{{customer.name}}</span>
        </div>
      </div>
      <span class="op" @click="openPanel">
        <i class="fa fa-user"></i>{{op.name}}</span>
      <span class="corner" v-show="$route.name !== 'Dashboard'">{{time | moment('hh:mm')}}
        <span class="shift">{{time | moment('a')}}</span>
      </span>
      <span class="corner" v-show="$route.name === 'Dashboard'">
        <i class="fa fa-phone-square" :class="{NA:!device.callid}"></i>
        <i class="fa fa-globe NA"></i>
        <i class="fa fa-credit-card" :class="{NA:!device.terminal}"></i>
        <i class="fa fa-desktop" :class="{NA:!device.poleDisplay}"></i>
        <i class="fa fa-print spooler" :data-queue="spooler.length" v-show="spooler.length" @click="openSpooler"></i>
        <i class="fa fa-sitemap" :class="{NA:!app.database}"></i>
      </span>
      <div :is="component" :init="componentData" @exit="exitComponent" @print="printConfirm" @trigger="componentEvent"></div>
    </div>
  </transition>
</template>

<script>
import { mapGetters, mapActions } from "vuex"
import maintenance from './dock/maintenance'
import terminal from './history/terminal'
import dialoger from './common/dialoger'
import giftCard from './giftCard/index'
import switcher from './dock/switcher'
import notifier from './dock/notifier'
import { ipcRenderer } from 'electron'
import spooler from './dock/spooler'
import opPanel from './dock/opPanel'
import caller from './dock/caller'
import Printer from '../print'
export default {
  components: { maintenance, caller, switcher, dialoger, opPanel, spooler, giftCard, terminal, notifier },
  data() {
    return {
      component: null,
      componentData: null
    }
  },
  computed: {
    type() {
      let type = this.app.mode === 'create' ? 'type.' + this.ticket.type : 'type.' + this.order.type;

      return this.ticket.type === 'DINE_IN'
        ? this.$t(type, this.app.language) + (this.order.table ? ' - ' + this.order.table + (this.order.guest > 0 ? ' - ' + this.order.guest : '') : '')
        : this.$t(type, this.app.language);
    },
    ...mapGetters(['op', 'app', 'time', 'ring', 'order', 'config', 'ticket', 'update', 'device', 'history', 'station', 'spooler', 'customer', 'language', 'currentTable'])
  },
  watch: {
    ring(n) {
      n ? this.$socket.emit('[RING] CALLER_ID', String(n.number)) : this.$q();
    },
    time(n) {
      this.app.autoLock && this.$route.name !== "Lock" && this.sectionTimeout(n);
      this.spooler.length !== 0 && (n > this.spooler[0].delay) && this.printFromSpooler(0);
    }
    // "$route.name"(n, o) {
    //   if (n === 'Table' && o === 'Menu') {
    //     this.temp = JSON.stringify(this.order)
    //   }
    //   if (n === 'Menu' && o === 'Table' && this.temp) {
    //     this.order = this.setOrder(JSON.parse(this.temp));
    //     this.temp = null;
    //   }
    // }
  },
  methods: {
    openPanel() {
      this.$route.name === 'Dashboard' && this.$p("opPanel");
    },
    openSpooler() {
      this.$route.name === 'Dashboard' && this.$p("spooler");
    },
    toggleSwitcher() {
      if (this.$route.name === 'Menu') {
        let lack = (!this.customer.phone || !this.customer.address);
        new Promise((resolve, reject) => {
          this.componentData = { lack, type: this.ticket.type, resolve, reject };
          this.component = "switcher";
        }).then((type) => { this.confirmSwitch(type) }).catch(() => { this.$q() })
      }
    },
    applyPrice(type) {
      let content = this.order.content.map(item => {
        item.price = (item.hasOwnProperty("prices") && item.prices[type]) ? item.prices[type] : item.prices.DEFAULT || item.price
        return item;
      })
      this.setOrder({ content });
    },
    confirmSwitch(type) {
      this.$dialog({
        type: "question", title: 'dialog.orderTypeSwitchConfirm',
        msg: ['dialog.orderTypeSwitchTip', this.$t('type.' + this.ticket.type), this.$t('type.' + type)]
      }).then(() => {
        if (this.ticket.type === 'DINE_INE') {
          this.resetCurrentTable();
          this.$socket.emit("TABLE_MODIFIED", this.currentTable);
          this.resetTable();
        }
        this.setTicket({ type });
        this.applyPrice(type);
        type === 'PICK_UP' && this.$router.push({ name: 'Information' });
        (type === 'DELIVERY' && (!this.customer.address || !this.customer.phone)) && this.$router.push({ name: 'Information' });
        type === 'DINE_IN' && this.$router.push({ name: 'Table' });
        this.$q()
      }).catch(() => { this.$q() })
    },
    sectionTimeout(current) {
      let lapse = Math.round((current - this.app.lastActivity) / 1000);
      if (lapse >= this.station.timeout) {
        this.setApp({ autoLock: false });
        this.$dialog({
          title: 'dialog.autoLock',
          timeout: { fn: 'resolve', duration: 10000 },
          msg: ['dialog.autoLockTip', this.station.timeout],
          buttons: [{ text: 'button.extend', fn: 'reject' }]
        }).then(() => {
          this.$q();
          this.resetAll();
          this.$router.push({ path: '/main/lock' })
        }).catch(() => {
          this.$q();
          this.setApp({ lastActivity: new Date().getTime(), autoLock: true });
        })
      }
    },
    printConfirm(i) {
      let time = this.spooler[i].delay;
      let schedule = moment(time).format("hh:mm");
      let toNow = moment(time).toNow(true);
      this.$dialog({
        type: "question", title: "dialog.printConfirm", msg: ["dialog.printSpoolerTip", schedule, toNow],
        buttons: [{ text: "button.cancel", fn: 'reject' }, { text: "button.print", fn: 'resolve' }]
      }).then(() => {
        this.printFromSpooler(i);
        this.$q();
      }).catch(() => { this.$q() })
    },
    printFromSpooler(i) {
      let _id = this.spooler[i]._id;
      let items = [];
      this.spooler[i].content.forEach(item => { items.push(item.unique) });
      Printer.init(this.config).setJob("receipt").print(this.spooler[0]);
      this.removeSpooler(i);
      let index = this.history.findIndex(order => order._id === _id);
      let order = Object.assign({}, this.history[index]);
      items.forEach(unique => {
        for (let i = 0; i < order.content.length; i++) {
          if (order.content[i].unique === unique) {
            order.content[i].print = true;
            order.content[i].pending = false;
            break;
          }
        }
      });
      let isPrint = true;
      order.content.forEach(item => { !item.print && (isPrint = false) });
      order.print = isPrint;
      this.$socket.emit("[UPDATE] INVOICE", order);
    },
    modifyInfo() {
      this.$route.name === 'Menu' && this.$router.push({ name: 'Information' });
    },
    clockIn() {
      this.$dialog({
        type: "question", title: "dialog.clockInConfirm",
        msg: ["dialog.clockInTip", moment(this.time).format("hh:mm:ss a")]
      }).then(() => {
        this.setOp({ clockIn: this.time, timeCard: ObjectId() })
        this.$socket.emit("[TIMECARD] CLOCK_IN", this.op)
        this.$q();
      }).catch(() => { this.$q() })
    },
    clockOut() {
      let diff = moment().diff(moment(this.op.clockIn));
      let h = ("0" + Math.floor(diff / 36e5)).slice(-2) + " " + this.$t("text.hour");
      let m = ("0" + Math.floor(diff / 6e4)).slice(-2) + " " + this.text("text.minute");
      this.$dialog({
        type: "question", title: "dialog.clockOutConfirm",
        msg: ["clockOutTip", moment(this.op.clockIn).format("hh:mm:ss a"), (h + " " + m)]
      }).then(() => {
        this.$socket.emit("[TIMECARD] CLOCK_OUT", this.op)
        this.setOp({ clockIn: null, timeCard: null });
        this.$q();
        this.$router.push({ path: '/main/lock' });
      }).catch(() => { this.$q() })
    },
    cashingOut(cashDrawer) {
      this.$socket.emit("[CASHFLOW] SETTLE", cashDrawer);
      new Promise((resolve) => { this.$options.sockets["CASHFLOW_SETTLE"] = (cashflow) => { resolve(cashflow) } })
        .then((cashflow) => { this.reconciliation(cashflow) })
    },
    reconciliation(cashflow) {
      this.recordCashDrawerAction();
      let diff = (parseFloat(cashflow.end) - parseFloat(cashflow.begin)).toFixed(2);
      let msg = this.$t("cashOutSettleTip", cashflow.begin, diff, cashflow.end);
      this.$dialog({
        type: "question", title: ["cashOutSettle", cashflow.end], msg: ["cashOutSettleTip", cashflow.begin],
        buttons: [{ text: "button.printDetail", fn: "reject" }, { text: 'button.print', fn: 'resolve' }]
      }).then(() => {
        Printer.init(this.config).setJob("cashout report").print(cashflow);
        this.$router.push({ path: '/Login' });
      }).catch(() => {
        Printer.init(this.config).setJob("detail cashout report").print(cashflow);
        this.$router.push({ path: '/Login' });
      })
    },
    recordCashDrawerAction() {
      this.op.cashCtrl === 'enable' && Printer.init(this.config).openCashDrawer();

      let activity = {
        type: "END",
        inflow: 0,
        outflow: 0,
        time: +new Date,
        ticket: null,
        operator: this.op.name
      }
      this.$socket.emit("[CASHFLOW] ACTIVITY", { cashDrawer: this.op.cashCtrl === 'enable' ? this.station.cashDrawer.name : this.op.name, activity })
    },
    componentEvent(event) {
      this.component = null;
      switch (event.name) {
        case "clockIn":
          this.clockIn();
          break;
        case "clockOut":
          this.clockOut();
          break;
        case "giftCard":
          this.$p("giftCard");
          break;
        case "station":
          break;
        case "cashOut":
          switch (this.op.cashCtrl) {
            case "enable":
              this.checkCashOut(this.station.cashDrawer.name, false)
              break;
            case "stuffBank":
              this.checkCashOut(this.op.name, true)
              break;
            default:
              this.$router.push({ path: '/Login' })
          }
          break;
        case "creditCard":
          this.$p("terminal")
          break;
      }
    },
    checkCashOut(cashDrawer, stuffBank) {
      new Promise((resolve, reject) => {
        this.$socket.emit("[CASHFLOW] CHECK", { date: today(), cashDrawer, close: false });
        this.$options.sockets["CASHFLOW_RESULT"] = (data) => {
          let { name, initial } = data;
          initial ? reject() : resolve(name)
        }
      }).then((name) => {
        stuffBank ? this.askSelfCashOut(name) : this.askCashOut(name)
      }).catch(() => {
        this.$router.push({ path: '/Login' })
      })
    },
    askCashOut(cashDrawer) {
      this.$dialog({ type: "question", title: "dialog.cashOut", msg: ["dialog.cashOutTip", cashDrawer] })
        .then(() => { this.cashingOut(cashDrawer) }).catch(() => { this.$router.push({ path: '/Login' }) })
    },
    askSelfCashOut(name) {
      this.$dialog({ type: "question", title: "dialog.selfCashOut", msg: "dialog.selfCashOutTip" })
        .then(() => { this.cashingOut(name) }).catch(() => { this.$router.push({ path: '/Login' }) })
    },
    exitComponent() {
      this.$q()
    },
    ...mapActions([
      'setOp',
      'setApp',
      'setOrder',
      'resetAll',
      'setTicket',
      'setUpdate',
      'syncTables',
      'resetTable',
      'setCustomer',
      'insertOrder',
      'setLastSync',
      'updateOrder',
      'updateTable',
      'newPhoneCall',
      'setTableInfo',
      'setTodayOrder',
      'removeSpooler',
      'updateMenuItem',
      'removeMenuItem',
      'newReservation',
      'setReservation',
      'updateTableInfo',
      'updateReservation',
      'resetCurrentTable',
      'updateRequestItem',
      'removeRequestItem',
      'updateMenuCategory',
      'resortMenuCategory',
      'updateTableSection',
      'updateRequestAction',
      'updateRequestCategory'])
  },
  sockets: {
    connect() {
      this.setApp({ database: true });
      this.component === 'notifier' && (this.component = null);
      this.$socket.emit("INQUIRY_TICKET_NUMBER")
    },
    TICKET_NUMBER(number) {
      this.app.mode !== 'edit' && this.setTicket({ number });
    },
    UPDATE_TABLE_STATUS(data) {
      this.updateTable(data)
    },
    CALLER_ID(customer) {
      this.newPhoneCall(customer);
      this.$p("caller", { customer })
    },
    TIMECARD_REPORT(data) {
      Printer.init(this.config).setJob("timeCard report").print(data);
    },
    GOOGLE_ADDRESS_DISTANCE(res) {
      if (res.statusCode === 200) {
        let results = JSON.parse(res.body);
        let result = results.rows[0].elements[0];
        let city = results.destination_addresses[0].split(",")[1].trim().toUpperCase();
        let distance = result.distance.text;
        let duration = result.duration.text;
        this.setCustomer({
          distance, duration,
          city: this.customer.city ? this.customer.city : city
        });
      }
    },
    MAINT_COMMAND(code) {
      switch (code) {
        case "ban":
          this.component = "maintenance";
          break;
        case "unban":
          this.component = null;
          break;
      }
    },
    INSERT_ORDER(data) { this.insertOrder(data) },
    UPDATE_ORDER(data) { this.updateOrder(data) },
    SYNC_ORDERS(data) { this.setTodayOrder(data) },
    SYNC_TABLES(data) { this.syncTables(data) },
    REQUEST_CATEGORY_UPDATE(data) { this.updateRequestCategory(data) },
    REQUEST_ACTION_UPDATE(data) { this.updateRequestAction(data) },
    REQUEST_ITEM_UPDATE(data) { this.updateRequestItem(data) },
    REQUEST_ITEM_REMOVE(data) { this.removeRequestItem(data) },
    MENU_CATEGORY_UPDATE(data) { this.updateMenuCategory(data) },
    MENU_CATEGORY_RESORT(data) { this.resortMenuCategory(data) },
    MENU_ITEM_UPDATE(data) { this.updateMenuItem(data) },
    MENU_ITEM_REMOVE(data) { this.removeMenuItem(data) },
    UPDATE_TABLE_SECTION(data) { this.updateTableSection(data) },
    UPDATE_TABLE_INFO(data) { this.updateTableInfo(data) },
    NEW_RESERVATION(data) { this.newReservation(data) },
    UPDATE_RESERVATION(data) { this.updateReservation(data) },
    SYNC_RESERVATIONS(data) {
      let { sync, reservations } = data;
      this.setReservation(reservations);
      this.setLastSync(sync);
    },
    SHUTDOWN() {
      ipcRenderer.send("Shutdown")
    },
    disconnect() {
      this.setApp({ database: false });
      this.$p("notifier")
    }
  }
}
</script>

<style scoped>
.dock {
  width: 100%;
  height: 30px;
  background: linear-gradient(to bottom, rgb(255, 255, 255) 20%, #aba9a9 100%);
  box-shadow: 0px 1px 3px rgba(0, 0, 0, 0.85), inset 0px 1px 3px rgba(255, 255, 255, 1);
  position: absolute;
  top: 0;
  left: 0;
  z-index: 99;
  font-size: 1.25em;
  display: flex;
  align-items: center;
  color: #333;
}

.dock>span {
  font-family: 'Agency FB';
  font-weight: bold;
  text-shadow: 0 1px 1px #fff;
  font-size: 18px;
}

.slideDown-enter-active,
.slideDown-leave-active {
  transition: all .5s ease-in-out;
}

.slideDown-enter,
.slideDown-leave-to {
  opacity: 0;
  transform: translateY(-35px);
}
























/* .dock.slideDown {
  transform: translateY(35px);
  transition: transform 0.22s ease-out;
} */

span.orderNumber {
  width: 60px;
  text-align: center;
  letter-spacing: 1px;
  font-size: 22px;
}

span.orderType {
  min-width: 100px;
  text-align: center;
  font-family: inherit;
}

.extra {
  flex: 1;
  display: flex;
}

.customer {
  flex: 1;
  display: flex;
  justify-content: center;
}

.customer span {
  padding: 0 10px;
  margin: 0 5px;
}

span.op {
  min-width: 150px;
  text-align: center;
}

span.corner {
  padding: 0px 10px;
  min-width: 135px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.corner i {
  margin-right: 5px;
}

span.op i {
  margin-right: 10px;
}

span.table {
  display: inline-block;
  margin-left: 10px;
}

.NA {
  color: #9E9E9E;
}

.spooler {
  position: relative;
}

.spooler:after {
  content: ' ';
  color: #fff;
  position: absolute;
  right: 0;
  bottom: 0;
  background: #FF5722;
  border-radius: 50%;
  padding: 4px;
}

.shift {
  font-family: 'Yuanti-SC';
  font-size: 16px;
  margin: 5px;
}
</style>
