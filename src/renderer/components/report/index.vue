<template>
    <div class="popupMask center dark">
        <div class="window" v-show="!component">
            <header class="title">
                <span>{{$t('title.report')}}</span>
                <i class="fa fa-times" @click="init.reject"></i>
            </header>
            <div class="inner">
                <section class="option">
                    <div class="for">
                        <span>{{$t('report.range')}}</span>
                        <span class="range">
                            <span v-if="reportRange">{{reportRange.from | moment('YYYY-MM-DD HH:mm')}} ~ {{reportRange.to | moment('YYYY-MM-DD HH:mm')}}</span>
                        </span>
                        <checkbox v-model="daily" label="report.dailyReport"></checkbox>
                    </div>
                    <div class="rangeWrap">
                        <div>
                            <input type="radio" name="range" v-model="range" value="today" id="today" @click="getRange('today')">
                            <label for="today">{{$t('report.today')}}</label>
                        </div>
                        <div>
                            <input type="radio" name="range" v-model="range" value="week" id="week" @click="getRange('week')">
                            <label for="week">{{$t('report.currentWeek')}}</label>
                        </div>
                        <div>
                            <input type="radio" name="range" v-model="range" value="month" id="month" @click="getRange('month')">
                            <label for="month">{{$t('report.currentMonth')}}</label>
                        </div>
                        <div>
                            <input type="radio" name="range" v-model="range" value="last" id="last" @click="getRange('last')">
                            <label for="last">{{$t('report.lastMonth')}}</label>
                        </div>
                        <div>
                            <input type="radio" name="range" v-model="range" value="custom" id="custom" @click="openCalendar">
                            <label for="custom">{{$t('report.setDate')}}</label>
                        </div>
                    </div>
                </section>
                <section class="option">
                    <div class="for">
                        <span>{{$t('report.details')}}</span>
                    </div>
                    <div class="detailWrap">
                        <div class="left">
                            <h5>{{$t('report.configuration')}}</h5>
                            <radiobox v-model="reportDetail" name="detail" val="simple" label="report.simple"></radiobox>
                            <radiobox v-model="reportDetail" name="detail" val="customize" label="report.customize"></radiobox>
                            <transition-group name="fadeDown" tag="div" class="options">
                                <template v-if="reportDetail === 'customize'">
                                    <checkbox v-model="detailPayment" label="report.detailPayment" :key="1"></checkbox>
                                    <checkbox v-model="tipsSource" label="report.tipsSource" :key="2"></checkbox>
                                    <checkbox v-model="giftCard" label="report.giftCardSales" :key="3"></checkbox>
                                    <checkbox v-model="hourly" label="report.hourlyReport" :key="4"></checkbox>
                                    <checkbox v-model="houseAccount" label="report.redemptionReport" :key="5"></checkbox>
                                    <checkbox v-model="itemSales" label="report.itemSales" :key="6" :disabled="true"></checkbox>
                                    <checkbox v-model="categorySales" label="report.categorySales" :key="7" :disabled="true"></checkbox>
                                </template>
                            </transition-group>
                        </div>
                        <div class="right">
                            <h5>{{$t('report.performance')}}</h5>
                            <checkbox v-model="cashier" label="report.cashierLiability"></checkbox>
                            <checkbox v-model="waitStaff" label="report.staffLiability"></checkbox>
                            <checkbox v-model="driver" label="report.driverLiability"></checkbox>
                            <checkbox v-model="thirdParty" label="report.thirdPartySummary"></checkbox>
                        </div>
                    </div>
                </section>
            </div>
            <footer>
                <div class="f1"></div>
                <div class="btn" @click="confirm">{{$t('button.confirm')}}</div>
            </footer>
        </div>
        <div :is="component" :init="componentData"></div>
    </div>
</template>

