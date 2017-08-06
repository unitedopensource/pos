<template>
  <div class="dineIn">
    <section class="blueprint">
      <div class="tableSection">
        <div class="section btn" v-for="(section,index) in tables" @click="switchView(section)" :key="index">{{section[language]}}</div>
        <div class="section bottom">
          <div class="section btn" @click="getReservation">
            <i class="fa fa-user-o"></i>
            <span class="text">{{text("RESERVATION")}}</span>
          </div>
          <div class="section btn">
            <i class="fa fa-list-alt"></i>
            <span class="text">{{text("VIEW_LIST")}}</span>
          </div>
        </div>
      </div>
      <div class="tableWrap">
        <div class="table" v-for="(table,index) in sectionView" @click="selectTable(table,$event)" @contextmenu="forceSelectTable(table,$event)" :key="index">
          <span :class="[{occupy:table.status === 2,prePay:table.status === 3,paid:table.status === 4},table.shape]" class="icon"></span>
          <span class="name">{{table.name}}</span>
        </div>
      </div>
    </section>
    <section class="cart">
      <div class="invoice">
        <order-list @update="setPayment" @popup="setDialog" display="true"></order-list>
        <div class="function">
          <button class="btn" @click="editOrder" :disabled="order.content.length === 0">
            <i class="fa fa-list-alt"></i>
            <span class="text">{{text("EDIT_ORDER")}}</span>
          </button>
          <button class="btn" @click="startSwitchTable">
            <i class="fa fa-exchange"></i>
            <span class="text">{{text("SWITCH_TABLE")}}</span>
          </button>
          <div class="btn">
            <i class="fa fa-hand-paper-o"></i>
            <span class="text">{{text("COMBINE_TABLE")}}</span>
          </div>
          <div class="btn" @click="prePayment">
            <i class="fa fa-print"></i>
            <span class="text">{{text("RECEIPT")}}</span>
          </div>
          <div class="btn" @click="settle">
            <i class="fa fa-money"></i>
            <span class="text">{{text("PAYMENT")}}</span>
          </div>
          <div class="btn">
            <i class="fa fa-user-times"></i>
            <span class="text">{{text("SWITCH")}}</span>
          </div>
          <div class="btn" @click="split">
            <i class="fa fa-clone"></i>
            <span class="text">{{text("SPLIT")}}</span>
          </div>
          <div class="btn" @click="exit">
            <i class="fa fa-times"></i>
            <span class="text">{{text("EXIT")}}</span>
          </div>
          <div class="btn" @click="clearTable">
            <i class="fa fa-recycle"></i>
            <span class="text">{{text("CLEAR")}}</span>
          </div>
        </div>
      </div>
    </section>
    <div :is="component" :init="componentData"></div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import Printer from '../print'
