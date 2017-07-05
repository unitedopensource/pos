<template>
  <div class="dock">
    <span class="orderNumber">{{ticket.number}}</span>
    <span class="orderType" v-show="ticket.type" @click="toggleSwitcher">{{type}}</span>
    <div class="customer" v-if="$route.name ==='Menu'" @dblclick="modifyInfo">
      <span class="phone" v-show="customer.phone">{{customer.phone | tel}}</span>
      <span class="address" v-show="customer.address">{{customer.address}}</span>
      <span class="name" v-show="customer.name">{{customer.name}}</span>
    </div>
    <span v-if="$route.name ==='History'" class="date">{{time | moment('YYYY-MM-DD')}}</span>
    <span class="op" @click="openPanel">
      <i class="fa fa-user"></i>{{op.name}}</span>
    <span class="corner" v-if="$route.name !== 'Dashboard'">{{time | moment('hh:mm a')}}</span>
    <span class="corner right" v-else>
      <i class="fa fa-phone-square" :class="{oow:!application.callerId}"></i>
      <i class="fa fa-globe oow"></i>
      <i class="fa fa-credit-card oow"></i>
      <i class="fa fa-print spooler" :data-queue="spooler.length" v-show="spooler.length" @click="openSpooler"></i>
      <i class="fa fa-sitemap" :class="{oow:!application.database}"></i>
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
import opPanel from './dock/opPanel'
import spooler from './dock/spooler'
import modal from './dock/modal'
export default {
  components: { maintenance, modal, switcher, dialoger, opPanel, spooler },
  mounted() {
    setTimeout(() => {
      document.querySelector(".dock").classList.add("slideDown");
    }, 300);
    this.$store.watch((state) => state.initialize.time, (n) => {
      this.application.autoLogout && this.opTimeout();
      this.spooler.length !== 0 && (n > this.spooler[0].delay) && this.printFromSpooler(0);
    })
  },
  data() {
    return {
      component: null,
      componentData: null
    }
  },
  computed: {
    type() {
      if (this.currentTable) {
        let guest = this.currentTable.current.guest > 0 ? " - " + this.currentTable.current.guest : "";
        return this.text(this.ticket.type, this.application.language) + " - " + this.text('SEAT') + " " + this.currentTable.name + guest;
      } else {
        return this.text(this.ticket.type, this.application.language);
      }
    },
    ...mapGetters(['application',
      'configuration',
      'currentTable',
      'history',
      'station',
      'spooler',
      'op',
      'time',
      'ticket',
      'update',
      'customer',
      'history',
      'language',
      'order',
      'ring'])
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
        }).then(type => {
          this.$dialog({
            type: "question",
            title: 'CONFIRM_ORD_TYP_SW',
            msg: this.text('ORD_TYP_SW', this.text(this.ticket.type), this.text(type)),
            buttons: [{
              text: this.text('CANCEL'),
              fn: 'reject'
            }, {
              text: this.text('CONFIRM'),
              fn: 'resolve'
            }]
          }).then(() => {
            this.setTicket({ type });
            let content = this.order.content.map(item => {
              item.price = (item.hasOwnProperty("prices") && item.prices[type]) ? item.prices[type] : item.prices.DEFAULT || item.price
              return item;
            })
            this.setOrder({ content });
            //console.log(this.order)
            (type === 'DELIVERY' && (!this.customer.address || !this.customer.phone)) &&
              this.$router.push({ name: 'Information' });
            this.$exitComponent();
          }).catch(() => {
            this.$exitComponent();
          })
        }).catch(() => {
          this.$exitComponent();
        })
      }
    },
    opTimeout(current) {
      let lapse = (current - this.application.opLastAction) / 1000;
      if (lapse > this.station.timeout) {
        this.setApplication({
          autoLogout: false
        });
        this.$dialog({
          title: this.text('AUTO_LOGOUT'),
          msg: this.text('TIP_AUTO_LOGOUT', this.station.timeout),
          timeout: {
            fn: 'resolve',
            duration: 10000
          },
          buttons: [{
            text: this.text('EXTEND'),
            fn: 'reject'
          }]
        }).then(() => {
          this.resetAll();
          this.$router.push({ path: '/Login' });
        }).catch(() => {
          this.setApplication({
            opLastAction: new Date,
            autoLogout: true
          });
          this.$exitComponent();
        })
      }
    },
    printConfirm(i) {
      let time = this.spooler[i].delay;
      let schedule = moment(time).format("hh:mm");
      let toNow = moment(time).toNow(true);
      this.$dialog({
        type: "question",
        title: this.text("PRT_CFM"),
        msg: this.text("TIP_PRT_SPOOLER", schedule, toNow),
        buttons: [{
          text: this.text("CANCEL"),
          fn: 'reject'
        }, {
          text: this.text("PRINT"),
          fn: 'resolve'
        }]
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
      this.spooler[i].content.forEach(item => {
        items.push(item.unique)
      });
      Printer.init(this.configuration).setJob("receipt").print(this.spooler[0]);
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
            buttons:[{text:'CANCEL',fn:'reject'},{text:'CONFIRM',fn:'resolve'}]
          }).then(() => {
            this.setOp({
              clockIn: this.time,
              timeCard: ObjectId()
            })
            console.log(this.op)
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
            msg: this.text("TIP_CLOCK_OUT", moment(this.op.clockIn).format("hh:mm:ss a"), (h + " " + m)),
            buttons: [{
              text: "CANCEL",
              fn: 'reject'
            }, {
              text: "CONFIRM",
              fn: 'resolve'
            }]
          }).then(() => {
            this.$socket.emit("[TIMECARD] CLOCK_OUT", this.op)
            this.setOp({
              clockIn: null,
              timeCard: null
            });
            this.$exitComponent();
            this.$router.push({ path: '/main/lock' });
          }).catch(() => {
            this.$exitComponent();
          })
          break;
      }
    },
    exitComponent() {
      this.$exitComponent();
    },
    ...mapActions(['setTicket',
      'updateMenuItem',
      'removeMenuItem',
      'removeRequestItem',
      'setApplication',
      'updateTable',
      'updateCategory',
      'setUpdate',
      'setCustomer',
      'insertOrder',
      'updateOrder',
      'setTodayOrderHistory',
      'resetAll',
      'setOp',
      'setOrder',
      'removeSpooler',
      'insertCallHistory'])
  },
  sockets: {
    connect() {
      this.setApplication({ database: true });
    },
    TICKET_NUMBER(number) {
      this.application.mode !== 'edit' && this.setTicket({ number });
    },
    UPDATE_CUSTOMER(customer) {
      console.log(customer);
    },
    UPDATE_TABLE(data) {
      console.log("update_table");
      this.updateTable(data);
    },
    INSERT_ORDER(data) {
      this.insertOrder(data);
    },
    UPDATE_ORDER(data) {
      this.updateOrder(data);
    },
    TODAY_ORDER_HISTORY(orders) {
      this.setTodayOrderHistory(orders);
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
      this.insertCallHistory(info);
      this.componentData = info;
      this.component = "modal";
    },
    REQUEST_ITEM_REMOVE(data){
      this.removeRequestItem(data.id);
    },
    CATEGORY_UPDATE(data) {
      this.updateCategory(data);
    },
    TIMECARD_REPORT(data) {
      Printer.init(this.configuration).setJob("timeCard report").print(data);
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
    MENU_ITEM_UPDATE(data) {
      this.updateMenuItem(data);
    },
    MENU_ITEM_REMOVE(data) {
      console.log(data);
      this.removeMenuItem(data);
    },
    disconnect() {
      this.setApplication({ database: false });
    }
  },
  watch: {
    ring(n) {
      n ?
        this.$socket.emit('INQUIRY_CUSTOMER_INFO', String(n.number)) :
        this.$exitComponent();
    }
  }
}
</script>

