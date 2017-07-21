<template>
  <div class="popupMask center dark" @click.self="init.reject">
    <div class="report window">
      <header class="title">{{text('PRINT_REPORT')}}</header>
      <div class="inner">
        <section class="options">
          <article class="row">
            <h3>{{text('REPORT_RANGE')}}</h3>
            <div class="wrap">
              <div>
                <input type="radio" name="range" v-model="ranger" value="today" id="today">
                <label for="today">今日</label>
              </div>
              <div>
                <input type="radio" name="range" v-model="ranger" value="week" id="week">
                <label for="week">本周</label>
              </div>
              <div>
                <input type="radio" name="range" v-model="ranger" value="month" id="month">
                <label for="month">当月</label>
              </div>
              <div>
                <input type="radio" name="range" v-model="ranger" value="last" id="last">
                <label for="last">上月</label>
              </div>
              <div>
                <input type="radio" name="range" v-model="ranger" value="custom" id="custom" disabled="true">
                <label for="custom">自订</label>
              </div>
            </div>
          </article>
          <article class="row">
            <h3>{{text('REPORT_DETAILS')}}</h3>
            <div class="wrap">
              <div>
                <input type="radio" name="detail" v-model="detail" value="simple" id="simple">
                <label for="simple">简单</label>
              </div>
              <div>
                <input type="radio" name="detail" v-model="detail" value="basic" id="basic">
                <label for="basic">基本</label>
              </div>
              <div>
                <input type="radio" name="detail" v-model="detail" value="detail" id="detail">
                <label for="detail">详细</label>
              </div>
              <div>
                <input type="radio" name="detail" v-model="detail" value="full" id="full" disabled="true">
                <label for="full">全部</label>
              </div>
            </div>
          </article>
          <div v-show="detail === 'detail'">
            <fieldset>
              <legend>{{text('OPTION')}}</legend>
              <checkbox v-model="sentEmail" label="SENT_RPT_VIA_EMAIL"></checkbox>
              <checkbox v-model="countItem" label="REPORT_COUNT_ITEM"></checkbox>
            </fieldset>
          </div>
        </section>
      </div>
      <footer>
        <div class="btn" @click="init.reject">{{text('CANCEL')}}</div>
        <div class="btn" @click="confirm">{{text('CONFIRM')}}</div>
      </footer>
    </div>
  </div>
</template>

<script>
import moment from 'moment'
import Printer from '../../print'
import { mapGetters } from 'vuex'
import checkbox from '../setting/common/checkbox'