<script>
import { mapGetters } from "vuex";
import calendar from "./calendar";
import processor from "../common/processor";
import radiobox from "../setting/common/radio";
import checkbox from "../setting/common/checkbox";
export default {
  props: ["init"],
  components: { checkbox, radiobox, calendar, processor },
  data() {
    return {
      reportDetail: "simple",
      componentData: null,
      component: null,
      detailPayment: false,
      tipsSource: false,
      cashier: false,
      waitStaff: false,
      driver: false,
      thirdParty: false,
      range: "today",
      report: {},
      daily: false,
      hourly: false,
      giftCard: false,
      itemSales: false,
      categorySales: false,
      houseAccount: false
    };
  },
  created() {
    this.getRange(this.range);
  },
  methods: {
    getRange(type) {
      let from, to;
      switch (type) {
        case "today":
          from = +moment()
            .subtract(4, "hours")
            .hours(4)
            .minutes(0)
            .seconds(0)
            .milliseconds(0);
          to = +moment()
            .subtract(4, "hours")
            .hours(3)
            .minutes(59)
            .seconds(59)
            .add(1, "days");
          break;
        case "week":
          from = +moment()
            .subtract(4, "hours")
            .startOf("week")
            .hours(4);
          to = +moment()
            .subtract(4, "hours")
            .endOf("week")
            .add(1, "days")
            .hours(3)
            .minutes(59)
            .seconds(59);
          break;
        case "month":
          from = +moment()
            .subtract(4, "hours")
            .startOf("month")
            .hours(4);
          to = +moment()
            .subtract(4, "hours")
            .endOf("month")
            .add(1, "days")
            .hours(3)
            .minutes(59)
            .seconds(59);
          break;
        case "last":
          from = +moment()
            .subtract(4, "hours")
            .subtract(1, "months")
            .startOf("month")
            .hours(4);
          to = +moment()
            .subtract(4, "hours")
            .subtract(1, "months")
            .endOf("month")
            .add(1, "days")
            .hours(3)
            .minutes(59)
            .seconds(59);
          break;
      }
      this.reportRange = { from, to };
    },
    openCalendar() {
      new Promise((resolve, reject) => {
        this.componentData = { resolve, reject };
        this.component = "calendar";
      })
        .then(date => {
          this.reportRange = date;
          this.$q();
        })
        .catch(() => {
          this.range = "today";
          this.getRange("today");
          this.$q();
        });
    },
    confirm() {
      this.fetchData()
        .then(this.dataAnalysis)
        .then(this.printReport)
        .catch(this.reportError);
    },
    fetchData() {
      return new Promise(next => {
        this.$socket.emit("[REPORT] INITIAL_DATA", this.reportRange, data => {
          next(data);
        });
      });
    },
    dataAnalysis(data) {
      return new Promise(next => {
        let { invoices, transactions } = data;

        if (transactions.length === 0) {
          transactions = this.getTransactionsFromInvoices(invoices);
        }

        this.report["General Report"] = this.salesAnalysis(data);
        if (this.hourly)
          this.report["Hourly Report"] = this.hourlySalesReport(invoices);
        if (this.houseAccount)
          this.report["House Account"] = this.houseAccountReport(invoices);
        if (this.itemSales)
          this.report["Item Sales"] = this.itemSalesReport(invoices);
        if (this.categorySales)
          this.report["Category Sales"] = this.categorySalesReport(invoices);
        if (this.cashier)
          this.report["Cashier Report"] = this.cashierReport(transactions);
        if (this.driver) this.report["Driver Report"] = this.driverReport(data);
        next();
      });
    },
    salesAnalysis(data) {
      let report = [];
      let { invoices, transactions } = data;
      let validInvoices = invoices.filter(invoice => invoice.status === 1);
      let sum = (a, b) => a + b;

      if (this.range === "today") {
        report.push({
          text: this.$t("report.date"),
          style: "bold space",
          value: today()
        });
      } else {
        report.push({
          text: this.$t("report.fromDate"),
          style: "bold",
          value: moment(this.reportRange.from).format("YYYY-MM-DD HH:mm")
        });

        report.push({
          text: this.$t("report.toDate"),
          style: "bold space",
          value: moment(this.reportRange.to).format("YYYY-MM-DD HH:mm")
        });
      }

      let foodSales = validInvoices
        .map(invoice => invoice.payment.subtotal)
        .reduce(sum, 0);

      report.push({
        text: this.$t("report.itemSales"),
        style: "",
        value: foodSales.toFixed(2)
      });

      let tax = validInvoices
        .map(invoice => invoice.payment.tax)
        .reduce(sum, 0);

      report.push({
        text: this.$t("report.tax"),
        style: "",
        value: tax.toFixed(2)
      });

      let discount = validInvoices
        .map(invoice => invoice.payment.discount)
        .reduce(sum, 0);

      report.push({
        text: this.$t("report.discount"),
        style: "",
        value: "- " + discount.toFixed(2)
      });
      //add discount detail here

      let salesTotal = foodSales + tax - discount;

      report.push({
        text: this.$t("report.salesTotal"),
        style: "space bold total",
        value: "$ " + salesTotal.toFixed(2)
      });

      if (this.reportDetail === "simple") return report;

      let orderPayment = transactions.filter(t => (t.for = "Order"));

      let cashTotal = orderPayment
        .filter(t => t.type === "CASH")
        .map(t => t.actual - t.tip)
        .reduce(sum, 0);

      report.push({
        text: this.$t("report.cashTotal"),
        style: "",
        value: cashTotal.toFixed(2)
      });

      let creditTransactions = orderPayment.filter(t => t.type === "CREDIT");
      let creditTotal = creditTransactions.map(t => t.actual).reduce(sum, 0);

      if (this.detailPayment) {
        let creditType = new Set();
        creditTransactions.map(t => t.subType).forEach(t => creditType.add(t));

        report.push({
          text:
            this.$t("report.creditTotal") + ` ( ${creditTransactions.length} )`,
          style: this.creditTotal > 0 ? "bold" : "",
          value: creditTotal.toFixed(2)
        });

        Array.from(creditType).forEach(type => {
          let tmp = creditTransactions.filter(t => t.subType === type);
          let total = tmp.map(t => t.actual).reduce(sum, 0);

          report.push({
            text: type + ` ( ${tmp.length} )`,
            style: "indent",
            value: `( ${total.toFixed(2)} )`
          });
        });

        report.push({
          text: "",
          style: "space",
          value: ""
        });
      } else {
        report.push({
          text: this.$t("report.creditTotal"),
          style: "",
          value: creditTotal.toFixed(2)
        });
      }

      //release memory
      creditTransactions = null;

      let thirdPartyTransactions = orderPayment.filter(t => t.type === "THIRD");
      let thirdPartyTotal = thirdPartyTransactions
        .map(t => t.actual)
        .reduce(sum, 0);

      if (this.detailPayment) {
        let thirdType = new Set();
        thirdPartyTransactions
          .map(t => t.subType)
          .forEach(t => thirdType.add(t));

        report.push({
          text: this.$t("report.thirdPartyTotal"),
          style: this.thirdPartyTotal > 0 ? "bold" : "",
          value: thirdPartyTotal.toFixed(2)
        });

        Array.from(thirdType).forEach(type => {
          let total = thirdPartyTransactions
            .filter(t => t.subType === type)
            .map(t => t.actual)
            .reduce(sum, 0);

          report.push({
            text: type,
            style: "indent",
            value: `( ${total.toFixed(2)} )`
          });
        });

        report.push({
          text: "",
          style: "space",
          value: ""
        });
      } else {
        report.push({
          text: this.$t("report.thirdPartyTotal"),
          style: "space",
          value: thirdPartyTotal.toFixed(2)
        });
      }

      //release memory
      thirdPartyTransactions = null;

      let settledTotal = transactions
        .map(transaction => transaction.actual)
        .reduce(sum, 0);

      report.push({
        text: this.$t("report.settled"),
        style: "",
        value: settledTotal.toFixed(2)
      });

      let unsettled = invoices.filter(invoice => !invoice.settled && invoice.status === 1);

      report.push({
        text: this.$t("report.unsettled") + ` ( ${unsettled.length} )`,
        style: "space",
        value: unsettled
          .map(invoice => invoice.payment.subtotal + invoice.payment.tax)
          .reduce(sum, 0)
          .toFixed(2)
      });

      let tipTotal = orderPayment.map(t => t.tip).reduce(sum, 0);

      if (this.tipsSource) {
        let tipFrom = new Set();
        let tipTrans = orderPayment.filter(t => t.tip > 0);
        tipTrans.forEach(t => tipFrom.add(t.subType || t.type));

        if (tipTotal === 0) {
          report.push({
            text: this.$t("report.tips"),
            style: "space",
            value: "0.00"
          });
        } else {
          report.push({
            text: this.$t("report.tipTotal"),
            style: "bold",
            value: "$ " + tipTotal.toFixed(2)
          });

          Array.from(tipFrom).forEach(type => {
            let total = tipTrans
              .filter(t => (t.subType ? t.subType === type : t.type === type))
              .map(t => t.tip)
              .reduce(sum, 0);

            report.push({
              text: this.$t("report.from", type),
              style: "indent",
              value: `( ${total.toFixed(2)} )`
            });
          });

          report.push({
            text: "",
            style: "space",
            value: ""
          });
        }
      } else {
        report.push({
          text: this.$t("report.tipTotal"),
          style: "space",
          value: tipTotal.toFixed(2)
        });
      }

      let deliveryFee = validInvoices
        .map(t => t.payment.delivery)
        .reduce(sum, 0);

      let gratuity = validInvoices.map(t => t.payment.gratuity).reduce(sum, 0);

      report.push({
        text: this.$t("report.others"),
        style: "bold",
        value: "$ " + (deliveryFee + gratuity).toFixed(2)
      });

      report.push({
        text: this.$t("report.deliveryFee"),
        style: "indent",
        value: `( ${deliveryFee.toFixed(2)} )`
      });

      report.push({
        text: this.$t("report.gratuity"),
        style: "indent space",
        value: `( ${gratuity.toFixed(2)} )`
      });

      let payout = orderPayment
        .filter(t => t.for === "Payout")
        .map(t => t.actual)
        .reduce(sum, 0);

      report.push({
        text: this.$t("report.payout"),
        style: "space",
        value: "- " + payout.toFixed(2)
      });

      return report;
    },
    hourlySalesReport(invoices) {
      let hours = {};

      invoices.forEach(invoice => {
        if (invoice.status === 1) {
          let hour = new Date(invoice.time).getHours();
          let { total, discount } = invoice.payment;
          if (hours.hasOwnProperty(hour)) {
            hours[hour].value += total - discount;
            hours[hour].count++;
          } else {
            hours[hour] = {
              count: 1,
              value: total - discount
            };
          }
        }
      });

      let report = [];

      Object.keys(hours).forEach(hour => {
        report.push({
          text: `${hour}:00 (${hours[hour].count})`,
          style: "",
          value: hours[hour].value.toFixed(2)
        });
      });

      return report;
    },
    houseAccountReport(invoices) {
      let records = {};

      invoices.forEach(invoice => {
        if (
          invoice.status === 0 &&
          invoice.void.note === "Manager Redemption"
        ) {
          let { total } = invoice.payment;
          if (records.hasOwnProperty(invoice.void.by)) {
            records[invoice.void.by].count++;
            records[invoice.void.by].value += total;
          } else {
            records[invoice.void.by] = {
              count: 1,
              value: total
            };
          }
        }
      });

      let report = [];

      Object.keys(records).forEach(manager => {
        report.push({
          text: manager + ` ( ${records[manager].count} )`,
          style: "",
          value: records[manager].value.toFixed(2)
        });
      });

      return report;
    },
    itemSalesReport(invoices) {
      let items = invoices
        .filter(invoice => invoice.status === 1)
        .map(invoice => invoice.content)
        .reduce((a, b) => a.push(...b), []);

      let records = {};

      items.forEach(item => {
        if (records.hasOwnProperty(item._id)) {
          records[item._id].count += item.qty;
          records[item._id].value += item.single * item.qty;
        } else {
          records[item._id] = {
            text: item[this.language],
            count: item.qty,
            value: item.single * item.qty
          };
        }
      });

      let report = [];

      Object.keys(records).forEach(item => {
        report.push({
          text: records[item].text,
          style: "",
          value: records[item].value.toFixed(2)
        });
      });

      return report;
    },
    categorySalesReport(data) {},
    cashierReport(transactions) {},
    driverReport(data) {
      let { invoices, transactions } = data;
      let drivers = new Set();
      let deliveries = invoices.filter(
        invoice => invoice.type === "DELIVERY" && invoice.status === 1
      );

      deliveries.forEach(invoice => {
        invoice.driver && drivers.add(invoice.driver);
      });

      let report = [];

      drivers.forEach(driver => {
        let order = deliveries.filter(invoice => invoice.driver === driver);
        let count = order.length;
        let value = order
          .map(
            invoice =>
              invoice.payment.subtotal +
              invoice.payment.tax -
              invoice.payment.discount
          )
          .reduce((a, b) => a + b, 0);
        let tips = order
          .map(invoice => invoice.payment.tip)
          .reduce((a, b) => a + b, 0);
        let fees = order
          .map(invoice => invoice.payment.delivery)
          .reduce((a, b) => a + b, 0);
        let settledInvoice = order.filter(invoice => invoice.settled);

        let settled = settledInvoice
          .map(
            invoice =>
              invoice.payment.subtotal +
              invoice.payment.tax -
              invoice.payment.discount
          )
          .reduce((a, b) => a + b, 0);

        let unsettledInvoice = order.filter(invoice => !invoice.settled);
        let unsettled = unsettledInvoice
          .map(
            invoice =>
              invoice.payment.subtotal +
              invoice.payment.tax -
              invoice.payment.discount
          )
          .reduce((a, b) => a + b, 0);

        report.push({
          text: this.$t("report.driver"),
          style: "bold",
          value: "# " + driver
        });

        report.push({
          text: this.$t("report.count"),
          style: "total",
          value: count
        });

        report.push({
          text: this.$t("report.deliveryFee"),
          style: "",
          value: fees.toFixed(2)
        });

        report.push({
          text: this.$t("text.tip"),
          style: "",
          value: tips.toFixed(2)
        });

        report.push({
          text: this.$t("report.settled") + ` ( ${settledInvoice.length} )`,
          style: "",
          value: settled.toFixed(2)
        });

        report.push({
          text: this.$t("report.unsettled") + ` ( ${unsettledInvoice.length} )`,
          style: "bold space",
          value: "$ " + unsettled.toFixed(2)
        });
      });

      return report;
    },
    printReport() {
      Printer.printReport(this.report);
      this.init.resolve();
    },
    reportError(error) {
      this.$socket.emit("[SYS] RECORD", {
        type: "Software",
        event: "reportError",
        status: 0,
        cause: error,
        data: this.reportRange
      });
    }
  }
};
</script>