import dialoger from './common/dialoger'
import reservation from './table/reservation'
import orderList from './common/orderList'
import split from './menu/split'
import payment from './payment/payment'
import setup from './table/setup'
export default {
  components: {
    setup, split, dialoger, reservation, payment, orderList
  },
  mounted() {
    this.$socket.emit("INQUIRY_UPDATE_TIME");
    this.currentTable ? this.focusTable() : this.sectionView = this.tables[0].item;
  },
  data() {
    return {
      table: [],
      sectionView: [],
      pendingSwitch: false,
      payment: null,
      component: null,
      componentData: null
    }
  },
  methods: {
    focusTable() {
      let index = this.tables.findIndex(section => section.zone === this.currentTable.zone);
      this.sectionView = this.tables[index].item;
    },
    switchView(section) {
      this.sectionView = section.item;
    },
    selectTable(table, e) {
      this.setApp({ opLastAction: new Date });
      if (!table._id) return;
      if (this.pendingSwitch) {
        table.status === 1 ?
          this.switchTable(table) :
          this.switchTableFail();
        return;
      }
      switch (table.status) {
        case 0:

          break;
        case 1:
        case "":
          this.setCurrentTable(table);
          this.store.table.guestCount ?
            new Promise((resolve, reject) => {
              this.componentData = { table, resolve, reject };
              this.component = "setup";
            }).then((guest) => {
              this.seated(guest);
            }).catch(() => {
              this.setCurrentTable(null);
              this.$q();
            }) :
            this.seated(0);
          break;
        case 2:
        case 3:
        case 4:
          if (table.current.invoice.length) {
            this.setCurrentTable(table);
            let invoice = this.history.filter(order => order._id === table.current.invoice[0]);
            invoice.length && this.setViewOrder(JSON.parse(JSON.stringify(invoice[0])));
          } else {
            this.resetMenu();
          }
          break;
        default:
      }
    },
    forceSelectTable(table, e) {
      if (this.op.role !== 'Manager') return;

      this.$dialog({
        type: "alert", title: "FORCE_CLEAR",
        msg: this.text("TIP_FORCE_CLEAR_TABLE", table.current.server, table.name),
        buttons: [{ text: 'CANCEL', fn: 'reject' }, { text: 'CLEAR', fn: 'resolve' }]
      }).then(() => {
        let _table = Object.assign({}, table, {
          status: 1,
          current: {
            color: "",
            group: "",
            guest: 0,
            invoice: [],
            server: "",
            time: ""
          }
        });
        this.$socket.emit("TABLE_MODIFIED", _table);
        this.$q();
      }).catch(() => { this.$q() })

    },
    settle() {
      if (this.isEmptyTicket) return;
      if (this.order.settled) {
        this.settledOrder();
        return;
      }
      this.$p("payment");
    },
    settledOrder() {
      this.$dialog({ title: "ORDER_SETTLED", msg: "TIP_ORDER_SETTLED", buttons: [{ text: 'CONFIRM', fn: 'resolve' }] }).then(() => { this.$q() })
    },
    editOrder() {
      if (this.order.settled) {
        this.handleSettledOrder();
        return;
      }
      this.setApp({ mode: 'edit' });
      this.setTicket({ type: "DINE_IN", number: this.order.number });
      this.$router.push({ path: '/main/menu' });
    },
    handleSettledOrder() {
      this.$dialog({
        title: this.text('REOPEN_SETTLED_ORD', this.order.number),
        msg: this.text('REOPEN_SETTLED_ORD_TIP', this.text(this.order.payment.type)),
        buttons: [{ text: 'REMOVE_PAYMENT', fn: 'resolve' }, { text: 'CANCEL', fn: 'reject' }]
      }).then(() => { this.removeOrderPayment() }).catch(() => { this.$q() })
    },
    removeOrderPayment() {
      this.$dialog({ type: "warning", title: 'PAYMENT_REMOVE', msg: this.text('PAYMENT_REMOVE_CONFIRM', this.text(this.order.payment.type)) }).then(() => {
        this.removePayment();
        this.$socket.emit("[UPDATE] INVOICE", this.order);
        this.$dialog({ title: "PAYMENT_REMOVED", msg: this.text("ORDER_PAYMENT_REMOVED", this.order.number), buttons: [{ text: 'CONFIRM', fn: 'reject' }, { text: 'EDIT_ORDER', fn: 'resolve' }] }).then(() => { this.editOrder() }).catch(() => { this.$q() });
      }).catch(() => { this.$q() })
    },
    startSwitchTable() {
      this.$dialog({ title: 'TABLE_CFM_SWITCH', msg: 'TIP_SELECT_TABLE' }).then((resolve) => {
        this.pendingSwitch = true;
        this.$q();
      }).catch((reject) => {
        this.pendingSwitch = false;
        this.$q();
      })
    },
    switchTable(table) {
      let origin = this.currentTable;
      this.$dialog({ title: 'TABLE_SWITCH', msg: this.text('TIP_SWITCH_CFM', origin.name, table.name) }).then(() => {
        table.current = origin.current;
        table.status = origin.status;
        let invoice = this.history.filter(order => order._id === origin.current.invoice[0])[0];
        invoice.table = table.name;
        invoice.tableId = table._id;
        this.$socket.emit("ORDER_MODIFIED", invoice);
        this.$socket.emit("TABLE_MODIFIED", table);
        origin.current = {
          color: "",
          group: "",
          guest: 0,
          invoice: [],
          server: "",
          time: ""
        };
        origin.status = 1;
        this.$socket.emit("TABLE_MODIFIED", origin);
        this.pendingSwitch = false;
        this.$q();
      }).catch(() => { this.$q() })
    },
    switchTableFail() {
      this.$dialog({ title: 'TABLE_SWITCH_F', msg: 'TIP_TABLE_MUST_EMPTY' }).then(() => { this.$q() })
    },
    getReservation() {
      this.$p("reservation");
    },
    split() {
      if (!this.order) return;
      this.$p("split");
    },
    seated(guest) {
      this.setTicket({ type: "DINE_IN" });
      this.setTableInfo({
        status: 2,
        current: {
          guest: ~~guest,
          server: this.op.name,
          time: +new Date,
          color: "",
          group: "",
          invoice: []
        }
      });
      this.$socket.emit("TABLE_MODIFIED", this.currentTable);
      this.$router.push({ path: '/main/menu' });
      this.resetMenu();
    },
    prePayment() {
      if (this.order.content.length === 0) return;
      if (this.order.print) {
        this.$dialog({
          type: "question", title: "PRT_PRE_PAYT", msg: this.text('TIP_PRE_PAYT', this.order.table),
          buttons: [{ text: 'CANCEL', fn: "reject" }, { text: "PRINT", fn: "resolve" }]
        }).then(() => {
          let order = JSON.parse(JSON.stringify(this.order));
          order.type = "PRE_PAYMENT";
          order.cashier = this.op.name;
          Printer.init(this.config).setJob("receipt").print(order);
          this.setTableInfo({ status: 3 });
          this.$socket.emit("TABLE_MODIFIED", this.currentTable);
          this.$q();
        }).catch(() => { this.$q() })
      } else {
        let remain = this.order.content.filter(item => !item.print).length;
        this.$dialog({ title: 'PRT_PRE_PAYT_NA', msg: this.text('TIP_REMAIN_ITEM', remain) }).then(() => { this.$q() })
      }
    },
    clearTable() {
      if (this.currentTable.status === 4 || this.order.settled) {
        this.$dialog({
          title: "TABLE_CLEAR", msg: this.text("TIP_TABLE_CLEAR", this.currentTable.name),
          buttons: [{ text: 'CANCEL', fn: 'reject' }, { text: 'CLEAR', fn: 'resolve' }]
        }).then(() => {
          this.resetMenu();
          this.resetCurrentTable();
          this.$socket.emit("TABLE_MODIFIED", this.currentTable);
          this.$q();
        }).catch(() => { this.$q() })
      } else {
        this.$dialog({ type: "info", title: 'TABLE_CLEAR_F', msg: this.text('TIP_TABLE_CLEAR_F', this.currentTable.name), buttons: [{ text: 'CONFIRM', fn: 'resolve' }] }).then(() => { this.$q() })
      }
    },
    setPayment(payment) {
      this.payment = payment;
    },
    setDialog(data) {
      this.$dialog(data).then(() => { this.$q() })
    },
    exit() {
      this.resetAll();
      this.$router.push({ path: "/main" });
    },
    ...mapActions(['setApp', 'resetAll', 'resetMenu', 'setOrder', 'setTicket', 'removePayment', 'setTableInfo', 'setViewOrder', 'setCurrentTable', 'resetCurrentTable'])
  },
  computed: {
    ...mapGetters(['op', 'config', 'store', 'history', 'tables', 'order', 'language', 'currentTable', 'isEmptyTicket'])
  },
  watch: {
    order(n) {
      if (n && n.payment) {
        this.payment = n.payment;
      } else {
        this.payment = {
          subtotal: 0,
          tax: 0,
          total: 0,
          tip: 0,
          gratuity: 0,
          discount: 0
        }
      }
      this.$nextTick(() => {
        let height = 0;
        let doms = document.querySelectorAll(".order .list");
        doms.forEach(dom => {
          height += dom.offsetHeight;
        });
        height = 325 - height;
        this.overflow = height < 0;
        this.overflowIndex = this.overflow ? n.content.length - 1 : null;
        this.offset = this.overflow ? height : 0;
      })
    }
  }
}
</script>

