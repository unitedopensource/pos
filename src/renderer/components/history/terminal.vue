<template>
  <div class="popupMask center dark">
    <div class="terminal window" v-show="!component">
      <header class="title">
        <span>{{text('TERM_REPORT')}}</span>
        <i class="fa fa-times" @click="init.resolve"></i>
      </header>
      <div class="inner">
        <section class="dataList">
          <header>
            <span class="active" @click="setFilter('station',$event)">{{text('STATION_RECORDS')}}</span>
            <span @click="setFilter('all',$event)">{{text('ALL_RECORDS')}}</span>
          </header>
          <ul class="content">
            <li v-for="(info,index) in transaction" :class="{settled:info.status === 3}" :key="index">
              <i class="fa fa-exclamation-triangle chargeBack" v-if="(info.status === 1 || info.status === 2) && info.account.entry !== 'Chip'" :title="text('TIP_CHARGE_BACK')"></i>
              <i :class="getIcon(info.status)" class="status"></i>
              <span class="num">#{{info.trace.trans}}</span>
              <span class="type">{{info.transType}}</span>
              <span class="order">{{text(info.order.type)}} #{{info.order.number}}</span>
              <span class="card">
                <i :class="cardType(info.account.type)"></i>
                ...{{info.account.number}}
              </span>
              <span class="auth">{{info.host.auth}}</span>
              <div class="amount">
                <span>${{(parseFloat(info.amount.approve) + parseFloat(info.amount.tip)).toFixed(2)}}</span>
                <span v-show="parseFloat(info.amount.tip) !== 0" class="tip">(${{info.amount.tip}})</span>
              </div>
              <div class="action">
                <span @click="adjustTip(info)" class="adjust">{{text('ADJUST_TIP')}}</span>
                <span @click="voidSale(info)" class="void">{{text('VOID')}}</span>
                <i class="fa fa-print" @click="print(info)"></i>
              </div>
            </li>
          </ul>
        </section>
      </div>
      <footer>
        <button class="btn" @click="batch" :disabled="!device">{{text('BATCH')}}</button>
        <div class="pagination">
          <div class="page" @click="page = page > 0 ? page - 1 : 0">
            <i class="fa fa-angle-left"></i>
          </div>
          <div class="page" v-for="i in totalPage" @click="page = (i-1)" :key="i" :class="{active:page === (i-1)}">{{i}}</div>
          <div class="page" @click="page = page === (totalPage-1) ? page : page + 1">
            <i class="fa fa-angle-right"></i>
          </div>
        </div>
        <div>
          <div class="btn" @click="init.resolve">{{text('EXIT')}}</div>
        </div>
      </footer>
    </div>
    <div :is="component" :init="componentData" :exit="exitComponent"></div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import moment from 'moment'
