<template>
    <div class="popupMask center dark">
        <div class="window" v-show="!component">
            <header class="title">
                <span>{{text('PRINT_REPORT')}}</span>
                <i class="fa fa-times" @click="init.reject"></i>
            </header>
            <div class="inner">
                <section class="option">
                    <div class="for">
                        <span>{{text('REPORT_RANGE')}}</span>
                        <span class="choice" v-if="reportRange">{{reportRange.from | moment('YYYY-MM-DD HH:mm')}} ~ {{reportRange.to | moment('YYYY-MM-DD HH:mm')}}</span>
                    </div>
                    <div class="rangeWrap">
                        <div>
                            <input type="radio" name="range" v-model="range" value="today" id="today" @click="getRange('today')">
                            <label for="today">{{text('TODAY')}}</label>
                        </div>
                        <div>
                            <input type="radio" name="range" v-model="range" value="week" id="week" @click="getRange('week')">
                            <label for="week">{{text('CURRENT_WEEK')}}</label>
                        </div>
                        <div>
                            <input type="radio" name="range" v-model="range" value="month" id="month" @click="getRange('month')">
                            <label for="month">{{text('CURRENT_MONTH')}}</label>
                        </div>
                        <div>
                            <input type="radio" name="range" v-model="range" value="last" id="last" @click="getRange('last')">
                            <label for="last">{{text('LAST_MONTH')}}</label>
                        </div>
                        <div>
                            <input type="radio" name="range" v-model="range" value="custom" id="custom" @click="openCalendar">
                            <label for="custom">{{text('SET_DATE')}}</label>
                        </div>
                    </div>
                </section>
                <section class="option">
                    <div class="for">
                        <span>{{text('REPORT_DETAILS')}}</span>
                    </div>
                    <div class="detailWrap">
                        <div class="left">
                            <h5>{{text('STATISTICS')}}</h5>
                            <checkbox v-model="summary" label="SUMMARY"></checkbox>
                            <checkbox v-model="category" label="CATEGORY_REPORT"></checkbox>
                            <checkbox v-model="hourly" label="HOURLY_REPORT"></checkbox>
                            <checkbox v-model="tip" label="TIP_SUMMARY"></checkbox>
                            <checkbox v-model="giftCard" label="GIFTCARD_SUMMARY"></checkbox>
                            <checkbox v-model="countItem" label="REPORT_COUNT_ITEM"></checkbox>
                        </div>
                        <div class="right">
                            <h5>{{text('PERFORMANCE')}}</h5>
                            <checkbox v-model="waitStaff" label="STAFF_SUMMARY"></checkbox>
                            <checkbox v-model="driver" label="DRIVER_SUMMARY"></checkbox>
                        </div>
                    </div>
                </section>
            </div>
            <footer>
                <div class="f1">
                    <checkbox v-model="emailReport" label="SENT_RPT_VIA_EMAIL"></checkbox>
                </div>
                <div class="btn" @click="confirm">{{text('CONFIRM')}}</div>
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
export default {
    props: ['init'],
    components: { checkbox, calendar },
    created() {
        this.getRange(this.range)
    },
    data() {
        return {
            tip: false,
            range: 'today',
            hourly: false,
            driver: false,
            summary: true,
            category: false,
            giftCard: false,
            waitStaff: false,
            countItem: false,
            emailReport: false,
            reportRange: null,
            component: null,
            componentData: null,
            report: {}
        }
    },
    methods: {
        confirm() {
            Promise.all([this.fetchData(), this.fetchCreditCard(), this.fetchGiftCard()]).then(datas => {
                this.handler(datas);
                console.log(this.report)
                Printer.init(this.config).setJob("report").print({ date: this.reportRange, report: this.report });
                this.init.resolve();
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
                this.$exitComponent();
            }).catch(() => {
                this.range = "today";
                this.getRange('today');
                this.$exitComponent();
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
            this.report["EMPOLYEE"] = this.employee ? this.employeeReport() : null;
            this.report["HOURLY REPORT"] = this.hourly ? this.hourlyReport(datas[0]) : null;
            this.report["MOST ORDER"] = this.countItem ? this.itemCounter(datas[0]) : null;
        },
        employeeReport(data) {
            console.log(data);
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
                text: this.text("GIFT_CARD_ACTIVATION"),
                count: activation,
                amount: `$ ${initialAmount.toFixed(2)} (Bouns:$ ${bouns.toFixed(2)})`,
            }, {
                text: this.text("GIFT_CARD_CREDIT"),
                count: credit,
                amount: creditAmount
            }, {
                text: this.text("GIFT_CARD_DEBET"),
                count: debet,
                amount: debetAmount
            }];
        },
        summarize(data) {
            let total = 0, totalAmount = 0, grossAmount = 0,
                walkin = 0, walkinAmount = 0,
                pickup = 0, pickupAmount = 0,
                delivery = 0, deliveryAmount = 0,
                dinein = 0, dineinAmount = 0,
                bar = 0, barAmount = 0,
                other = 0, otherAmount = 0,
                settle = 0, settleAmount = 0,
                discount = 0, discountAmount = 0,
                unsettle = 0, unsettleAmount = 0,
                voided = 0, voidedAmount = 0,
                cash = 0, cashAmount = 0,
                credit = 0, creditAmount = 0,
                gift = 0, giftAmount = 0;

            data.forEach(ticket => {
                switch (ticket.type) {
                    case "WALK_IN":
                        walkin++;
                        walkinAmount += ticket.payment.due;
                        break;
                    case "PICK_UP":
                        pickup++;
                        pickupAmount += ticket.payment.due;
                        break;
                    case "DELIVERY":
                        delivery++;
                        deliveryAmount += ticket.payment.due;
                        break;
                    case "DINE_IN":
                        dinein++;
                        dineinAmount += ticket.payment.due;
                        break;
                    case "BAR":
                        bar++;
                        barAmount += ticket.payment.due;
                        break;
                    default:
                        other++;
                        otherAmount += ticket.payment.due;
                }
                if (ticket.status === 1) {
                    total++;
                    totalAmount += ticket.payment.total;
                    grossAmount += ticket.payment.due;
                    if (ticket.payment.discount > 0) {
                        discount++;
                        discountAmount += ticket.payment.discount
                    }
                } else {
                    voided++;
                    voidedAmount += ticket.payment.total;
                }
                if (ticket.settled) {
                    settle++;
                    settleAmount += ticket.payment.due;
                    switch (ticket.payment.type) {
                        case "CASH":
                            cash++;
                            cashAmount += ticket.payment.due;
                            break;
                        case "CREDIT":
                            credit++;
                            creditAmount += ticket.payment.due;
                            break;
                        case "GIFT":
                            gift++;
                            giftAmount += ticket.payment.due;
                            break;
                    }
                } else {
                    unsettle++;
                    unsettleAmount += ticket.payment.due;
                }
            })
            this.report["SUMMARY"] = this.summary ? [{
                text: this.text('TOTAL'),
                count: total,
                amount: totalAmount
            },
            {
                text: this.text('GROSS_SALES'),
                count: 0,
                amount: grossAmount
            },
            {
                text: this.text('DISCOUNT'),
                count: discount,
                amount: -discountAmount
            }] : null;

            this.report["DETAIL REPORT"] = this.category ?
                [{
                    text: this.text('CASH'),
                    count: cash,
                    amount: cashAmount
                },
                {
                    text: this.text('CREDIT_CARD'),
                    count: credit,
                    amount: creditAmount
                },
                {
                    text: this.text('GIFT_CARD'),
                    count: gift,
                    amount: giftAmount
                },
                {
                    text: "&nbsp;",
                    count: 0,
                    amount: ""
                },
                {
                    text: this.text('WALK_IN'),
                    count: walkin,
                    amount: walkinAmount
                }, {
                    text: this.text('PICK_UP'),
                    count: pickup,
                    amount: pickupAmount
                }, {
                    text: this.text('DELIVERY'),
                    count: delivery,
                    amount: deliveryAmount
                }, {
                    text: this.text('DINE_IN'),
                    count: dinein,
                    amount: dineinAmount
                },
                {
                    text: this.text('OTHERS'),
                    count: 0,
                    amount: otherAmount
                },
                {
                    text: "&nbsp;",
                    count: 0,
                    amount: ""
                }, {
                    text: this.text("SETTLED"),
                    count: settle,
                    amount: settleAmount
                }, {
                    text: this.text("UNSETTLE"),
                    count: unsettle,
                    amount: unsettleAmount
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
                        amount: pay.due || pay.total
                    }
                } else {
                    hours[hour].count++;
                    hours[hour].amount += (pay.due || pay.total);
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
            return Object.values(counter).filter(item => item.amount > 0).sort((a, b) => a.count > b.count ? -1 : 1).slice(0, 20)
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

.choice {
    color: #009688;
    background: #fff;
    border-radius: 4px;
    padding: 1px 10px 0;
    box-shadow: 0 1px 1px rgba(0, 0, 0, 0.3);
}
</style>