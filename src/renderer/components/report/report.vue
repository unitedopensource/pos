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
                            <checkbox v-model="salesCategory" label="report.salesCategory"></checkbox>
                            <checkbox v-model="countCategory" label="report.categorySales"></checkbox>
                            <checkbox v-model="hourly" label="report.hourlyReport"></checkbox>
                            <!-- <checkbox v-model="tip" label="report.tipSummary"></checkbox> -->
                            <checkbox v-model="settleType" label="report.settleType"></checkbox>
                            <checkbox v-model="giftCard" label="report.giftCardSummary"></checkbox>
                            <checkbox v-model="countItem" label="report.countItem"></checkbox>
                        </div>
                        <div class="right">
                            <h5>{{$t('report.performance')}}</h5>
                            <checkbox v-model="waitStaff" label="report.staffSummary"></checkbox>
                            <checkbox v-model="driver" label="report.driverSummary"></checkbox>
                            <checkbox v-model="thirdParty" label="report.thirdPartySummary"></checkbox>
                        </div>
                    </div>
                </section>
            </div>
            <footer>
                <div class="f1">
                    <checkbox v-model="emailReport" label="report.viaEmail"></checkbox>
                </div>
                <div class="btn" @click="confirm">{{$t('button.confirm')}}</div>
            </footer>
        </div>
        <div :is="component" :init="componentData"></div>
    </div>
</template>

