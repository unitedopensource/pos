<template>
  <div class="function" v-if="layout ==='DINE_IN'">
    <div class="top">
      <div class="btn" @click="less">
        <i class="fa fa-minus-square"></i>
        <span class="text">{{text("LESS")}}</span>
      </div>
      <div class="btn" @click="moreQty">
        <i class="fa fa-plus-square"></i>
        <span class="text">{{text("MORE")}}</span>
      </div>
      <div class="btn" @click="request">
        <i class="fa fa-commenting-o"></i>
        <span class="text">{{text("REQUEST")}}</span>
      </div>
    </div>
    <div class="bottomLeft">
      <div class="btn" @click="trigger('switchGuest')" v-if="store.table.seatOrder">
        <i class="fa fa-users"></i>
        <span class="text">{{text("SWITCH")}}</span>
      </div>
      <div class="btn" @click="split" v-else>
        <i class="fa fa-columns"></i>
        <span class="text">{{text("SPLIT")}}</span>
      </div>
      <div class="btn" @click="course">
        <i class="fa fa-clock-o"></i>
        <span class="text">{{text("TIMER")}}</span>
      </div>
      <div class="btn" @click="search">
        <i class="fa fa-search"></i>
        <span class="text">{{text("SEARCH")}}</span>
      </div>
      <div class="btn" @click="done(false)">
        <i class="fa fa-save"></i>
        <span class="text">{{text("HOLD")}}</span>
      </div>
      <button class="btn" @click="modify">
        <i class="fa fa-calculator"></i>
        <span class="text">{{text("MODIFY")}}</span>
      </button>
      <div class="btn" @click="dineinExit">
        <i class="fa fa-times"></i>
        <span class="text">{{text("EXIT")}}</span>
      </div>
    </div>
    <div class="bottomRight">
      <button class="btn long" @click="done(true)">
        <i class="fa fa-print"></i>
        <span class="text">{{text("DONE")}}</span>
      </button>
      <div class="btn" @click="switchLanguage">
        <i class="fa fa-language"></i>
        <span class="text">中/EN</span>
      </div>
    </div>
  </div>
  <div class="grid" v-else-if="layout === 'BUFFET'">
    <div class="btn" @click="less">
      <i class="fa fa-minus-square"></i>
      <span class="text">{{text("LESS")}}</span>
    </div>
    <div class="btn" @click="moreQty">
      <i class="fa fa-plus-square"></i>
      <span class="text">{{text("MORE")}}</span>
    </div>
    <button class="btn" @click="modify">
      <i class="fa fa-calculator"></i>
      <span class="text">{{text("MODIFY")}}</span>
    </button>
    <div class="btn settle" @click="trigger('settle')">
      <i class="fa fa-money"></i>
      <span class="text">{{text("PAYMENT")}}</span>
    </div>
    <div class="btn split" @click="trigger('split')">
      <i class="fa fa-columns"></i>
      <span class="text">{{text("SPLIT")}}</span>
    </div>
    <div class="btn" @click="trigger('save',false)">
      <i class="fa fa-save"></i>
      <span class="text">{{text("SAVE")}}</span>
    </div>
    <div class="btn" @click="trigger('exitConfirm')">
      <i class="fa fa-times"></i>
      <span class="text">{{text("EXIT")}}</span>
    </div>
    <div class="btn" @click="trigger('switchLanguage')">
      <i class="fa fa-language"></i>
      <span class="text">中/EN</span>
    </div>
  </div>
  <div class="function" v-else>
    <div class="btn" @click="less">
      <i class="fa fa-minus-square"></i>
      <span class="text">{{text("LESS")}}</span>
    </div>
    <div class="btn" @click="moreQty">
      <i class="fa fa-plus-square"></i>
      <span class="text">{{text("MORE")}}</span>
    </div>
    <div class="btn" @click="request">
      <i class="fa fa-commenting-o"></i>
      <span class="text">{{text("REQUEST")}}</span>
    </div>
    <div class="btn" @click="settle">
      <i class="fa fa-money"></i>
      <span class="text">{{text("PAYMENT")}}</span>
    </div>
    <div class="btn" @click="course">
      <i class="fa fa-clock-o"></i>
      <span class="text">{{text("TIMER")}}</span>
    </div>
    <button class="btn" @click="save(true)">
      <i class="fa fa-print"></i>
      <span class="text">{{text("PRINT")}}</span>
    </button>
    <div class="btn" @click="search">
      <i class="fa fa-search"></i>
      <span class="text">{{text("SEARCH")}}</span>
    </div>
    <div class="btn" @click="split">
      <i class="fa fa-columns"></i>
      <span class="text">{{text("SPLIT")}}</span>
    </div>
    <div class="btn" @click="save(false)">
      <i class="fa fa-save"></i>
      <span class="text">{{text("SAVE")}}</span>
    </div>
    <button class="btn" @click="modify">
      <i class="fa fa-calculator"></i>
      <span class="text">{{text("MODIFY")}}</span>
    </button>
    <div class="btn" @click="takeoutExit">
      <i class="fa fa-times"></i>
      <span class="text">{{text("EXIT")}}</span>
    </div>
    <div class="btn" @click="switchLanguage">
      <i class="fa fa-language"></i>
      <span class="text">中/EN</span>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import Printer from '../../print'
