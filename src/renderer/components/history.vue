<template>
    <div class="history">
        <header>
            <div class="logo" @click.ctrl="getConsole">
                <span>U</span>
            </div>
            <order-summary :data="prevsHistory.length ? prevsHistory : history" :date="calendarDate || today" @filter="setFilter"></order-summary>
        </header>
        <article>
            <function-grid :date="calendarDate || today" @update="setCalendar"></function-grid>
            <section class="tickets">
                <div class="inner">
                    <div v-for="(ticket,index) in orders" class="invoice" @click="getInvoice(ticket)" :data-number="ticket.number" :key="index" :class="{void:ticket.status === 0,settled:ticket.settled}">
                        <span class="type">{{text(ticket.type)}}</span>
                        <span class="address">{{ticket.customer.address}}</span>
                        <span class="phone">{{ticket.customer.phone | dot}}</span>
                        <span class="total">$ {{(ticket.payment.total - ticket.payment.discount) | decimal}}</span>
                    </div>
                </div>
                <div class="pagination" v-if="totalPage > 1">
                    <div class="page" @click="page = page > 0 ? page - 1 : 0">
                        <i class="fa fa-angle-left"></i>
                    </div>
                    <div class="page" v-for="i in totalPage" @click="page = (i-1)" :key="i" :class="{active:page === (i-1)}">{{i}}</div>
                    <div class="page" @click="page = page === (totalPage-1) ? page : page + 1">
                        <i class="fa fa-angle-right"></i>
                    </div>
                </div>
            </section>
            <section class="ticket">
                <order-list layout="display" :display="true"></order-list>
            </section>
        </article>
        <div :is="component" :init="componentData" @exit="exitComponent"></div>
    </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import moment from 'moment'
import orderList from './common/orderList'
import orderSummary from './history/summary'
import functionGrid from './history/function'
import Maintenance from './dock/maintenance'
export default {
    created() {
        this.$socket.emit("INQUIRY_UPDATE_TIME")
    },
    mounted() {
        if (this.orders.length) {
            this.setViewOrder(this.orders[0]);
            document.querySelector(".invoice").classList.add("active");
        }
    },
    data() {
        return {
            today: today(),
            calendarDate: null,
            component: null,
            componentData:null,
            prevsHistory: [],
            summary: {},
            page: 0,
            view: "",
            filter: "",
            driver: null
        }
    },
    methods: {
        getInvoice(invoice) {
            this.setViewOrder(invoice);
        },
        setFilter(type, id) {
            this.driver = null;
            switch (type) {
                case "WALK_IN":
                case "PICK_UP":
                case "DELIVERY":
                case "DINE_IN":
                case "BAR":
                    this.filter = type;
                    break;
                case "UNSETTLE":
                    this.filter = 'UNSETTLE';
                    break;
                case "DRIVER":
                    this.filter = 'DRIVER';
                    this.driver = id;
                    break;
                default:
                    this.filter = type;
            }
            this.page = 0;
        },
        setSummary(data) {
            this.summary = data;
        },
        setCalendar(date) {
            this.calendarDate = date;
        },
        getConsole(){
            console.log("trigger")
            this.$p("Maintenance");
        },
        exitComponent(){
            this.$q();
        },
        ...mapActions(['setViewOrder'])
    },
    computed: {
        orders() {
            let min = this.page * 30;
            let max = min + 30;

            switch (this.filter) {
                case "WALK_IN":
                case "PICK_UP":
                case "DELIVERY":
                case "DINE_IN":
                case "BAR":
                    return this.prevsHistory.length ?
                        this.prevsHistory.filter(invoice => invoice.type === this.filter).slice(min, max) :
                        this.history.filter(invoice => invoice.type === this.filter).slice(min, max);
                case "UNSETTLE":
                    return this.prevsHistory.length ?
                        this.prevsHistory.filter(invoice => !invoice.settled).slice(min, max) :
                        this.history.filter(invoice => !invoice.settled).slice(min, max);
                case "DRIVER":
                    return this.prevsHistory.length ?
                        this.prevsHistory.filter(invoice => this.driver ? invoice.driver === this.driver : invoice.type === 'DELIVERY').slice(min, max) :
                        this.history.filter(invoice => this.driver ? invoice.driver === this.driver : invoice.type === 'DELIVERY').slice(min, max);
                default:
                    return this.prevsHistory.length ?
                        this.prevsHistory.slice(min, max) :
                        this.history.slice(min, max);
            }
        },
        totalPage() {
            let length = this.prevsHistory.length || this.history.length;
            return Math.ceil(length / 30)
        },
        ...mapGetters(['op', 'order', 'history'])
    },
    filters: {
        dot(val) {
            return val ? val.replace(/^\D?(\d{3})\D?\D?(\d{3})\D?(\d{4})/, "$1.$2.$3") : val;
        }
    },
    watch: {
        orders(list) {
            let dom = document.querySelector(".invoice.active");
            dom && dom.classList.remove("active");
            list.length && this.getInvoice(list[0]);
            dom = document.querySelector(".invoice");
            dom && dom.classList.add("active");
        },
        order(ticket) {
            this.$nextTick(() => {
                let dom = document.querySelector(".invoice.active");
                dom && dom.classList.remove("active");
                let i = 0;

                let number = ticket.number;
                dom = document.querySelectorAll(".invoice");
                for (; i < dom.length; i++) {
                    if (dom[i].dataset.number == number) break;
                }
                dom[i].classList.add("active");
            })
        }
    },
    sockets: {
        PREVS_ORDER_HISTORY(prevs) {
            this.prevsHistory = prevs.orders.sort((a, b) => (Number(b.number) - Number(a.number)));;
            this.$q();
            if (prevs.orders.length === 0)
                this.$dialog({
                    title: this.calendarDate + " " + this.text('NO_PREVS_ORDER'),
                    msg: 'NO_PREVS_ORDER_TIP'
                }).then(confirm => {
                    this.calendarDate = null;
                    this.$q();
                })
        }
    },
    components: {
        orderList, orderSummary, functionGrid, Maintenance
    }
}
</script>