<script>
import { mapGetters } from 'vuex'
import Printer from '../../print'
import calendar from './calendar'
import checkbox from '../setting/common/checkbox'
import processor from '../common/processor'
export default {
    props: ['init'],
    components: { checkbox, calendar, processor },
    created() {
        this.getRange(this.range)
    },
    data() {
        return {
            tip: false,
            daily: false,
            range: 'today',
            hourly: false,
            driver: false,
            summary: true,
            giftCard: false,
            waitStaff: false,
            countItem: false,
            thirdParty: false,
            emailReport: false,
            reportRange: null,
            settleType: false,
            component: null,
            componentData: null,
            countCategory: false,
            salesCategory: false,
            report: {}
        }
    },
    methods: {
        confirm() {
            this.$p('processor');
            if (this.daily) {
                let { from, to } = this.reportRange;
                from = moment(from);
                to = moment(to);
                let days = to.diff(from, 'days') + 1;
                let current = 0;
                let h = to.format('HH');
                let m = to.format('mm');

                to = from.clone().hours(h).minutes(m);
                from = from.clone().subtract(1, 'days');
                this.processLoop({ from, to }, current, days);
            } else {
                this.process(null, this.init.resolve);
            }
        },
        processLoop(date, current, days) {
            let { from, to } = date;
            from = from.clone().add(1, 'days');
            to = to.clone().add(1, 'days');
            this.reportRange = { from: +from, to: +to };
            this.process(null, () => {
                current++;
                current !== days ? this.processLoop({ from, to }, current, days) : this.init.resolve();
            });
        },
        process(date, callback) {
            Promise.all([this.fetchData(), this.fetchCreditCard(), this.fetchGiftCard()]).then(datas => {
                this.handler(datas);
                if (!date) date = this.reportRange;
                Printer.init(this.config).setJob("report").print({ date, report: this.report });
                callback && callback();
            })
        },
        getRange(type) {
            let from, to;
            switch (type) {
                case 'today':
                    from = +moment().subtract(4, 'hours').hours(4).minutes(0).seconds(0).milliseconds(0);
                    to = +moment().subtract(4, 'hours').hours(3).minutes(59).seconds(59).milliseconds(0).add('1', 'days');
                    break;
                case 'week':
                    from = +moment().subtract(4, 'hours').startOf('week').hours(4);
                    to = +moment().subtract(4, 'hours').endOf('week').add('1', 'days').hours(3).minutes(59).seconds(59).milliseconds(0);
                    break;
                case 'month':
                    from = +moment().subtract(4, 'hours').startOf('month').hours(4);
                    to = +moment().subtract(4, 'hours').endOf('month').add('1', 'days').hours(3).minutes(59).seconds(59).milliseconds(0);
                    break;
                case 'last':
                    from = +moment().subtract(4, 'hours').subtract(1, 'months').startOf('month').hours(4);
                    to = +moment().subtract(4, 'hours').subtract(1, 'months').endOf('month').add('1', 'days').hours(3).minutes(59).seconds(59).milliseconds(0);
                    break;
            }
            this.reportRange = { from, to }
        },
        openCalendar() {
            new Promise((resolve, reject) => {
                this.componentData = { resolve, reject };
                this.component = "calendar";
            }).then((date) => {
                this.reportRange = date;
                this.$q();
            }).catch(() => {
                this.range = "today";
                this.getRange('today');
                this.$q();
            })
        },
        fetchData() {
            return new Promise((resolve) => {
                this.$socket.emit("[REPORT] GATHER_ORDER_DATA", this.reportRange);
                this.$options.sockets["REPORT_ORDER_RESULTS"] = (data) => { resolve(data) }
            })
        },
        fetchGiftCard() {
            return new Promise((resolve) => {
                if (this.giftCard) {
                    this.$socket.emit("[REPORT] GATHER_GIFTCARD_DATA", this.reportRange);
                    this.$options.sockets["REPORT_GIFTCARD_RESULTS"] = (data) => { resolve(data) }
                } else {
                    resolve([]);
                }
            })
        },
        fetchCreditCard() {
            return new Promise((resolve) => {
                if (this.creditCard) {
                    this.$socket.emit("[REPORT] GATHER_CREDITCARD_DATA", this.reportRange);
                    this.$options.sockets["REPORT_CREDITCARD_RESULTS"] = (data) => { resolve(data) }
                } else {
                    resolve([]);
                }
            })
        },
        fetchEmpolyee() {
            return new Promise((resolve) => {
                if (this.waitStaff) {
                    this.$socket.emit("[REPORT] GATER_EMPLOYEE_DATA", this.reportRange);
                    this.$options.sockets["REPORT_WAITSTAFF_RESULTS"] = (data) => { resolve(data) }
                } else {
                    resolve([]);
                }
            })
        },
        handler(datas) {
            this.summarize(datas[0]);
            this.report["CREDIT CARD"] = this.creditCardReport(datas[1]);
            this.report["GIFT CARD"] = this.giftCard ? this.giftCardReport(datas[2]) : null;
            this.report["EMPLOYEE"] = this.waitStaff ? this.employeeReport(datas[0]) : null;
            this.report["DRIVER"] = this.driver ? this.driverReport(datas[0]) : null;
            this.report["HOURLY REPORT"] = this.hourly ? this.hourlyReport(datas[0]) : null;
            this.report["ITEM SALES"] = this.countItem ? this.itemCounter(datas[0]) : null;
            this.report["CATEGORY SALES"] = this.countCategory ? this.categoryCounter(datas[0]) : null;
            this.report["SOURCE REPORT"] = this.thirdParty ? this.sourceReport(datas[0]) : null;
            this.report["SETTLE TYPE"] = this.settleType ? this.settleTypeReport(datas[0]) : null;
        },
        employeeReport(data) {
            let staff = {};
            data.forEach(invoice => {
                if (invoice.server) {
                    let name = invoice.server;
                    if (staff.hasOwnProperty(name)) {
                        staff[name]["amount"] += parseFloat(invoice.payment.due);
                        staff[name]["tip"] += parseFloat(invoice.payment.tip);
                        staff[name]["gratuity"] += parseFloat(invoice.payment.gratuity);
                        staff[name]["count"]++;
                    } else {
                        staff[name] = {
                            text: name,
                            tip: parseFloat(invoice.payment.tip),
                            gratuity: parseFloat(invoice.payment.gratuity),
                            amount: parseFloat(invoice.payment.due),
                            count: 1
                        }
                    }
                }
            });
            Object.keys(staff).forEach(name => {
                let server = staff[name];
                server.amount = [{ Total: server.amount.toFixed(2) }, { Tip: server.tip.toFixed(2) }, { Gratuity: server.tip.toFixed(2) }];
            })
            return staff;
        },
        sourceReport(data) {
            let source = {};
            data.forEach(invoice => {
                let name = invoice.source;
                if (source.hasOwnProperty(name)) {
                    source[name]["amount"] += parseFloat(invoice.payment.due);
                    source[name]["tip"] += parseFloat(invoice.payment.tip);
                    source[name]["count"]++;
                } else {
                    source[name] = {
                        text: name,
                        tip: parseFloat(invoice.payment.tip),
                        amount: parseFloat(invoice.payment.due),
                        count: 1
                    }
                }

            })
            return source;
        },
        settleTypeReport(data) {
            let settle = {};
            let total = 0;
            data.forEach(invoice => {
                let payment = invoice.payment;
                let type = payment.type;

                if (!payment.settled) return;
                total += parseFloat(payment.due);

                if (settle.hasOwnProperty(type)) {
                    settle[type]["amount"] += parseFloat(payment.due);
                    settle[type]["count"]++;
                } else {
                    settle[type] = {
                        text: type,
                        tip: parseFloat(invoice.payment.tip),
                        amount: parseFloat(invoice.payment.due),
                        count: 1
                    }
                }
            });

            Object.keys(settle).forEach(type => {
                let amount = settle[type]['amount'];
                let pct = (amount / total * 100).toFixed(2);
                settle[type]['amount'] = [{ Total: settle[type]['amount'].toFixed(2) }, { Percentage: pct + ' %' }]
            })

            return settle;
        },
        driverReport(data) {
            let drivers = {};
            data.forEach(invoice => {
                if (invoice.driver && invoice.status === 1) {
                    let name = invoice.driver;
                    if (drivers.hasOwnProperty(name)) {
                        drivers[name]["amount"] += parseFloat(invoice.payment.due);
                        drivers[name]["tip"] += parseFloat(invoice.payment.tip);
                        drivers[name]["fee"] += parseFloat(invoice.payment.delivery);
                        drivers[name]["count"]++;
                    } else {
                        drivers[name] = {
                            text: "#" + name,
                            tip: parseFloat(invoice.payment.tip),
                            amount: parseFloat(invoice.payment.due),
                            count: 1,
                            fee: parseFloat(invoice.payment.delivery)
                        }
                    }
                }
            });
            Object.keys(drivers).forEach(name => {
                let driver = drivers[name];
                driver.amount = [{ Total: driver.amount.toFixed(2) }, { Tip: driver.tip.toFixed(2) }, { Fee: driver.fee.toFixed(2) }];
            })
            return drivers;
        },
        creditCardReport() {

        },
        giftCardReport(data) {
            if (!data) data = [];
            let activation = 0, bouns = 0, initialAmount = 0, creditAmount = 0, debetAmount = 0, debet = 0, credit = 0;
            let datas = [].concat.apply([], data.map(gc => gc.activity))
                .filter(trans => (trans.time > this.reportRange.from && trans.time < this.reportRange.to))
                .forEach(trans => {
                    switch (trans.type) {
                        case "ACTIVATION":
                            activation++;
                            initialAmount += parseFloat(trans.amount);
                            creditAmount += parseFloat(trans.amount);
                            bouns += parseFloat(trans.bouns);
                            break;
                        case "RELOAD":
                            creditAmount += parseFloat(trans.amount);
                            break;
                        case "DEBET":
                        case "CASHOUT":
                            debet++;
                            debetAmount += parseFloat(trans.amount);
                            break;
                    }
                });
            return [{
                text: this.$t("card.activation"),
                count: activation,
                amount: `$ ${initialAmount.toFixed(2)}` + this.$t('card.bonus', bouns.toFixed(2))
            }, {
                text: this.$t('card.giftCardCredit'),
                count: credit,
                amount: creditAmount
            }, {
                text: this.$t("card.giftCardDebit"),
                count: debet,
                amount: debetAmount
            }];
        },
        summarize(data) {
            let gross = 0, grossAmount = 0, netAmount = 0, itemSalesAmount = 0, taxAmount = 0,
                walkin = 0, walkinAmount = 0,
                pickup = 0, pickupAmount = 0,
                delivery = 0, deliveryAmount = 0, deliveryTip = 0,
                dinein = 0, dineinAmount = 0,
                bar = 0, barAmount = 0,
                other = 0, otherAmount = 0,
                settle = 0, settleAmount = 0,
                discount = 0, discountAmount = 0,
                unsettle = 0, unsettleAmount = 0,
                voided = 0, voidedAmount = 0,
                cash = 0, cashAmount = 0,
                credit = 0, creditAmount = 0,
                creditTip = 0, creditTipAmount = 0,
                gift = 0, giftAmount = 0;

            data.forEach(ticket => {
                let total = parseFloat(ticket.payment.total);
                let subtotal = parseFloat(ticket.payment.subtotal);
                let due = parseFloat(ticket.payment.due);
                let tax = parseFloat(ticket.payment.tax);
                let tip = parseFloat(ticket.payment.tip);
                let gratuity = parseFloat(ticket.payment.gratuity);
                let disc = parseFloat(ticket.payment.discount);


                if (ticket.status === 1) {
                    switch (ticket.type) {
                        case "WALK_IN":
                            walkin++;
                            walkinAmount += due;
                            break;
                        case "PICK_UP":
                            pickup++;
                            pickupAmount += due;
                            break;
                        case "DELIVERY":
                            delivery++;
                            deliveryAmount += due;
                            deliveryTip += tip;
                            break;
                        case "DINE_IN":
                            dinein++;
                            dineinAmount += due;
                            break;
                        case "BAR":
                            bar++;
                            barAmount += due;
                            break;
                        default:
                            other++;
                            otherAmount += due;
                    }
                    gross++;
                    grossAmount += total;
                    netAmount += due;
                    itemSalesAmount += subtotal;
                    taxAmount += tax;

                    if (ticket.payment.discount > 0) {
                        discount++;
                        discountAmount += disc
                    }
                    if (ticket.settled) {
                        settle++;
                        settleAmount += due;
                        switch (ticket.payment.type) {
                            case "CASH":
                                cash++;
                                cashAmount += due;
                                break;
                            case "CREDIT":
                                credit++;
                                creditAmount += due;
                                if (tip > 0) {
                                    creditTip++;
                                    creditTipAmount += tip
                                }
                                break;
                            case "GIFT":
                                gift++;
                                giftAmount += due;
                                break;
                            default:
                                if (ticket.splitPayment) {
                                    ticket.splitPayment.forEach(split => {
                                        switch (split.type) {
                                            case "CASH":
                                                cash++;
                                                cashAmount += parseFloat(split.due);
                                                break;
                                            case "CREDIT":
                                                credit++;
                                                creditAmount += parseFloat(split.due);
                                                if (tip > 0) {
                                                    creditTip++;
                                                    creditTipAmount += parseFloat(split.tip)
                                                }
                                                break;
                                            case "GIFT":
                                                gift++;
                                                giftAmount += parseFloat(split.due);
                                                break;
                                        }
                                    })
                                }
                        }

                    } else if (!ticket.payment.settled) {
                        unsettle++;
                        unsettleAmount += due;
                    }
                } else {
                    voided++;
                    voidedAmount += parseFloat(ticket.payment.total);
                }
            })
            this.report["SUMMARY"] = this.summary ? [{
                text: this.$t('report.grossSales'),
                count: gross,
                amount: grossAmount
            },
            {
                text: this.$t('report.netSales'),
                count: 0,
                amount: netAmount
            },
            {
                text: "&nbsp;",
                count: 0,
                amount: ""
            },
            {
                text: this.$t('report.itemSales'),
                count: 0,
                amount: itemSalesAmount
            },
            {
                text: this.$t('report.tax'),
                count: 0,
                amount: taxAmount
            },
            {
                text: this.$t('report.discount'),
                count: discount,
                amount: -discountAmount
            }] : null;

            this.report["SALES CATEGORY"] = this.salesCategory ?
                [{
                    text: this.$t('report.cash'),
                    count: cash,
                    amount: cashAmount
                },
                {
                    text: this.$t('report.creditCard'),
                    count: credit,
                    amount: creditAmount
                },
                {
                    text: this.$t('report.creditCardTip'),
                    count: creditTip,
                    amount: creditTipAmount
                },
                {
                    text: this.$t('report.giftCard'),
                    count: gift,
                    amount: giftAmount
                },
                {
                    text: "&nbsp;",
                    count: 0,
                    amount: ""
                },
                {
                    text: this.$t('type.WALK_IN'),
                    count: walkin,
                    amount: walkinAmount
                }, {
                    text: this.$t('type.PICK_UP'),
                    count: pickup,
                    amount: pickupAmount
                }, {
                    text: this.$t('type.DELIVERY'),
                    count: delivery,
                    amount: deliveryAmount
                }, {
                    text: this.$t('type.DINE_IN'),
                    count: dinein,
                    amount: dineinAmount
                },
                {
                    text: this.$t('type.other'),
                    count: 0,
                    amount: otherAmount
                },
                {
                    text: "&nbsp;",
                    count: 0,
                    amount: ""
                }, {
                    text: this.$t("type.settled"),
                    count: settle,
                    amount: settleAmount
                }, {
                    text: this.$t("type.unsettled"),
                    count: unsettle,
                    amount: unsettleAmount
                }, {
                    text: this.$t('type.voided'),
                    count: voided,
                    amount: voidedAmount
                }] : null;
        },
        hourlyReport(data) {
            let hours = {};
            data.forEach(ticket => {
                let hour = new Date(ticket.time).getHours();
                let pay = ticket.payment;
                if (!hours.hasOwnProperty(hour)) {
                    hours[hour] = {
                        text: `${hour}:00`,
                        count: 1,
                        amount: parseFloat(pay.due) || parseFloat(pay.total)
                    }
                } else {
                    hours[hour].count++;
                    hours[hour].amount += (parseFloat(pay.due) || parseFloat(pay.total));
                }
            })
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
                            amount: item.single * item.qty
                        }
                    } else {
                        counter[item.usEN].count++;
                        counter[item.usEN].amount += item.single * item.qty;
                    }
                })
            })
            return Object.values(counter).filter(item => item.amount > 0).sort((a, b) => a.count > b.count ? -1 : 1)
        },
        categoryCounter(data) {
            let counter = {};
            data.forEach(ticket => {
                ticket.content.forEach(item => {
                    if (!counter.hasOwnProperty(item.category)) {
                        counter[item.category] = {
                            text: this.language === 'zhCN' ? (item.categoryCN || item.category) : item.category,
                            count: 1,
                            amount: item.single * item.qty
                        }
                    } else {
                        counter[item.category].count++;
                        counter[item.category].amount += item.single * item.qty;
                    }
                })
            })
            return Object.values(counter).filter(item => item.amount > 0).sort((a, b) => a.count > b.count ? -1 : 1)
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
    },
    computed: {
        ...mapGetters(['config', 'language'])
    }
}
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

.rangeWrap>div {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    border-right: 1px solid #ddd;
}

.rangeWrap>div:last-child {
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

.detailWrap>div {
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
    color: #37474F;
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

.rangeWrap input:checked+label {
    background: #2196F3;
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