<style scoped>
.dock {
  width: 100%;
  height: 35px;
  background: #607D8B;
  box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.25), inset 0px 1px 0px rgba(255, 255, 255, 0.3);
  position: absolute;
  top: -35px;
  left: 0;
  z-index: 99;
  font-size: 1.25em;
}

.dock>span {
  text-shadow: 0px 1px 1px rgba(0, 0, 0, 0.33);
  color: #fff;
}

.dock.slideDown {
  transform: translateY(35px);
  transition: transform 0.22s ease-out;
}

span.corner {
  padding: 8px 10px 4px;
  width: 125px;
  text-align: center;
  float: right;
}

.corner.right {
  text-align: right;
}

span.op {
  position: absolute;
  right: 144px;
  top: 0px;
  padding: 7px 20px 5px;
  background: rgba(255, 255, 255, 0.1);
}

span.op i {
  margin-right: 10px;
}

span.orderNumber {
  padding: 8px 20px 5px;
  width: 20px;
  text-align: center;
  display: inline-block;
}

span.table {
  display: inline-block;
  margin-left: 10px;
}

span.orderType {
  padding: 8px 20px 5px;
  min-width: 80px;
  text-align: center;
  background: rgba(255, 255, 255, 0.1);
  display: inline-block;
}

.customer {
  display: inline-block;
  position: absolute;
  width: 455px;
  right: 285px;
  top: 3px;
  padding-top: 3px;
  font-size: 0.8em;
}

.customer span {
  padding: 3px 5px 2px;
  display: inline-block;
  border-radius: 4px;
  max-width: 200px;
  overflow: hidden;
  white-space: nowrap;
  background: rgba(255, 255, 255, 0.7);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

.customer span.name {
  margin-right: 0;
}

.oow {
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