import Inputter from './inputter'
import dialoger from '../common/dialoger'
import Printer from '../../print'
export default {
  props: ['init'],
  created() {
    this.$socket.emit("[TERM] GET_ALL_TRANSACTION", this.today);
    this.station.terminal.enable ? this.initTerminal() : this.missTerminal();
  },
  data() {
    return {
      component: null,
      componentData: null,
      allTransaction: [],
      today: today(),
      date: today(),
      filter: 'all',
      terminal: null,
      device: null,
      page: 0
    }
  },
  methods: {
    initTerminal() {
      let terminal = this.station.terminal;
      let file = terminal.model;
      this.msg = this.text('TERM_INIT', terminal.model);
      this.terminal = require('../payment/parser/' + file);
      this.terminal.initial(terminal.address, terminal.port).then(response => response.text()).then((device) => {
        this.device = this.terminal.check(device);
        this.device.code !== '000000' && this.noBatch();
      })
    },
    refund(record) {

    },
    voidSale(record) {
      this.$dialog({
        title: "TERM_VOID_SALE", msg: this.text("TIP_TERM_VOID_SALE", record.trace.trans), buttons: [{ text: 'CANCEL', fn: 'reject' }, { text: 'CONFIRM&PRINT', fn: 'resolve' }]
      }).then((print) => {
        let invoice = record.order.number;
        let trans = record.trace.trans;
        this.terminal.voidSale(invoice, trans).then((response) => response.text()).then((response) => {
          let transaction = this.terminal.explainTransaction(response);
          record = Object.assign(record, transaction, { status: 0 });
          this.$socket.emit("[TERM] UPDATE_TRANSACTION", record);
          Printer.init(this.config).setJob('creditCard').print(transaction);
          let ticket = record.order.number;
          let order = this.history.find(ticket => ticket.number === record.order.number);
          this.removePayment(order);
        });
        this.$q();
      }).catch(() => { this.$q() })
    },
    removePayment(ticket) {
      ticket.settled = false;
      ticket.payment.settled = false;
      ticket.payment.log = [];
      ticket.payment.tip = 0;
      ticket.payment.gratuity = 0;
      ticket.payment.paid = 0;
      ticket.payment.discount = 0;
      delete ticket.payment.paidCash;
      delete ticket.payment.paidCredit;
      delete ticket.payment.paidGift;
      ticket.payment.due = parseFloat(ticket.payment.total);
      this.$socket.emit("[SAVE] INVOICE", ticket);
    },
    adjustTip(record) {
      this.approval(this.op.modify, "terminal") ?
        new Promise((resolve, reject) => {
          let title = "ADJUST_TIP";
          this.componentData = { title, resolve, reject };
          this.component = "Inputter";
        }).then((value) => {
          this.$q();
          value = isNumber(value) ? value : 0;
          let total = parseFloat(record.amount.approve) + value;
          this.$dialog({ title: 'TERM_CONFIRM_ADJUST', msg: this.text('TIP_TERM_ADJUST_TIP', value.toFixed(2), total.toFixed(2)) }).then(() => {
            let amount = Math.round(value * 100);
            let invoice = record.order.number;
            let trans = record.trace.trans;
            this.terminal.adjust(invoice, trans, amount).then(response => response.text()).then((response) => {
              this.$q();
              record.status = 2;
              record.amount.tip = value.toFixed(2);
              this.$socket.emit("[TERM] UPDATE_TRANSACTION", record);
              this.adjustOrderTip(record.order, value);
            });
          }).catch(() => { this.$q() })
        }).catch(() => { this.$q() }) :
        this.$denyAccess();
    },
    adjustOrderTip(order, tip) {
      let invoice = this.history.find(ticket => order.number === ticket.number);
      invoice.payment.tip = parseFloat(tip);
      this.$socket.emit("[SAVE] INVOICE", invoice);
    },
    checksum() {
      let summary = {
        visa: 0,
        visaSum: 0,
        master: 0,
        masterSum: 0,
        discover: 0,
        discoverSum: 0,
        amex: 0,
        amexSum: 0,
        other: 0,
        otherSum: 0,
        sale: 0,
        saleSum: 0,
        tip: 0,
        tipSum: 0,
        // voidVisa:0,
        // voidVisaSum:0,
        // voidMaster:0,
        // voidMasterSum:0,
        // voidDiscover:0,
        // voidDiscoverSum:0,
        // voidAmex:0,
        // voidAmexSum:0,
        // voidOther:0,
        // voidOtherSum:0,
        voided: 0,
        voidedSum: 0,
      };
      let content = this.transaction.filter(each => {
        if (each.status === 0) {
          summary.voided++;
          summary.voidedSum += parseFloat(each.amount.approve);
        } else {
          summary.sale++;
          summary.saleSum += parseFloat(each.amount.approve) + parseFloat(each.amount.tip);

          if (parseFloat(each.amount.tip) > 0) {
            summary.tip++;
            summary.tipSum += parseFloat(each.amount.tip);
          }
        }

        switch (each.account.type) {
          case "Visa":
            if (each.status === 1 || each.status === 2) {
              summary.visa++;
              summary.visaSum += parseFloat(each.amount.approve) + parseFloat(each.amount.tip)
            }
            break;
          case "MasterCard":
            if (each.status === 1 || each.status === 2) {
              summary.master++;
              summary.masterSum += parseFloat(each.amount.approve) + parseFloat(each.amount.tip)
            }
            break;
          case "Discover":
            if (each.status === 1 || each.status === 2) {
              summary.discover++;
              summary.discoverSum += parseFloat(each.amount.approve) + parseFloat(each.amount.tip)
            }
            break;
          case "American Express":
            if (each.status === 1 || each.status === 2) {
              summary.amex++;
              summary.amexSum += parseFloat(each.amount.approve) + parseFloat(each.amount.tip)
            }
            break;
          default:
            if (each.status === 1 || each.status === 2) {
              summary.other++;
              summary.otherSum += parseFloat(each.amount.approve) + parseFloat(each.amount.tip)
            }
        }
        return each.status !== 0;
      }).map(each => {
        return {
          trans: "#" + each.trace.trans,
          transType: each.transType,
          card: each.account.number,
          total: (parseFloat(each.amount.approve) + parseFloat(each.amount.tip)).toFixed(2),
          tip: parseFloat(each.amount.tip),
          time: moment(each.trace.time, 'YYYYMMDDHHmmss').format('HH:mm'),
          orderType: this.text(each.order.type),
          ticket: "#" + each.order.number
        }
      });
      Printer.init(this.config).setJob("checksum").print({ content, summary });
    },
    batch() {
      this.checksum();
      this.$dialog({ title: "TERM_BATCH_CLOSE", msg: "TIP_TERM_BATCH_CLOSE", buttons: [{ text: "CANCEL", fn: 'reject' }, { text: 'BATCH', fn: 'resolve' }] }).then(() => {
        this.terminal.batch().then(response => response.text()).then(response => {
          let result = this.terminal.explainBatch(response);
          if (result.code === '000000') {
            let sn = this.station.terminal.sn;
            for (let i = 0; i < this.transaction.length; i++) {
              if (this.transaction[i].addition.SN === sn) {
                this.transaction[i].status = 3;
                this.$socket.emit("[TERM] BATCH_TRANS_CLOSE", this.transaction);
              }
            }
            Printer.init(this.config).setJob("batch").print(result);
            this.$socket.emit('[TERM] SAVE_BATCH_RESULT', result);
            this.$q();
          } else {
            this.$dialog({ type: 'warning', title: result.msg, msg: this.text('ERROR_CODE', result.code), buttons: [{ text: 'CONFIRM', fn: 'resolve' }] }).then(() => { this.$q() })
          }
        })
      }).catch(() => { this.$q() })
    },
    noBatch() {
      this.$dialog({ type: 'warning', title: 'TERM_NA', msg: 'TERM_BATCH_DISABLE', buttons: [{ text: 'CONFIRM', fn: 'resolve' }] }).then(() => {
        this.device = null;
        this.$q();
      })
    },
    missTerminal() {
      this.$dialog({ type: 'warning', title: 'TERM_NA', msg: 'STA_TERM_NA', buttons: [{ text: 'CONFIRM', fn: 'resolve' }] }).then(() => {
        this.$q();
        this.init.resolve();
      })
    },
    setFilter(type, e) {
      this.filter = type;
      document.querySelector(".dataList span.active").classList.remove("active");
      e.currentTarget.classList.add("active");
    },
    cardType(card) {
      switch (card) {
        case "Visa":
          return "fa fa-cc-visa";
        case "MasterCard":
          return "fa fa-cc-mastercard";
        case "American Express":
          return "fa fa-cc-amex";
        case "Discover":
          return "fa fa-cc-discover";
        default:
          return "fa fa-credit-card-alt"
      }
    },
    getIcon(status) {
      switch (status) {
        case 1:
          return "fa fa-circle-o";
        case 2:
          //tiped 
          return "fa fa-circle";
        case 3:
          //settled
          return "fa fa-check-circle";
        case 4:
          //insufficient 
          return "fa fa-info-circle";
        case 0:
          //void
          return "fa fa-times-circle";
        default:
          //other
          return "fa fa-question-circle"
      }
    },
    print(receipt) {
      Printer.init(this.config).setJob('reprint creditCard').print(receipt);
    },
    exitComponent() {
      this.componentData = null;
      this.component = null;
    }
  },
  computed: {
    transaction() {
      let min = this.page * 13;
      let max = min + 13;
      switch (this.filter) {
        case "all":
          return this.allTransaction.slice(min, max);
        case "station":
          let sn = this.station.terminal.sn;
          return this.allTransaction.filter(trans => trans.addition.SN === sn).slice(min, max);
      }
    },
    totalPage() {
      let length = this.allTransaction.length;
      return Math.ceil(length / 13)
    },
    ...mapGetters(['op', 'config', 'language', 'history', 'station'])
  },
  sockets: {
    TERM_TRANS_RESULT(transaction) {
      this.allTransaction = transaction;
    }
  },
  components: {
    dialoger, Inputter
  }
}
</script>