<style scoped>
.dineIn {
  display: flex;
  flex-direction: row;
  height: 771px;
  width: 1024px;
  padding-top: 63px;
  background: url(../assets/image/table.png) #ebeff1;
}

.tableWrap {
  padding: 3px 0;
  display: inline-flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-content: flex-start;
  position: relative;
}

section.blueprint {
  width: 740px;
  display: flex;
}

.tableSection {
  display: flex;
  flex-direction: column;
}

.tableSection .btn {
  text-align: center;
  margin: 5px;
}

.table {
  height: 83.5px;
  width: 83px;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #fff;
  background: linear-gradient(135deg, rgb(245, 247, 250) 0%, rgb(195, 207, 226) 110%);
  margin: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

.icon {
  color: #37474F;
}

.table span.icon {
  font-size: 4.5em;
}

.table .icon.occupy {
  color: #795548;
}

.table .name {
  margin-top: -5px;
  padding: 0 10px;
  color: #607D8B;
  font-weight: bold;
}

.dineIn section.cart {
  flex: none;
  width: 285px;
}

.function {
  width: 278px;
  padding: 5px 3px 0;
}

span.server {
  display: inline-block;
  vertical-align: top;
  margin-top: 25px;
  font-size: 1.25em;
}

.table:hover {
  background: rgba(245, 245, 245, 0.5);
}

.tableWrap.grid .table {
  background: rgba(255, 255, 255, 0.2);
}

.section.bottom {
  position: absolute;
  bottom: 0;
  width: 90px;
}

.prePay {
  color: #37474F;
  position: relative;
}

.paid {
  color: #FFB74D;
  position: relative;
}

.prePay::after {
  font-family: fontAwesome;
  content: '\f0d6';
  position: absolute;
  font-size: 21px;
  left: 29px;
  top: 29px;
  transform: rotate(45deg);
  color: #66BB6A;
}

.paid::after {
  font-family: fontAwesome;
  content: '\F007';
  position: absolute;
  font-size: 21px;
  right: 5px;
  bottom: 5px;
  color: #fff;
}
</style>
