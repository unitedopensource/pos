<template>
  <div class="dock">
    <span class="orderNumber">{{ticket.number}}</span>
    <span class="orderType" v-show="ticket.type" @click="toggleSwitcher">{{type}}</span>
    <div class="extra">
      <div class="customer" v-if="$route.name ==='Menu'" @dblclick="modifyInfo">
        <span class="phone" v-show="customer.phone">{{customer.phone | tel}}</span>
        <span class="address" v-show="customer.address">{{customer.address}}</span>
        <span class="name" v-show="customer.name">{{customer.name}}</span>
      </div>
    </div>
    <span class="op" @click="openPanel">
      <i class="fa fa-user"></i>{{op.name}}</span>
    <span class="corner" v-if="$route.name !== 'Dashboard'">{{time | moment('hh:mm a')}}</span>
    <span class="corner right" v-else>
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
import Printer from '../print'
import maintenance from './dock/maintenance'
import dialoger from './common/dialoger'
import switcher from './dock/switcher'
import giftCard from './giftCard/index'
import terminal from './history/terminal'
import opPanel from './dock/opPanel'
import spooler from './dock/spooler'
import caller from './dock/caller'
export default {
  components: { maintenance, caller, switcher, dialoger, opPanel, spooler, giftCard, terminal },
  mounted() {
    setTimeout(() => {
      document.querySelector(".dock").classList.add("slideDown");
    }, 300);
  },
  data() {
    return {
      temp:null,
      component: null,
      componentData: null
    }
  },
  computed: {
    type() {
      if (this.currentTable) {
        let guest = this.currentTable.current.guest > 0 ? " - " + this.currentTable.current.guest : "";
        return this.text(this.ticket.type, this.app.language) + " - " + this.text('SEAT') + " " + this.currentTable.name + guest;
      }
      return this.text(this.ticket.type, this.app.language);
    },
    ...mapGetters(['op', 'app', 'time', 'ring', 'order', 'config', 'ticket', 'update', 'device', 'history', 'station', 'spooler', 'customer', 'language', 'currentTable'])
  },
  watch: {
    ring(n) {
      n ? this.$socket.emit('INQUIRY_CUSTOMER_INFO', String(n.number)) : this.$exitComponent();
    },
    time(n) { 
      this.app.autoLock && this.$route.name !== "Lock" && this.sectionTimeout(n);
      this.spooler.length !== 0 && (n > this.spooler[0].delay) && this.printFromSpooler(0);
    },
    "$route.name"(n,o){
      console.log(n)
    }
  },
  methods: {
    openPanel() {
      this.$route.name === 'Dashboard' && (this.component = this.component === "opPanel" ? null : "opPanel");
    },
    openSpooler() {
      this.$route.name === 'Dashboard' && (this.component = this.component === "spooler" ? null : "spooler");
    },
    toggleSwitcher() {
      if (this.$route.name === 'Menu') {
        let type = this.ticket.type;
        let lack = (!this.customer.phone || !this.customer.address);
        new Promise((resolve, reject) => {
          this.componentData = { lack, type, resolve, reject };
          this.component = "switcher";
        }).then((type) => {
          this.$dialog({
            type: "question", title: 'CONFIRM_ORD_TYP_SW',
            msg: this.text('ORD_TYP_SW', this.text(this.ticket.type), this.text(type))
          }).then(() => {
            if (this.ticket.type === 'DINE_INE') {
              this.resetCurrentTable();
              this.$socket.emit("TABLE_MODIFIED", this.currentTable);
            }
            this.setTicket({ type });
            let content = this.order.content.map(item => {
              item.price = (item.hasOwnProperty("prices") && item.prices[type]) ? item.prices[type] : item.prices.DEFAULT || item.price
              return item;
            })
            this.setOrder({ content });
            if (type === 'DELIVERY' && (!this.customer.address || !this.customer.phone)) this.$router.push({ name: 'Information' });
            if (type === 'DINE_IN') this.$router.push({ name: 'Table' });
            this.$exitComponent();
          }).catch(() => {
            this.$exitComponent();
          })
        }).catch(() => {
          this.$exitComponent();
        })
      }
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
          this.$exitComponent();
          this.resetAll();
          this.$router.push({ path: '/main/lock' });
        }).catch(() => {
          this.setApp({ opLastAction: new Date, autoLock: true });
          this.$exitComponent();
        })
      }
    },
    printConfirm(i) {
      let time = this.spooler[i].delay;
      let schedule = moment(time).format("hh:mm");
      let toNow = moment(time).toNow(true);
      this.$dialog({
        type: "question", title: "PRT_CFM",
        msg: this.text("TIP_PRT_SPOOLER", schedule, toNow),
        buttons: [{ text: "CANCEL", fn: 'reject' }, { text: "PRINT", fn: 'resolve' }]
      }).then(() => {
        this.printFromSpooler(i);
        this.$exitComponent();
      }).catch(() => {
        this.$exitComponent();
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
      this.$socket.emit("ORDER_MODIFIED", order);
    },
    modifyInfo() {
      this.$route.name === 'Menu' && this.$router.push({ name: 'Information' });
    },
    componentEvent(event) {
      this.component = null;
      switch (event.name) {
        case "clockIn":
          this.$dialog({
            type: "question",
            title: "CLOCK_IN_CONFIRM",
            msg: this.text("TIP_CLOCK_IN", moment(this.time).format("hh:mm:ss a")),
            buttons: [{ text: 'CANCEL', fn: 'reject' }, { text: 'CONFIRM', fn: 'resolve' }]
          }).then(() => {
            this.setOp({ clockIn: this.time, timeCard: ObjectId() })
            this.$socket.emit("[TIMECARD] CLOCK_IN", this.op)
            this.$exitComponent();
          }).catch(() => {
            this.$exitComponent();
          })
          break;
        case "clockOut":
          let diff = moment().diff(moment(this.op.clockIn));
          let h = ("0" + Math.floor(diff / 36e5)).slice(-2) + " " + this.text("HOUR");
          let m = ("0" + Math.floor(diff / 6e4)).slice(-2) + " " + this.text("MINUTE");
          this.$dialog({
            type: "question",
            title: "CLOCK_OUT_CONFIRM",
            msg: this.text("TIP_CLOCK_OUT", moment(this.op.clockIn).format("hh:mm:ss a"), (h + " " + m))
          }).then(() => {
            this.$socket.emit("[TIMECARD] CLOCK_OUT", this.op)
            this.setOp({ clockIn: null, timeCard: null });
            this.$exitComponent();
            this.$router.push({ path: '/main/lock' });
          }).catch(() => {
            this.$exitComponent();
          })
          break;
        case "giftCard":
          new Promise((resolve, reject) => {
            this.componentData = { resolve, reject };
            this.component = "giftCard"
          }).then(() => {
            this.$exitComponent();
          }).catch(() => {
            this.$exitComponent();
          })
          break;
        case "station":
          break;
        case "creditCard":
          new Promise((resolve, reject) => {
            this.componentData = { resolve, reject };
            this.component = "terminal"
          }).then(() => { this.$exitComponent() }).catch(() => { this.$exitComponent() })
          break;
      }
    },
    exitComponent() {
      this.$exitComponent();
    },
    ...mapActions([
      'setOp',
      'setApp',
      'setOrder',
      'resetAll',
      'setTicket',
      'setUpdate',
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
      'updateRequestCategory'])
  },
  sockets: {
    connect() {
      this.setApp({ database: true });
    },
    TICKET_NUMBER(number) {
      this.app.mode !== 'edit' && this.setTicket({ number });
    },
    UPDATE_CUSTOMER(customer) {
      console.log(customer);
    },
    UPDATE_TABLE_STATUS(data) {
      this.updateTable(data);
    },
    LAST_UPDATE_TIME(update) {
      if (this.update.table !== update.table) {
        console.log("Ask server for new table status.");
        this.$socket.emit("INQUIRY_ALL_TABLES");
      }
      if (this.update.order !== update.order) {
        this.$socket.emit("INQUIRY_TODAY_ORDER_LIST", moment().subtract(4, "hours").format("YYYY-MM-DD"));
      }
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
    REQUEST_ITEM_UPDATE(data) { this.updateRequestItem(data) },
    REQUEST_ITEM_REMOVE(data) { this.removeRequestItem(data) },
    MENU_CATEGORY_UPDATE(data) { this.updateMenuCategory(data) },
    MENU_CATEGORY_RESORT(data) { this.resortMenuCategory(data) },
    MENU_ITEM_UPDATE(data) { this.updateMenuItem(data) },
    MENU_ITEM_REMOVE(data) { this.removeMenuItem(data) },
    UPDATE_TABLE_SECTION(data) { this.updateTableSection(data) },
    UPDATE_TABLE_INFO(data) { this.updateTableInfo(data) },
    disconnect() { this.setApp({ database: false }) }
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
  width: 140px;
  text-align: center;
  background: rgba(255, 255, 255, 0.1);
  border-left: 1px solid #7994a0;
  border-right: 1px solid #7994a0;
  display: inline-block;
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
  min-width: 115px;
}

.corner.right {
  text-align: right;
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