<style scoped>
.terminal {
  width: 850px;
  background: #E0E2E5;
  font-size: initial;
}

.lastBatch {
  font-size: 16px;
  color: #E3F2FD;
  border-bottom: 1px dotted #90CAF9;
}

.content li {
  border-bottom: 1px solid #ddd;
  display: flex;
  position: relative;
  align-items: center;
  padding: 10px 5px;
}

.status {
  width: 40px;
  text-align: center;
}

.content li:nth-child(2n) {
  background: #F5F5F5;
}

.pagination {
  flex: 1;
  display: flex;
  align-items: center;
  padding: 0 10px;
  justify-content: center;
}

.pagination .page {
  margin: 5px;
  width: 20px;
  text-align: center;
  cursor: pointer;
  padding: 10px 10px;
  border-radius: 4px;
  text-shadow: 0 1px 1px #fff;
  background: linear-gradient(#fefefe, #cfd0d3);
  box-shadow: 0 1px 3px rgba(0, 0, 0, .7);
}

.page.active {
  font-weight: bold;
  background: #676767;
  color: #fff;
  text-shadow: 0 1px 1px #000;
  box-shadow: rgba(0, 0, 0, 0.75) 0 0 0 0 inset;
}

.num {
  width: 35px;
}

.auth {
  width: 60px;
  padding: 0 2px;
  text-align: center;
  background: #9e9e9e;
  border-radius: 2px;
  color: #F5F5F5;
  margin: 0 5px;
}

.order {
  margin: 0 15px;
  width: 100px;
  text-align: center;
}

.type {
  width: 70px;
  text-align: center;
}

.card {
  width: 80px;
  margin: 0 20px;
}

.amount {
  flex: 1;
  padding-left: 30px;
  display: flex;
  align-items: center;
}

.amount span {
  text-align: center;
}

.tip {
  font-size: 12px;
  margin-left: 5px;
  color: #607D8B;
}

.fa-cc-visa {
  color: #1f7dc7;
}

.fa-cc-mastercard {
  color: #F44336;
}

.action span {
  margin: 0 5px;
  padding: 5px 15px;
  border-radius: 4px;
  cursor: pointer;
}

.adjust {
  background: #FF9800;
  color: #fff;
}

.void {
  background: #FF5722;
  color: antiquewhite;
}

.fa-circle-o,
.fa-circle,
.fa-check-circle {
  color: var(--green);
}

.fa-info-circle {
  color: var(--orange);
}

.fa-times-circle {
  color: var(--red);
}

.fa-question-circle {
  color: var(--gray);
}

.fa-print {
  display: inline;
  padding: 11px;
  color: var(--gray);
}

.chargeBack {
  color: var(--yellow);
  position: absolute;
  left: 7px;
}

.settled {
  color: #9E9E9E
}

.settled .action {
  display: none;
}
</style>