<style scoped>
.inner {
  padding: 15px;
}

.rangeWrap {
  display: flex;
  border: 1px solid #ddd;
  margin: 10px;
  background: #fff;
  border-radius: 4px;
}

.rangeWrap input {
  display: none;
}

.rangeWrap > div {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border-right: 1px solid #ddd;
}

.rangeWrap > div:last-child {
  border-right: none;
}

.detailWrap {
  display: flex;
  margin: 10px;
  padding: 10px;
  border: 1px solid #ddd;
  background: #fff;
  border-radius: 4px;
  width: 500px;
  height: 250px;
}

.detailWrap > div {
  flex: 1;
}

.options {
  padding-left: 25px;
}

.f1 {
  align-items: center;
  display: flex;
}

h5 {
  text-align: center;
  font-size: 20px;
  margin-bottom: 10px;
  color: #37474f;
}

.left {
  border-right: 1px solid #ddd;
}

.right {
  margin-left: 10px;
}

.rangeWrap label {
  padding: 10px;
  width: 100%;
  text-align: center;
  cursor: pointer;
}

.rangeWrap input:checked + label {
  background: #2196f3;
  color: #fff;
}

.for {
  display: flex;
}

.range {
  flex: 1;
  text-align: center;
  color: #009688;
}

.range span {
  background: #fff;
  border-radius: 4px;
  padding: 1px 10px 0;
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.3);
}
</style>