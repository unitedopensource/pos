<template>
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
    <span class="corner" v-if="$route.name !== 'Dashboard'">{{time | moment('hh:mm a')}}</span>
    <span class="corner" v-else>
      <i class="fa fa-phone-square" :class="{NA:!device.callid}"></i>
      <i class="fa fa-globe NA"></i>
      <i class="fa fa-credit-card" :class="{NA:!device.terminal}"></i>
      <i class="fa fa-desktop" :class="{NA:!device.poleDisplay}"></i>
      <i class="fa fa-print spooler" :data-queue="spooler.length" v-show="spooler.length" @click="openSpooler"></i>
      <i class="fa fa-sitemap" :class="{NA:!app.database}"></i>
    </span>
    <div :is="component" :init="componentData" @exit="exitComponent" @print="printConfirm" @trigger="componentEvent"></div>
  </div>
</template>

<script>
import moment from 'moment'
import { mapGetters, mapActions } from "vuex"
import maintenance from './dock/maintenance'
import terminal from './history/terminal'
import dialoger from './common/dialoger'
import giftCard from './giftCard/index'
import switcher from './dock/switcher'
import notifier from './dock/notifier'
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
  mounted() {
    setTimeout(() => { toggleClass(".dock", "slideDown") }, 300);
  },
  computed: {
    type() {
      let type = 'type.'+this.ticket.type;
      if (this.currentTable) {
        let guest = this.currentTable.current.guest > 0 ? " - " + this.currentTable.current.guest : "";
        return this.$t(type, this.app.language) + " - " + this.text('SEAT') + " " + this.currentTable.name + guest;
      }
      return this.$t(type, this.app.language);
    },
    ...mapGetters(['op', 'app', 'time', 'ring', 'order', 'config', 'ticket', 'update', 'device', 'history', 'station', 'spooler', 'customer', 'language', 'currentTable'])
  },
  watch: {
    ring(n) {
      n ? this.$socket.emit('INQUIRY_CUSTOMER_INFO', String(n.number)) : this.$q();
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
        type: "question", title: 'CONFIRM_ORD_TYP_SW', msg: this.text('ORD_TYP_SW', this.text(this.ticket.type), this.text(type))
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
      let lapse = (current - this.app.opLastAction) / 1000;
      if (lapse > this.station.timeout) {
        this.setApp({ autoLock: false });
        this.$dialog({
          title: 'AUTO_LOGOUT', msg: this.text('TIP_AUTO_LOGOUT', this.station.timeout),
          timeout: { fn: 'resolve', duration: 10000 },
          buttons: [{ text: 'EXTEND', fn: 'reject' }]
        }).then(() => {
          this.$q();
          this.resetAll();
          this.$router.push({ path: '/main/lock' });
        }).catch(() => {
          this.setApp({ opLastAction: new Date, autoLock: true });
          this.$q();
        })
      }
    },
    printConfirm(i) {
      let time = this.spooler[i].delay;
      let schedule = moment(time).format("hh:mm");
      let toNow = moment(time).toNow(true);
      this.$dialog({
        type: "question", title: "PRT_CFM", msg: this.text("TIP_PRT_SPOOLER", schedule, toNow), buttons: [{ text: "CANCEL", fn: 'reject' }, { text: "PRINT", fn: 'resolve' }]
      }).then(() => {
        this.printFromSpooler(i);
        this.$q();
      }).catch(() => {
        this.$q();
      })
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
      order.content.forEach(item => {
        if (!item.print) isPrint = false;
      });
      order.print = isPrint;
      this.$socket.emit("[UPDATE] INVOICE", order);
    },
    modifyInfo() {
      this.$route.name === 'Menu' && this.$router.push({ name: 'Information' });
    },
    clockIn() {
      this.$dialog({ type: "question", title: "CLOCK_IN_CONFIRM", msg: this.text("TIP_CLOCK_IN", moment(this.time).format("hh:mm:ss a")) }).then(() => {
        this.setOp({ clockIn: this.time, timeCard: ObjectId() })
        this.$socket.emit("[TIMECARD] CLOCK_IN", this.op)
        this.$q();
      }).catch(() => { this.$q() })
    },
    clockOut() {
      let diff = moment().diff(moment(this.op.clockIn));
      let h = ("0" + Math.floor(diff / 36e5)).slice(-2) + " " + this.text("HOUR");
      let m = ("0" + Math.floor(diff / 6e4)).slice(-2) + " " + this.text("MINUTE");
      this.$dialog({ type: "question", title: "CLOCK_OUT_CONFIRM", msg: this.text("TIP_CLOCK_OUT", moment(this.op.clockIn).format("hh:mm:ss a"), (h + " " + m)) }).then(() => {
        this.$socket.emit("[TIMECARD] CLOCK_OUT", this.op)
        this.setOp({ clockIn: null, timeCard: null });
        this.$q();
        this.$router.push({ path: '/main/lock' });
      }).catch(() => { this.$q() })
    },
    cashingOut(cashDrawer) {
      this.$socket.emit("[CASHFLOW] SETTLE", cashDrawer);
      new Promise((resolve) => { this.$options.sockets["CASHFLOW_SETTLE"] = (cashflow) => { resolve(cashflow) } }).then((cashflow) => { this.reconciliation(cashflow) })
    },
    reconciliation(cashflow) {
      this.recordCashDrawerAction();
      this.$dialog({
        type: "question", title: this.text("CASH_OUT_SETTLE", cashflow.end), msg: this.text("TIP_CASH_OUT_SETTLE", cashflow.begin),
        buttons: [{ text: "PRINT_DETAIL", fn: "reject" }, { text: 'PRINT', fn: 'resolve' }]
      }).then(() => {
        Printer.setJob("cashout report").print(cashflow);
        this.$router.push({ path: '/Login' });
      }).catch(() => {
        Printer.setJob("detail cashout report").print(cashflow);
        this.$router.push({ path: '/Login' });
      })
    },
    recordCashDrawerAction() {
      Printer.init(this.config).openCashDrawer();
      let cashDrawer = this.config.store.stuffBank ? this.op.name : this.station.cashDrawer.name;
      let activity = {
        type: "END",
        inflow: 0,
        outflow: 0,
        time: +new Date,
        ticket: null,
        operator: this.op.name
      }
      this.$socket.emit("[CASHFLOW] NEW_ACTIVITY", { cashDrawer, activity });
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
          let cashDrawer = this.config.store.stuffBank ? this.op.name : this.station.cashDrawer.name;
          this.$dialog({ type: "question", title: "CASH_OUT_REQ", msg: this.text("TIP_CASH_OUT_REQ", cashDrawer) })
            .then(() => { this.cashingOut(cashDrawer) }).catch(() => { this.$router.push({ path: '/Login' }) })
          break;
        case "creditCard":
          this.$p("terminal");
          break;
      }
    },
    exitComponent() {
      this.$q();
    },
    ...mapActions([
      'setOp',
      'setApp',
      'setOrder',
      'resetAll',
      'setTicket',
      'setUpdate',
      'resetTable',
      'setCustomer',
      'insertOrder',
      'updateOrder',
      'updateTable',
      'newPhoneCall',
      'setTableInfo',
      'setTodayOrder',
      'removeSpooler',
      'updateMenuItem',
      'removeMenuItem',
      'updateTableInfo',
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
      this.updateTable(data);
    },
    LAST_UPDATE_TIME(update) {
      this.update.table !== update.table && this.$socket.emit("INQUIRY_ALL_TABLES");
      this.update.order !== update.order && this.$socket.emit("INQUIRY_TODAY_ORDER_LIST", today());
    },
    CUSTOMER_ENQUIRE_RESULT(info) {
      this.newPhoneCall(info);
      this.componentData = info;
      this.component = "caller";
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
    TODAY_ORDER_HISTORY(orders) { this.setTodayOrder(orders) },
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
  line-height: 30px;
  background: #607D8B;
  box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.25), inset 0px 1px 0px rgba(255, 255, 255, 0.3);
  position: absolute;
  top: -35px;
  left: 0;
  z-index: 99;
  font-size: 1.25em;
  display: flex;
  align-items: center;
}

