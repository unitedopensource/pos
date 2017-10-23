<template>
    <div class="popupMask center dark">
        <div class="window" v-show="!component">
            <header class="title">
                <span>{{$t('report.configuration')}}</span>
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
                            <h5>{{$t('report.statistics')}}</h5>
                            <checkbox v-model="summary" label="report.summary"></checkbox>
                            <checkbox v-model="salesFrom" label="report.salesFrom"></checkbox>
                            <checkbox v-model="settleType" label="report.settleType"></checkbox>
                            <checkbox v-model="hourly" label="report.hourlyReport"></checkbox>
                            <checkbox v-model="countCategory" label="report.categorySales"></checkbox>
                            <checkbox v-model="countItem" label="report.countItem"></checkbox>
                            <checkbox v-model="giftCard" label="report.giftCardSummary"></checkbox>
                        </div>
                        <div class="right">
                            <h5>{{$t('report.performance')}}</h5>
                            <checkbox v-model="cashier" label="report.cashierSummary"></checkbox>
                            <checkbox v-model="waitStaff" label="report.staffSummary"></checkbox>
                            <checkbox v-model="driver" label="report.driverSummary"></checkbox>
                            <checkbox v-model="thirdParty" label="report.thirdPartySummary"></checkbox>
                        </div>
                    </div>
                </section>
            </div>
            <footer>
                <div class="f1">
                    <checkbox v-model="viewInTables" label="report.viaEmail"></checkbox>
                </div>
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
import checkbox from "../setting/common/checkbox";
export default {
  props: ["init"],
  components: { checkbox, calendar, processor },
  created() {
    this.getRange(this.range);
  },
  data() {
    return {
      tip: false,
      daily: false,
      range: "today",
      hourly: false,
      driver: false,
      summary: true,
      giftCard: false,
      cashier: false,
      waitStaff: false,
      countItem: false,
      thirdParty: false,
      viewInTables: false,
      reportRange: null,
      settleType: false,
      component: null,
      componentData: null,
      countCategory: false,
      salesFrom: false,
      report: {}
    };
  },
  methods: {
    confirm() {
      this.$p("processor");
      if (this.daily) {
        let { from, to } = this.reportRange;
        from = moment(from);
        to = moment(to);
        let days = to.diff(from, "days") + 1;
        let current = 0;
        let h = to.format("HH");
        let m = to.format("mm");

        to = from
          .clone()
          .hours(h)
          .minutes(m);
        from = from.clone().subtract(1, "days");
        this.processLoop({ from, to }, current, days);
      } else {
        this.process(null, this.init.resolve);
      }
    },
    processLoop(date, current, days) {
      let { from, to } = date;
      from = from.clone().add(1, "days");
      to = to.clone().add(1, "days");
      this.reportRange = { from: +from, to: +to };
      this.process(null, () => {
        current++;
        current !== days
          ? this.processLoop({ from, to }, current, days)
          : this.init.resolve();
      });
    },
    process(date, callback) {
      Promise.all([
        this.fetchData(),
        this.fetchCreditCard(),
        this.fetchGiftCard()
      ]).then(datas => {
        this.handler(datas);
        if (!date) date = this.reportRange;
        Printer.printReport({ date, report: this.report });
        callback && callback();
      });
    },
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
            .milliseconds(0)
            .add("1", "days");
          break;
        case "week":
          from = +moment()
            .subtract(4, "hours")
            .startOf("week")
            .hours(4);
          to = +moment()
            .subtract(4, "hours")
            .endOf("week")
            .add("1", "days")
            .hours(3)
            .minutes(59)
            .seconds(59)
            .milliseconds(0);
          break;
        case "month":
          from = +moment()
            .subtract(4, "hours")
            .startOf("month")
            .hours(4);
          to = +moment()
            .subtract(4, "hours")
            .endOf("month")
            .add("1", "days")
            .hours(3)
            .minutes(59)
            .seconds(59)
            .milliseconds(0);
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
            .add("1", "days")
            .hours(3)
            .minutes(59)
            .seconds(59)
            .milliseconds(0);
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
    fetchData() {
      return new Promise(resolve => {
        this.$socket.emit("[REPORT] GATHER_ORDER_DATA", this.reportRange);
        this.$options.sockets["REPORT_ORDER_RESULTS"] = data => {
          resolve(data);
        };
      });
    },
    fetchGiftCard() {
      return new Promise(resolve => {
        if (this.giftCard) {
          this.$socket.emit("[REPORT] GATHER_GIFTCARD_DATA", this.reportRange);
          this.$options.sockets["REPORT_GIFTCARD_RESULTS"] = data => {
            resolve(data);
          };
        } else {
          resolve([]);
        }
      });
    },
    fetchCreditCard() {
      return new Promise(resolve => {
        if (this.creditCard) {
          this.$socket.emit(
            "[REPORT] GATHER_CREDITCARD_DATA",
            this.reportRange
          );
          this.$options.sockets["REPORT_CREDITCARD_RESULTS"] = data => {
            resolve(data);
          };
        } else {
          resolve([]);
        }
      });
    },
    fetchEmpolyee() {
      return new Promise(resolve => {
        if (this.waitStaff) {
          this.$socket.emit("[REPORT] GATER_EMPLOYEE_DATA", this.reportRange);
          this.$options.sockets["REPORT_WAITSTAFF_RESULTS"] = data => {
            resolve(data);
          };
        } else {
          resolve([]);
        }
      });
    },
    handler(datas) {
      this.summarize(datas[0]);
      this.report["SALES ANALYSIS"] = this.salesFrom
        ? this.salesAnalysis(datas[0])
        : null;
      this.report["CREDIT CARD"] = this.creditCardReport(datas[1]);
      this.report["GIFT CARD"] = this.giftCard
        ? this.giftCardReport(datas[2])
        : null;
      this.report["EMPLOYEE"] = this.waitStaff
        ? this.employeeReport(datas[0])
        : null;
      this.report["DRIVER"] = this.driver ? this.driverReport(datas[0]) : null;
      this.report["HOURLY REPORT"] = this.hourly
        ? this.hourlyReport(datas[0])
        : null;
      this.report["ITEM SALES"] = this.countItem
        ? this.itemCounter(datas[0])
        : null;
      this.report["CATEGORY SALES"] = this.countCategory
        ? this.categoryCounter(datas[0])
        : null;
      this.report["SOURCE REPORT"] = this.thirdParty
        ? this.sourceReport(datas[0])
        : null;
      this.report["SETTLE TYPE"] = this.settleType
        ? this.settleTypeReport(datas[0])
        : null;
    },
    employeeReport(data) {
      let staff = {};
      data.forEach(invoice => {
        if (invoice.server) {
          let name = invoice.server;
          let { subtotal, tax, tip, gratuity, discount } = invoice.payment;
          let amount =
            parseFloat(subtotal) + parseFloat(tax) - parseFloat(discount);

          if (staff.hasOwnProperty(name)) {
            staff[name]["amount"] += amount;
            staff[name]["tip"] += parseFloat(tip);
            staff[name]["gratuity"] += parseFloat(gratuity);
            staff[name]["count"]++;
          } else {
            staff[name] = {
              text: name,
              tip: parseFloat(tip),
              gratuity: parseFloat(gratuity),
              amount: amount,
              count: 1
            };
          }
        }
      });
      Object.keys(staff).forEach(name => {
        let server = staff[name];
        server.amount = [
          { Total: server.amount.toFixed(2) },
          { Tip: server.tip.toFixed(2) },
          { Gratuity: server.tip.toFixed(2) }
        ];
      });
      return staff;
    },
    sourceReport(data) {
      let source = {};
      data.forEach(invoice => {
        let name = invoice.source;
        let { subtotal, tax, discount, tip } = invoice.payment;
        let amount =
          parseFloat(subtotal) + parseFloat(tax) - parseFloat(discount);

        if (source.hasOwnProperty(name)) {
          source[name]["amount"] += amount;
          source[name]["tip"] += parseFloat(tip);
          source[name]["count"]++;
        } else {
          source[name] = {
            text: name,
            tip: parseFloat(tip),
            amount: amount,
            count: 1
          };
        }
      });
      return source;
    },
    settleTypeReport(data) {
      let settle = {};
      let tip = 0;
      let logs = [];

      data.forEach(invoice => {
        if (invoice.settled) {
          if (invoice.payment.type === "MULTIPLE") {
            invoice.splitPayment.forEach(split => {
              logs.push(...split.log);
            });
          } else {
            logs.push(...invoice.payment.log);
          }
        }
      });

      let types = new Set();
      logs.forEach(log => {
        types.add(log.type);
      });
      types.forEach(type => {
        let list = logs.filter(log => log.type === type);
        let count = list.length;
        let amount = list
          .map(log => log.paid - log.change)
          .reduce((a, b) => a + b, 0);
        let tip = list
          .map(log => parseFloat(log.tip || 0))
          .reduce((a, b) => a + b, 0);

        settle[type] = {
          text: type,
          amount: [
            { Total: toFixed(amount, 2).toFixed(2) },
            { Tip: toFixed(tip, 2).toFixed(2) }
          ],
          count
        };
      });
      return settle;
    },
    driverReport(data) {
      let drivers = {
        All: {
          text: this.$t("text.allDeliveries"),
          amount: 0,
          tip: 0,
          fee: 0,
          count: 0
        }
      };
      data.forEach(invoice => {
        let { subtotal, tax, discount, tip, delivery } = invoice.payment;
        let amount =
          parseFloat(subtotal) + parseFloat(tax) - parseFloat(discount);

        if (invoice.driver && invoice.status === 1) {
          let name = invoice.driver;

          if (drivers.hasOwnProperty(name)) {
            drivers[name]["amount"] += amount;
            drivers[name]["tip"] += parseFloat(tip);
            drivers[name]["fee"] += parseFloat(delivery);
            drivers[name]["count"]++;
          } else {
            drivers[name] = {
              text: "#" + name,
              tip: parseFloat(tip),
              amount: amount,
              count: 1,
              fee: parseFloat(delivery)
            };
          }
        }

        if (invoice.type === "DELIVERY" && invoice.status === 1) {
          drivers.All.amount += amount;
          drivers.All.tip += parseFloat(tip);
          drivers.All.fee += parseFloat(delivery);
          drivers.All.count++;
        }
      });

      Object.keys(drivers).forEach(name => {
        let driver = drivers[name];
        driver.amount = [
          { Total: driver.amount.toFixed(2) },
          { Tip: driver.tip.toFixed(2) },
          { Fee: driver.fee.toFixed(2) }
        ];
      });
      return drivers;
    },
    creditCardReport() {},
    giftCardReport(data) {
      data = data || [];
      let activation = 0,
        bonus = 0,
        bonusAmount = 0,
        initialAmount = 0,
        creditAmount = 0,
        debitAmount = 0,
        debit = 0,
        credit = 0;
      data.forEach(log => {
        let amount = parseFloat(log.change);
        switch (log.type) {
          case "Activation":
            activation++;
            initialAmount += amount;
            creditAmount += amount;
            if (log.bonus) {
              bonus++;
              bonus += log.bonus;
            }
            break;
          case "Reload":
            credit++;
            creditAmount += amount;
            break;
          case "Transaction":
          case "Purchase":
            debit++;
            debitAmount += amount;
            break;
        }
      });
      return [
        {
          text: this.$t("card.activation"),
          count: activation,
          amount: initialAmount
        },
        {
          text: this.$t("card.activationBonus"),
          count: bonus,
          amount: bonusAmount
        },
        {
          text: this.$t("card.giftCardCredit"),
          count: credit,
          amount: creditAmount
        },
        {
          text: this.$t("card.giftCardDebit"),
          count: debit,
          amount: debitAmount
        }
      ];
    },
    summarize(data) {
      let valid = data.filter(ticket => ticket.status === 1);
      let validPayment = valid.map(ticket => ticket.payment);
      let settled = data.filter(
        ticket => ticket.settled && ticket.status === 1
      );
      let payments = [];
      data.forEach(ticket => {
        if (ticket.splitPayment) {
          payments.push(...ticket.splitPayment);
        } else {
          payments.push(ticket.payment);
        }
      });

      let counter = (a, b) => a + b;

      let grossAmount = validPayment
        .map(
          ticket =>
            parseFloat(ticket.subtotal) +
            parseFloat(ticket.tax) +
            parseFloat(ticket.delivery) +
            parseFloat(ticket.tip) +
            parseFloat(ticket.gratuity)
        )
        .reduce(counter, 0);

      let discount = validPayment.filter(ticket => ticket.discount > 0);

      let discountAmount = discount
        .map(ticket => parseFloat(ticket.discount))
        .reduce(counter, 0);

      let netAmount = toFixed(grossAmount - discountAmount, 2);

      let itemSalesAmount = validPayment
        .map(ticket => parseFloat(ticket.subtotal))
        .reduce(counter, 0);

      let taxAmount = validPayment
        .map(ticket => parseFloat(ticket.tax))
        .reduce(counter, 0);

      let tipAmount = validPayment
        .map(ticket => parseFloat(ticket.tip))
        .reduce(counter, 0);

      let gratuityAmount = validPayment
        .map(ticket => parseFloat(ticket.gratuity))
        .reduce(counter, 0);

      // receivable should consider gift card transaction, cash out , and other activities
      let receivable = toFixed(netAmount, 2);

      this.report["SUMMARY"] = this.summary
        ? [
            {
              text: this.$t("report.grossSales"),
              count: validPayment.length,
              amount: grossAmount
            },
            {
              text: this.$t("report.itemSales"),
              count: 0,
              amount: itemSalesAmount
            },
            {
              text: this.$t("report.tax"),
              count: 0,
              amount: taxAmount
            },
            {
              text: this.$t("report.discount"),
              count: discount.length,
              amount: -discountAmount
            },
            {
              text: this.$t("report.tips"),
              count: 0,
              amount: tipAmount
            },
            {
              text: this.$t("report.gratuity"),
              count: 0,
              amount: gratuityAmount
            },
            {
              text: "&nbsp;",
              count: 0,
              amount: ""
            },
            {
              text: this.$t("report.receivable"),
              count: 0,
              amount: receivable
            }
          ]
        : null;
    },
    salesAnalysis(data) {
      this.report["SALES ANALYZE"] = [];
      let settled = data.filter(ticket => ticket.settled);
      let unsettled = data.filter(ticket => !ticket.settled);
      let counter = (a, b) => a + b;
      let logs = [];
      let temp;

      settled.map(ticket => {
        if (ticket.hasOwnProperty("splitPayment")) {
          ticket.splitPayment.forEach(split => {
            logs.push(...split.log);
          });
        } else {
          logs.push(...ticket.payment.log);
        }
      });

      let settledCount = settled.length;
      let settledAmount = settled
        .map(ticket => ticket.payment.paid)
        .reduce(counter, 0);
      this.report["SALES ANALYZE"].push({
        text: this.$t("type.settled"),
        count: settledCount,
        amount: settledAmount
      });

      let unsettledCount = unsettled.length;
      let unsettledAmount = unsettled
        .map(ticket => ticket.payment.balance)
        .reduce(counter, 0);
      this.report["SALES ANALYZE"].push({
        text: this.$t("type.unsettled"),
        count: unsettledCount,
        amount: unsettledAmount
      });

      this.report["SALES ANALYZE"].push({
        text: "&nbsp;",
        count: 0,
        amount: ""
      });

      temp = logs.filter(log => log.type === "CASH");
      let cashCount = temp.length;
      let cashAmount = temp
        .map(log => toFixed(log.paid - log.change, 2))
        .reduce(counter, 0);
      this.report["SALES ANALYZE"].push({
        text: this.$t("report.cash"),
        count: cashCount,
        amount: cashAmount
      });

      temp = logs.filter(log => log.type === "CREDIT");
      let creditCount = temp.length;
      let creditAmount = temp
        .map(log => toFixed(log.paid - log.tip, 2))
        .reduce(counter, 0);
      this.report["SALES ANALYZE"].push({
        text: this.$t("report.creditCard"),
        count: creditCount,
        amount: creditAmount
      });

      let creditTipCount = temp.filter(log => log.tip > 0).length;
      let creditTipAmount = temp
        .map(log => toFixed(log.tip, 2))
        .reduce(counter, 0);
      this.report["SALES ANALYZE"].push({
        text: this.$t("report.creditCardTip"),
        count: creditTipCount,
        amount: creditTipAmount
      });

      temp = logs.filter(log => log.type === "GIFT");
      let giftCount = temp.length;
      let giftAmount = temp.map(log => toFixed(log.paid, 2)).reduce(counter, 0);
      this.report["SALES ANALYZE"].push({
        text: this.$t("report.giftCard"),
        count: giftCount,
        amount: giftAmount
      });

      temp = logs.filter(
        log =>
          log.type !== "CASH" && log.type !== "CREDIT" && log.type !== "GIFT"
      );
      let thirdPartyCount = temp.length;
      let thirdPartyAmount = temp
        .map(log => toFixed(log.paid, 2))
        .reduce(counter, 0);
      this.report["SALES ANALYZE"].push({
        text: this.$t("report.thirdParty"),
        count: thirdPartyCount,
        amount: thirdPartyAmount
      });
      this.report["SALES ANALYZE"].push({
        text: "&nbsp;",
        count: 0,
        amount: ""
      });

      let tipAmount = logs.map(log => parseFloat(log.tip)).reduce(counter, 0);
      let gratuityAmount = settled
        .map(ticket => parseFloat(ticket.payment.gratuity))
        .reduce(counter, 0);
      this.report["SALES ANALYZE"].push({
        text: this.$t("report.surcharge"),
        count: 0,
        amount: tipAmount + gratuityAmount
      });

      let actualAmount = toFixed(
        cashAmount +
          creditAmount +
          creditTipAmount +
          giftAmount +
          thirdPartyAmount,
        2
      );

      this.report["SALES ANALYZE"].unshift({
        text: this.$t("report.actualAmount"),
        count: 0,
        amount: actualAmount
      });
      this.report["SALES ANALYZE"].push({
        text: "&nbsp;",
        count: 0,
        amount: ""
      });

      //remove from memory
      logs = null;

      let orderTypes = new Set();

      settled.forEach(ticket => {
        orderTypes.add(ticket.type);
      });

      orderTypes.forEach(type => {
        let order = settled.filter(ticket => ticket.type === type);
        let count = order.length;
        let amount = order
          .map(ticket => parseFloat(ticket.payment.paid))
          .reduce(counter, 0);
        this.report["SALES ANALYZE"].push({
          text: this.$t("type." + type),
          count,
          amount
        });
      });
    },
    hourlyReport(data) {
      let hours = {};
      data.forEach(ticket => {
        let hour = new Date(ticket.time).getHours();
        let pay = ticket.payment;
        let { subtotal, tax, discount } = pay;
        let amount =
          parseFloat(subtotal) + parseFloat(tax) - parseFloat(discount);
        if (!hours.hasOwnProperty(hour)) {
          hours[hour] = {
            text: `${hour}:00`,
            count: 1,
            amount
          };
        } else {
          hours[hour].count++;
          hours[hour].amount += amount;
        }
      });
      return hours;
    },
    itemCounter(data) {
      let counter = {};
      data.forEach(ticket => {
        ticket.content.forEach(item => {
          if (!counter.hasOwnProperty(item.usEN)) {
            counter[item.usEN] = {
              text: item[this.language],
              count: 1,
              amount: toFixed(item.single * item.qty, 2)
            };
          } else {
            counter[item.usEN].count += item.qty;
            counter[item.usEN].amount += toFixed(item.single * item.qty, 2);
          }
        });
      });
      return Object.values(counter)
        .filter(item => item.amount > 0)
        .sort((a, b) => (a.count > b.count ? -1 : 1));
    },
    categoryCounter(data) {
      let counter = {};
      data.forEach(ticket => {
        ticket.content.forEach(item => {
          if (!counter.hasOwnProperty(item.category)) {
            counter[item.category] = {
              text:
                this.language === "zhCN"
                  ? item.categoryCN || item.category
                  : item.category,
              count: 1,
              amount: item.single * item.qty
            };
          } else {
            counter[item.category].count += item.qty;
            counter[item.category].amount += toFixed(item.single * item.qty, 2);
          }
        });
      });
      return Object.values(counter)
        .filter(item => item.amount > 0)
        .sort((a, b) => (a.count > b.count ? -1 : 1));
    },
    generateCSV() {
      let excel = [["Index", "Date", "Content"]];
      let csvRows = [];

      for (let i = 1; i < 10; i++) {
        excel.push([i, "2017-01-" + i, i * 2]);
      }

      for (let i = 0; i < excel.length; i++) {
        csvRows.push(excel[i].join(","));
      }

      let csvFile = csvRows.join("%0A");
      console.log("data:attachment/csv," + csvFile);
    }
  },
  computed: {
    ...mapGetters(["config", "language"])
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
}

.detailWrap > div {
  flex: 1;
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