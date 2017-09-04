<template>
    <div class="history">
        <header>
            <div class="logo" @click.ctrl="getConsole">
                <span>U</span>
            </div>
            <order-summary :data="prevsHistory.length ? prevsHistory : history" :date="calendarDate || today" @filter="setFilter"></order-summary>
        </header>
        <article>
            <grids :date="calendarDate || today" @change="setCalendar"></grids>
            <section class="tickets">
                <div class="inner">
                    <div v-for="(ticket,index) in invoices" class="invoice" @click="getInvoice(ticket)" :data-number="ticket.number" :key="index" :class="{void:ticket.status === 0,settled:ticket.settled}">
                        <span class="type">{{$t('type.'+ticket.type)}}
                            <span v-if="ticket.type === 'DINE_IN'" class="table">{{ticket.table}}</span>
                        </span>
                        <span class="address">{{ticket.customer.address}}</span>
                        <span class="phone">{{ticket.customer.phone | dot}}</span>
                        <span class="total">$ {{ticket.payment.due.toFixed(2)}}</span>
                    </div>
                </div>
                <pagination :of="orders" @page="setPage" :contain="30" :max="12"></pagination>
            </section>
            <section class="ticket">
                <order-list layout="display" :display="true"></order-list>
            </section>
        </article>
        <div :is="component" :init="componentData"></div>
    </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import pagination from './common/pagination'
import orderSummary from './history/summary'
import Maintenance from './dock/maintenance'
import orderList from './common/orderList'
import dialoger from './common/dialoger'
import grids from './history/function'

export default {
    components: { grids, orderList, orderSummary, Maintenance, dialoger, pagination },
    data() {
        return {
            today: today(),
            component: null,
            componentData: null,
            calendarDate: null,
            prevsHistory: [],
            summary: {},
            page: 0,
            view: "",
            filter: "",
            driver: null
        }
    },
    created() {
        this.checkSync()
    },
    mounted() {
        if (this.orders.length) {
            this.setViewOrder(this.orders[0]);
            let dom = document.querySelector(".invoice");
            dom && dom.classList.add("active");
        }
    },
    methods: {
        checkSync() {
            this.$socket.emit("[SYNC] POS", time => {
                time !== this.sync && console.log("SYNC REQUIRED");
                time !== this.sync && this.$socket.emit("[SYNC] ORDER_LIST")
            })
        },
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
        },
        setPage(number) {
            this.page = number
        },
        setSummary(data) {
            this.summary = data;
        },
        setCalendar(date) {
            this.calendarDate = date;
            this.$socket.emit('[INQUIRY] HISTORY_ORDER', date);
        },
        getConsole() {
            this.$p("Maintenance");
        },
        ...mapActions(['setViewOrder'])
    },
    computed: {
        orders() {
            let operator = this.op.name;
            let approval = this.approval(this.op.view, "invoices");
            switch (this.filter) {
                case "WALK_IN":
                case "PICK_UP":
                case "DELIVERY":
                case "DINE_IN":
                case "BAR":
                    return this.prevsHistory.length ?
                        this.prevsHistory.filter(invoice => invoice.type === this.filter && view(invoice.server)) :
                        this.history.filter(invoice => invoice.type === this.filter && view(invoice.server));
                case "UNSETTLE":
                    return this.prevsHistory.length ?
                        this.prevsHistory.filter(invoice => !invoice.settled && view(invoice.server)) :
                        this.history.filter(invoice => !invoice.settled && view(invoice.server));
                case "DRIVER":
                    return this.prevsHistory.length ?
                        this.prevsHistory.filter(invoice => (this.driver ? invoice.driver === this.driver : invoice.type === 'DELIVERY') && view(invoice.server)) :
                        this.history.filter(invoice => (this.driver ? invoice.driver === this.driver : invoice.type === 'DELIVERY') && view(invoice.server));
                default:
                    return this.prevsHistory.length ?
                        this.prevsHistory.filter((invoice) => view(invoice.server)) :
                        this.history.filter((invoice) => view(invoice.server));
            }

            function view(server) {
                if (!server) return true;
                if (approval) return true;
                return server === operator
            }
        },
        invoices() {
            let min = this.page * 30;
            let max = min + 30;
            return this.orders.slice(min, max)
        },
        // totalPage() {
        //     let length = this.prevsHistory.length || this.history.length;
        //     return Math.ceil(length / 30)
        // },
        ...mapGetters(['op', 'sync', 'ticket', 'order', 'history', 'store'])
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
        HISTORY_ORDER(data) {
            this.prevsHistory = data.orders;
            this.$q();
            data.orders.length === 0 && this.$dialog({
                title: 'dialog.noInvoice',
                msg: ['dialog.noInvoiceTip', this.calendarDate],
                buttons: [{ text: 'button.confirm', fn: 'resolve' }]
            }).then(() => {
                this.calendarDate = null;
                this.$q()
            })
        }
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
    display: flex;
}

.table {
    flex: 1;
    text-align: center;
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
</style>