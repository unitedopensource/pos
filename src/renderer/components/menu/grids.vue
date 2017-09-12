<template>
  <div class="function" v-if="layout ==='DINE_IN'">
    <div class="top">
      <div class="btn" @click="less">
        <i class="fa fa-minus-square"></i>
        <span class="text">{{$t('button.less')}}</span>
      </div>
      <div class="btn" @click="moreQty">
        <i class="fa fa-plus-square"></i>
        <span class="text">{{$t('button.more')}}</span>
      </div>
      <div class="btn" @click="request">
        <i class="fa fa-commenting-o"></i>
        <span class="text">{{$t('button.request')}}</span>
      </div>
    </div>
    <div class="bottomLeft">
      <div class="btn" @click="switchGuest" v-if="store.table.seatOrder">
        <i class="fa fa-users"></i>
        <span class="text">{{$t('button.switch')}}</span>
      </div>
      <div class="btn" @click="split" v-else>
        <i class="fa fa-columns"></i>
        <span class="text">{{$t('button.split')}}</span>
      </div>
      <div class="btn" @click="course">
        <i class="fa fa-clock-o"></i>
        <span class="text">{{$t('button.timer')}}</span>
      </div>
      <div class="btn" @click="search">
        <i class="fa fa-search"></i>
        <span class="text">{{$t('button.search')}}</span>
      </div>
      <div class="btn" @click="done(false)">
        <i class="fa fa-save"></i>
        <span class="text">{{$t('button.hold')}}</span>
      </div>
      <button class="btn" @click="modify">
        <i class="fa fa-calculator"></i>
        <span class="text">{{$t('button.modify')}}</span>
      </button>
      <div class="btn" @click="dineinExit">
        <i class="fa fa-times"></i>
        <span class="text">{{$t('button.exit')}}</span>
      </div>
    </div>
    <div class="bottomRight">
      <button class="btn long" @click="done(true)">
        <i class="fa fa-print"></i>
        <span class="text">{{$t('button.done')}}</span>
      </button>
      <div class="btn" @click="switchLanguage">
        <i class="fa fa-language"></i>
        <span class="text">{{$t('button.language')}}</span>
      </div>
    </div>
  </div>
  <div class="grid" v-else-if="layout === 'BUFFET'">
    <div class="btn" @click="less">
      <i class="fa fa-minus-square"></i>
      <span class="text">{{$t('button.less')}}</span>
    </div>
    <div class="btn" @click="moreQty">
      <i class="fa fa-plus-square"></i>
      <span class="text">{{$t('button.more')}}</span>
    </div>
    <button class="btn" @click="modify">
      <i class="fa fa-calculator"></i>
      <span class="text">{{$t('button.modify')}}</span>
    </button>
    <div class="btn settle" @click="settle">
      <i class="fa fa-money"></i>
      <span class="text">{{$t('button.payment')}}</span>
    </div>
    <div class="btn split" @click="split">
      <i class="fa fa-columns"></i>
      <span class="text">{{$t('button.split')}}</span>
    </div>
    <div class="btn" @click="save(false)">
      <i class="fa fa-save"></i>
      <span class="text">{{$t('button.save')}}</span>
    </div>
    <div class="btn" @click="exit">
      <i class="fa fa-times"></i>
      <span class="text">{{$t('button.exit')}}</span>
    </div>
    <div class="btn" @click="switchLanguage">
      <i class="fa fa-language"></i>
      <span class="text">{{$t('button.language')}}</span>
    </div>
  </div>
  <div class="function" v-else>
    <div class="btn" @click="less">
      <i class="fa fa-minus-square"></i>
      <span class="text">{{$t('button.less')}}</span>
    </div>
    <div class="btn" @click="moreQty">
      <i class="fa fa-plus-square"></i>
      <span class="text">{{$t('button.more')}}</span>
    </div>
    <div class="btn" @click="request">
      <i class="fa fa-commenting-o"></i>
      <span class="text">{{$t('button.request')}}</span>
    </div>
    <div class="btn" @click="settle">
      <i class="fa fa-money"></i>
      <span class="text">{{$t('button.payment')}}</span>
    </div>
    <div class="btn" @click="timer">
      <i class="fa fa-clock-o"></i>
      <span class="text">{{$t('button.timer')}}</span>
    </div>
    <button class="btn" @click="save(true)">
      <i class="fa fa-print"></i>
      <span class="text">{{$t('button.print')}}</span>
    </button>
    <div class="btn" @click="search">
      <i class="fa fa-search"></i>
      <span class="text">{{$t("button.search")}}</span>
    </div>
    <div class="btn" @click="split">
      <i class="fa fa-columns"></i>
      <span class="text">{{$t("button.split")}}</span>
    </div>
    <div class="btn" @click="save(false)">
      <i class="fa fa-save"></i>
      <span class="text">{{$t("button.save")}}</span>
    </div>
    <button class="btn" @click="modify">
      <i class="fa fa-calculator"></i>
      <span class="text">{{$t("button.modify")}}</span>
    </button>
    <div class="btn" @click="exit">
      <i class="fa fa-times"></i>
      <span class="text">{{$t("button.exit")}}</span>
    </div>
    <div class="btn" @click="switchLanguage">
      <i class="fa fa-language"></i>
      <span class="text">{{$t("button.language")}}</span>
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
      let dom = document.querySelector('div.request');
      this.lessQty(dom !== null);
    },
    modify() {
      if (this.isEmptyTicket) return;
      this.callComponent("modify")
    },
    course() {
      if (this.isEmptyTicket) return;
      this.callComponent("course");
    },
    settle() {
      if (this.isEmptyTicket) return;
      if (this.op.cashCtrl !== 'enable' && this.op.cashCtrl !== 'staffBank') return;
      this.callComponent("settle")
    },
    request() {
      this.callComponent("request")
    },
    search() {

    },
    timer() {
      if (this.isEmptyTicket) return;
      this.callComponent("timer")
    },
    split() {
      if (this.isEmptyTicket) return;
      this.callComponent("split")
    },
    switchGuest() {
      this.callComponent("guest")
    },
    save(print) {
      if (this.isEmptyTicket) return;
      let order = this.combineOrderInfo({ print });
      print && Printer.init(this.config).setJob("receipt").print(order);
      print && order.content.forEach(item => {
        delete item.new;
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
        let current = Object.assign({}, this.currentTable.current, {
          invoice: [order._id],
          color: "",
          group: "",
          guest: this.currentTable.current.guest || 0,
          server: this.op.name,
          time: +new Date()
        });
        this.setTableInfo({ current });
      } else {
        order = this.combineOrderInfo({});
      }
      print && this.station.printOnDone && Printer.init(this.config).setJob("receipt").print(order);
      print && order.content.forEach(item => {
        delete item.new;
        item.print = true;
        item.pending = false;
      });
      this.app.mode === 'create'
        ? this.$socket.emit("[SAVE] DINE_IN_INVOICE", { table: this.currentTable, order })
        : this.$socket.emit("[UPDATE] INVOICE", order);
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
          source: this.op.role !== 'ThirdParty' ? "POS" : this.op.name,
          modify: 0,
          status: 1,
          time: +new Date(),
          date: today()
        });
      } else {
        Object.assign(order, {
          customer,
          type: this.ticket.type,
          lastEdit: +new Date(),
          editor: this.op.name,
          modify: isNumber(this.order.modify) ? this.order.modify + 1 : 1
        })
      }
      return Object.assign({}, order, extra);
    },
    exit() {
      this.callComponent("exit");
    },
    dineinExit() {
      this.callComponent("dineinExit");
    },
    switchLanguage() {
      let language = this.app.language === "usEN" ? "zhCN" : "usEN";
      this.$setLanguage(language);
      this.setApp({ language });
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