.dock>span {
  text-shadow: 0px 1px 1px rgba(0, 0, 0, 0.33);
  color: #fff;
}

.dock.slideDown {
  transform: translateY(35px);
  transition: transform 0.22s ease-out;
}

span.orderNumber {
  width: 80px;
  text-align: center;
}

span.orderType {
  min-width: 140px;
  padding: 0 10px;
  text-align: center;
  background: rgba(255, 255, 255, 0.1);
  border-left: 1px solid #7994a0;
  border-right: 1px solid #7994a0;
}

.extra {
  flex: 1;
  display: flex;
}

.customer {
  flex: 1;
  display: flex;
  justify-content: center;
  color: #fff;
  font-family: 'Agency FB';
}

.customer span {
  padding: 0 10px;
  background: rgba(255, 255, 255, 0.1);
  border-left: 1px solid #7994a0;
  border-right: 1px solid #7994a0;
  margin: 0 5px;
}

span.op {
  background: rgba(255, 255, 255, 0.1);
  border-left: 1px solid #7994a0;
  border-right: 1px solid #7994a0;
  width: 150px;
  text-align: center;
}

span.corner {
  padding: 0 10px;
  text-align: center;
  min-width: 135px;
}

span.op i {
  margin-right: 10px;
}

span.table {
  display: inline-block;
  margin-left: 10px;
}

.NA {
  color: #F4511E;
}

.spooler {
  position: relative;
}

.spooler:after {
  content: attr(data-queue);
  color: #fff;
  position: absolute;
  right: -6px;
  bottom: 10px;
  display: block;
  font-size: 0.7em;
  background: #FF5722;
  border-radius: 2px;
  border-top: none;
  min-width: 12px;
  padding: 2px;
  line-height: 12px;
  text-align: center;
  font-family: "Agency FB";
}
</style>
