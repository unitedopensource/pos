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
            Promise.all([this.fetchData, this.fetchGiftCard, this.fetchCreditCard]).then(datas => {
                console.log(datas)
            })

            //this.init.resolve();
        },
        getRange(type) {
            let from, to;
            switch (type) {
                case 'today':
                    from = +moment().hours(4).minutes(0).seconds(0).milliseconds(0);
                    to = +moment().hours(3).minutes(59).seconds(59).milliseconds(0).add('1', 'days');
                    break;
                case 'week':
                    from = +moment().startOf('week').hours(4);
                    to = +moment().endOf('week').add('1', 'days').hours(3).minutes(59).seconds(59).milliseconds(0);
                    break;
                case 'month':
                    from = +moment().startOf('month').hours(4);
                    to = +moment().endOf('month').add('1', 'days').hours(3).minutes(59).seconds(59).milliseconds(0);
                    break;
                case 'last':
                    from = +moment().subtract(1, 'months').startOf('month').hours(4);
                    to = +moment().subtract(1, 'months').endOf('month').add('1', 'days').hours(3).minutes(59).seconds(59).milliseconds(0);
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
                }else{
                    resolve();
                }
            })
        },
        fetchCreditCard() {
            return new Promise((resolve) => {
                if (this.creditCard) {
                    this.$socket.emit("[REPORT] GATHER_CREDITCARD_DATA", this.reportRange);
                    this.$options.sockets["REPORT_CREDITCARD_RESULTS"] = (data) => { resolve(data) }
                }else{
                    resolve();
                }
            })
        }
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