export default {
  props: ['init'],
  data() {
    return {
      sentEmail: false,
      countItem: false,
      ranger: "today",
      detail: "simple",
      range: [],
      date: null,
      from: "",
      to: ""
    }
  },
  methods: {
    getDateRange() {
      switch (this.ranger) {
        case "today":
          this.from = Number(moment().startOf('day').hours(4).format('x'));
          this.to = Number(moment().startOf('day').add(1, 'days').hours(3).minutes(59).seconds(59).format('x'));
          this.date = moment().format('YYYY/MM/DD');
          break;
        case "week":
          this.from = Number(moment().startOf('week').hours(4).format('x'));
          this.to = Number(moment().endOf('week').add(1, 'days').hours(3).minutes(59).seconds(59).format('x'));
          this.date = moment().startOf('week').format('YYYY/MM/DD') + " - " + moment().endOf('week').format("YYYY/MM/DD");
          break;
        case "month":
          this.from = Number(moment().startOf('month').hours(4).format('x'));
          this.to = Number(moment().endOf('month').add(1, 'days').hours(3).minutes(59).seconds(59).format('x'));
          this.date = moment().startOf('month').format('YYYY/MM/DD') + " - " + moment().endOf('month').format("YYYY/MM/DD");
          break;
        case "last":
          this.from = Number(moment().subtract(1, 'M').startOf('month').hours(4).format('x'));
          this.to = Number(moment().subtract(1, 'M').endOf('month').add(1, 'days').hours(3).minutes(59).seconds(59).format('x'));
          this.date = moment().subtract(1, 'M').startOf('month').format('YYYY/MM/DD') + " - " + moment().subtract(1, 'M').endOf('month').format("YYYY/MM/DD");
          break;
        case "custom":
          break;
        default:
          this.from = Number(moment().startOf('day').hours(4).format('x'));
          this.to = Number(moment().startOf('day').add(1, 'days').hours(3).minutes(59).seconds(59).format('x'));
          this.date = moment().format('YYYY/MM/DD');
      }
    },
    confirm() {
      this.getDateRange();
      let { from, to, detail } = this;
      this.$socket.emit("[RPT] INQUIRY_DATA", { from, to, detail })
    },
    getReport(data) {
      let summary = this.calculator(data);
      let date = this.date;
      Printer.init(this.config).setJob("report").print({ date, summary });
      this.init.resolve();
    },
    generateCSV() {
      let excel = [['Index', 'Date', 'Content']];
      let csvRows = [];

      for (let i = 1; i < 10; i++) {
        excel.push([i, "2017-01-" + i, i * 2]);
      }

      for (let i = 0; i < excel.length; i++) {
        csvRows.push(excel[i].join(','));
      }

      let csvFile = csvRows.join("%0A");
      console.log('data:attachment/csv,' + csvFile);
    },
    calculator(data) {
      console.log(data)
      let { order, giftCard } = data;
      if (order.length === 0) return;

      let total = 0, totalSum = 0, totalTip = 0, totalGratuity = 0,
        walkin = 0, walkinSum = 0, walkinTip = 0, walkinGratuity = 0,
        pickup = 0, pickupSum = 0, pickupTip = 0, pickupGratuity = 0,
        delivery = 0, deliverySum = 0, deliveryTip = 0, deliveryGratuity = 0, deliveryFee = 0, deliveryFeeCount = 0,
        dinein = 0, dineinSum = 0, dineinTip = 0, dineinGratuity = 0,
        bar = 0, barSum = 0, barTip = 0, barGratuity = 0,
        hibachi = 0, hibachiSum = 0, hibachiTip = 0, hibachiGratuity = 0,
        settle = 0, settleSum = 0, unsettle = 0, unsettleSum = 0,
        voided = 0, voidedSum = 0,
        cash = 0, credit = 0, gift = 0, discount = 0, discountSum = 0,
        corrupted = 0,
        counter = {},
        driver = {},

        length = order.length;

      for (let i = 0; i < length; i++) {
        let invoice = order[i];
        if (order[i].status === 1) {
          if (invoice.payment) {
            total++;
            totalSum += (invoice.payment.total - invoice.payment.discount);
            if (invoice.payment.discount > 0) {
              discount++;
              discountSum += invoice.payment.discount;
            }

          } else {
            corrupted++;
            continue;
          }

          switch (invoice.type) {
            case "WALK_IN":
              walkin++;
              walkinSum += (invoice.payment.total - invoice.payment.discount);
              walkinTip += invoice.payment.tip;
              walkinGratuity += invoice.payment.gratuity;
              break;
            case "PICK_UP":
              pickup++;
              pickupSum += (invoice.payment.total - invoice.payment.discount);
              pickupTip += invoice.payment.tip;
              pickupGratuity += invoice.payment.gratuity;
              break;
            case "DELIVERY":
              delivery++;
              deliverySum += (invoice.payment.total - invoice.payment.discount);
              deliveryTip += invoice.payment.tip;
              deliveryGratuity += invoice.payment.gratuity;
              if (!invoice.deliveryFree && invoice.payment.delivery) {
                deliveryFee += invoice.payment.delivery;
                deliveryFeeCount++;
              }
              deliveryFee += invoice.deliveryFree ? 0 : invoice.payment.delivery;
              if (invoice.driver) {
                if (driver.hasOwnProperty(invoice.driver)) {
                  let name = invoice.driver;
                  driver[name].count++;
                  driver[name].total += (invoice.payment.total - invoice.payment.discount);
                  driver[name].discount += (invoice.payment.discount ? invoice.payment.discount : 0);
                  driver[name].tip += (invoice.payment.tip ? invoice.payment.tip : 0);
                  driver[name].gratuity += (invoice.payment.gratuity ? invoice.payment.grauity : 0);
                  driver[name].charge += (invoice.deliveryFree ? 0 : invoice.payment.delivery ? invoice.payment.delivery : 0);
                } else {
                  driver[invoice.driver] = {
                    count: 1,
                    total: invoice.payment.total,
                    discount: invoice.payment.discount ? invoice.payment.discount : 0,
                    tip: invoice.payment.tip ? invoice.payment.tip : 0,
                    gratuity: invoice.payment.gratuity ? invoice.payment.gratuity : 0,
                    charge: invoice.deliveryFree ? 0 : invoice.payment.delivery ? invoice.payment.delivery : 0
                  }
                }
              }
              break;
            case "DINE_IN":
              dinein++;
              dineinSum += (invoice.payment.total - invoice.payment.discount);
              dineinTip += invoice.payment.tip;
              dineinGratuity += invoice.payment.gratuity;
              break;
            case "BAR":
              bar++;
              barSum += (invoice.payment.total - invoice.payment.discount);
              barTip += invoice.payment.tip;
              barGratuity += invoice.payment.gratuity;
          }
          if (!invoice.settled) {
            unsettle++;
            unsettleSum += (invoice.payment.total - invoice.payment.paid);
          } else {
            settle++;
            settleSum += invoice.payment.paid;
            invoice.payment.hasOwnProperty('paidCash') && (cash += parseFloat(invoice.payment.paidCash));
            invoice.payment.hasOwnProperty('paidCredit') && (credit += parseFloat(invoice.payment.paidCredit));
            invoice.payment.hasOwnProperty('paidGift') && (credit += parseFloat(invoice.payment.paidGift));
          }
        } else if (invoice.status === 0) {
          voided++;
          voidedSum += invoice.payment.total;
        }

        if (this.detail === 'detail') {
          invoice.content.forEach(item => {
            if (!counter.hasOwnProperty(item.usEN)) {
              //create new counter
              counter[item.usEN] = {
                text: item[this.language],
                count: 1,
                amount: item.single * item.qty
              }
            } else {
              counter[item.usEN].count++;
              counter[item.usEN].amount += item.single * item.qty;
            }
          })
        }
      }

      switch (this.detail) {
        case "simple":
          return {
            summary: [
              {
                text: this.text('WALK_IN'),
                count: walkin,
                amount: walkinSum
              }, {
                text: this.text('PICK_UP'),
                count: pickup,
                amount: pickupSum
              }, {
                text: this.text('DELIVERY'),
                count: delivery,
                amount: deliverySum
              }, {
                text: this.text('DINE_IN'),
                count: dinein,
                amount: dineinSum
              }, {
                text: this.text('TOTAL'),
                count: total,
                amount: totalSum
              }
            ]
          };
        case "basic":
          return {
            summary: [
              {
                text: this.text('WALK_IN'),
                count: walkin,
                amount: walkinSum,
                tip: walkinTip,
                gratuity: walkinGratuity
              }, {
                text: this.text('PICK_UP'),
                count: pickup,
                amount: pickupSum,
                tip: pickupTip,
                gratuity: pickupGratuity
              }, {
                text: this.text('DELIVERY'),
                count: delivery,
                amount: deliverySum,
                tip: deliveryTip,
                gratuity: deliveryGratuity,
                fee: deliveryFee
              },
              {
                text: this.text('DELIVERY_FEE'),
                count: deliveryFeeCount,
                amount: deliveryFee
              },
              {
                text: this.text('DINE_IN'),
                count: dinein,
                amount: dineinSum,
                tip: dineinTip,
                gratuity: dineinGratuity
              },
              {
                text: this.text('DISCOUNT'),
                count: discount,
                amount: discountSum,
                tip: 0,
                gratuity: 0
              },
              {
                text: this.text('TOTAL'),
                count: total,
                amount: totalSum,
                tip: totalTip,
                gratuity: totalGratuity
              }
            ]
          };
        case "detail":
          let giftSummary = this.calculateGiftCard(giftCard);
          return {
            summary: [
              {
                text: this.text('WALK_IN'),
                count: walkin,
                amount: walkinSum,
                tip: walkinTip,
                gratuity: walkinGratuity
              }, {
                text: this.text('PICK_UP'),
                count: pickup,
                amount: pickupSum,
                tip: pickupTip,
                gratuity: pickupGratuity
              }, {
                text: this.text('DELIVERY'),
                count: delivery,
                amount: deliverySum,
                tip: deliveryTip,
                gratuity: deliveryGratuity,
                fee: deliveryFee
              },
              {
                text: this.text('DELIVERY_FEE'),
                count: deliveryFeeCount,
                amount: deliveryFee
              },
              {
                text: this.text('DINE_IN'),
                count: dinein,
                amount: dineinSum,
                tip: dineinTip,
                gratuity: dineinGratuity
              }, {
                text: this.text('TOTAL'),
                count: total,
                amount: totalSum,
                tip: totalTip,
                gratuity: totalGratuity
              }
            ],
            giftCard:[
              {
                text:this.text('GIFT_CARD_SALES'),
                count:giftSummary.count,
                amount:giftSummary.creditAmount
              },{
                text:this.text("GIFT_CARD_DEBET"),
                count:giftSummary.debetCount,
                amount:-giftSummary.debetAmount
              }
            ],
            top: Object.values(counter).sort((a, b) => a.count > b.count ? -1 : 1).slice(0, 10)
          };
        case "full":
          return {

          }
      }
      return {
        total, totalSum, totalTip, totalGratuity,
        walkin, walkinSum, walkinTip, walkinGratuity,
        pickup, pickupSum, pickupTip, pickupGratuity,
        delivery, deliverySum, deliveryTip, deliveryGratuity, deliveryFee,
        dinein, dineinSum, dineinTip, dineinGratuity,
        unsettle, unsettleSum,
        voided, voidedSum,
        cash, credit, gift,
        driver, corrupted
      }
    },
    calculateGiftCard(data) {
      let date = today();
      let giftCard = {
        count: 0,
        creditAmount: 0,
        debetCount:0,
        debetAmount: 0
      };
      let datas = [].concat.apply([], data.map(gc => gc.activity))
        .filter(trans => trans.date === date)
        .forEach(trans => {
          switch (trans.type) {
            case "ACTIVATION":
              giftCard.count++;
              giftCard.creditAmount += parseFloat(trans.amount);
              break;
            case "DEBET":
            case "CASHOUT":
              giftCard.debetCount++;
              giftCard.debetAmount += parseFloat(trans.amount);
              break;
          }
        });
      return giftCard;
    }
  },
  computed: {
    ...mapGetters(['config', 'language'])
  },
  sockets: {
    REPORT_RESULTS(data) {
      console.log(data);
      this.getReport(data);
    }
  },
  components: {
    checkbox
  }
}
</script>

<style scoped>
.report {
  width: 400px;
  position: relative;
}

.inner .btn {
  width: 80%;
  margin: 10px auto;
}

.inner {
  text-align: center;
  padding: 10px 0;
}

.row {
  padding: 10px;
}

.row h3 {
  margin-bottom: 10px;
  color: #263238;
}

.wrap {
  display: flex;
  justify-content: center;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: #fff;
}

.wrap>div {
  font-size: 20px;
  flex: 1;
  border-right: 1px solid #ddd;
}

input[type="radio"] {
  display: none;
}

fieldset {
  margin: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: #fff;
  text-align: left;
  padding: 10px;
}

legend {
  font-weight: bold;
}

.btn {
  flex: 1;
  margin: 4px;
}

label {
  cursor: pointer;
  padding: 10px;
  display: inline-flex;
}

.wrap div:last-child {
  border-right: none;
}

input[type="radio"]:checked+label {
  color: #2196F3;
}
</style>