export default {
  props: ['layout'],
  data() {
    return {
      isDisplayGuests: false
    }
  },
  methods: {
    callComponent(name) {
      this.$emit("open", name);
    },
    less() {
      this.lessQty();
    },
    modify() {
      if (this.isEmptyTicket) return;
      this.approval(this.op.modify, "price") ? this.callComponent("modify") : this.$denyAccess();
    },
    course() {
      if (this.isEmptyTicket) return;
      this.callComponent("course");
    },
    settle() {
      if (this.isEmptyTicket) return;
      this.callComponent("settle")
    },
    request() {
      this.callComponent("request");
    },
    search() {

    },
    split() {
      if (this.isEmptyTicket) return;
      this.callComponent("split");
    },
    save(print) {
      if (this.isEmptyTicket) return;
      let order = this.combineOrderInfo({ cashier: this.op.name, print });
      print && Printer.init(this.config).setJob("receipt").print(order);
      print && order.content.forEach(item => {
        item.print = true;
        item.pending = false;
      });
      this.app.mode === 'create' ? this.$socket.emit("[SAVE] INVOICE", order) : this.$socket.emit("[UPDATE] INVOICE", order);
      this.resetAll();
      this.$router.push({ path: "/main" });
    },
    done(print) {
      if (this.isEmptyTicket) return;
      let order;
      if (this.app.mode === 'create') {
        order = this.combineOrderInfo({
          server: this.op.name, print,
          table: this.currentTable.name,
          tableID: this.currentTable._id,
          guest: isNumber(this.order.guest) ? this.order.guest : this.currentTable
        });
        this.setTableInfo({ current: { invoice: [order._id] } });
      } else {
        order = this.combineOrderInfo({});
      }
      print && Printer.init(this.config).setJob("receipt").print(order);
      print && order.content.forEach(item => {
        item.print = true;
        item.pending = false;
      });
      this.app.mode === 'create' ? this.$socket.emit("[SAVE] DINE_IN_INVOICE", { table: this.currentTable, order }) : this.$socket.emit("[UPDATE] INVOICE", order);
      this.$socket.emit("INQUIRY_TICKET_NUMBER");
      this.setOrder(order);
      this.$router.push({ name: "Table" });
    },
    combineOrderInfo(extra) {
      let customer = Object.assign({}, this.customer);
      let print = extra.hasOwnProperty("print") ? extra.print : true;
      let order = Object.assign({}, this.order);
      if (this.app.mode === 'create') {
        delete customer.extra;
        Object.assign(order, {
          customer,
          type: this.ticket.type,
          number: this.ticket.number,
          station: this.station.alies,
          source: "POS",
          modify: 0,
          status: 1,
          time: +new Date,
          date: today()
        });
      } else {
        Object.assign(order, {
          lastEdit: +new Date,
          editor: this.op.name,
          modify: this.order.modify + 1
        })
      }
      return Object.assign({}, order, extra);
    },
    takeoutExit() {
      this.callComponent("takeoutExit");
    },
    dineinExit() {
      this.callComponent("dineinExit");
    },
    buffetExit() {

    },
    switchLanguage() {
      let language = this.app.language === "usEN" ? "zhCN" : "usEN";
      this.$setLanguage(language);
      this.setApp({ language, opLastAction: new Date });
      moment.locale(language === 'usEN' ? 'en' : 'zh-cn');
      this.$forceUpdate();
    },
    ...mapActions(['setApp', 'lessQty', 'moreQty', 'resetAll', 'setOrder', 'setTableInfo'])
  },
  computed: {
    ...mapGetters(['op', 'app', 'config', 'order', 'ticket', 'store', 'customer', 'station', 'isEmptyTicket', 'currentTable'])
  }
}
</script>

<style scoped>
.bottomLeft {
  display: inline-block;
  width: 184px;
}

.bottomRight {
  display: inline-block;
  width: 90px;
  vertical-align: top;
}

.long {
  height: 129px;
}

.guests {
  display: inline-flex;
}

.grid {
  display: grid;
  grid-template-columns: auto auto auto;
  grid-template-rows: auto auto auto;
  padding: 3px 0 0 3px;
}

.btn.settle {
  grid-column-start: 1;
  grid-column-end: 3;
  grid-row-start: 2;
  grid-row-end: 4;
  width: 185px;
  height: 129px;
}

.btn.split {
  grid-column-start: 3;
  grid-column-end: 3;
  grid-row-start: 2;
  grid-row-end: 4;
  height: 129px;
}
</style>