<style scoped>
.history {
    width: 100%;
    height: 100%;
    background: #F6F6F6;
    flex-direction: column;
}

header {
    margin-top: 30px;
    display: flex;
    height: 63px;
    background: #234c75;
    border-bottom: 1px solid #3F51B5;
}

article {
    flex: 1;
    display: flex;
    background: url(../assets/image/grid.png) #ebeff1;
}

.logo {
    margin: 7px 20px;
}

.summary {
    flex: 1;
    display: flex;
    align-items: center;
}

section.ticket {
    width: 285px;
    background: rgba(255, 255, 255, 0.5);
}

.tickets {
    display: flex;
    flex-direction: column;
    width: 641px;
    padding: 2px 0 0;
}

.inner {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    align-content: flex-start;
    flex: 1;
    max-height: 616px;
}

.invoice {
    height: 90px;
    width: 115px;
    margin: 6px;
    background: #fff;
    position: relative;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
    text-align: center;
}

.invoice.active {
    background: #03A9F4;
    color: #fff;
    text-shadow: 0 1px 1px rgba(0, 0, 0, 0.54);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.5);
}

.invoice.active:before {
    background: #607D8B;
}

.invoice.active .address {
    border-color: #90CAF9;
    color: #fff;
}

.invoice.void:before {
    background: red;
}

.invoice.settled:before {
    background: #4CAF50;
}

.invoice:before {
    position: absolute;
    top: -5px;
    left: -5px;
    content: attr(data-number);
    min-width: 37px;
    height: 30px;
    text-align: center;
    line-height: 30px;
    background: #03A9F4;
    color: #fff;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
    font-family: 'Agency FB';
    font-size: 30px;
}

.type {
    padding: 8px 0 0 35px;
    display: block;
    text-align: left;
}

.phone {
    display: block;
    height: 18px;
    margin-top: -2px;
}

.address {
    display: inline-block;
    overflow: hidden;
    height: 13px;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-family: Arial;
    font-size: 12px;
    color: #8a8a8a;
    margin-top: 5px;
    border-top: 1px dashed #eee;
    border-bottom: 1px dashed #eee;
    width: 115px;
}

.total {
    display: block;
    text-align: center;
}

.pagination {
    justify-content: center;
    margin: 0px 12px 0 6px;
    display: flex;
}

.pagination .page {
    margin: 5px 5px 10px;
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
</style>