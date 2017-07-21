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
                        <span class="choice"></span>
                    </div>
                    <div class="rangeWrap">
                        <div>
                            <input type="radio" name="range" v-model="range" value="today" id="today">
                            <label for="today">{{text('TODAY')}}</label>
                        </div>
                        <div>
                            <input type="radio" name="range" v-model="range" value="week" id="week">
                            <label for="week">{{text('CURRENT_WEEK')}}</label>
                        </div>
                        <div>
                            <input type="radio" name="range" v-model="range" value="month" id="month">
                            <label for="month">{{text('CURRENT_MONTH')}}</label>
                        </div>
                        <div>
                            <input type="radio" name="range" v-model="range" value="last" id="last">
                            <label for="last">{{text('LAST_MONTH')}}</label>
                        </div>
                        <div>
                            <input type="radio" name="range" v-model="range" value="custom" id="custom" @click="openCalendar">
                            <label for="custom">{{text('CALENDAR')}}</label>
                        </div>
                    </div>
                </section>
                <section class="option">
                    <div class="for">
                        <span>{{text('REPORT_DETAILS')}}</span>
                        <span class="choice"></span>
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
            component: null,
            componentData: null
        }
    },
    methods: {
        confirm() {
            this.init.resolve();
        },
        openCalendar() {
            new Promise((resolve, reject) => {
                this.componentData = { resolve, reject };
                this.component = "calendar";
            }).then((resolve)=>{
                console.log(resolve);
                this.$exitComponent();
            }).catch(()=>{
                this.range = "today";
                this.$exitComponent();
            })
            
        },
        prepare(data) {

        }
    },
    sockets: {

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
</style>