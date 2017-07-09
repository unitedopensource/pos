<template>
    <aside>
        <div class="btn" @click="isEditable">
            <i class="fa fa-pencil-square-o"></i>
            <span class="text">{{text('EDIT_ORDER')}}</span>
        </div>
        <div class="btn" @click="reOpenOrder" v-if="this.order && this.order.status !== 1">
            <i class="fa fa-ban"></i>
            <span class="text">{{text('RECOVER_ORDER')}}</span>
        </div>
        <div class="btn" @click="isVoidable" v-else>
            <i class="fa fa-ban"></i>
            <span class="text">{{text('DEL_ORDER')}}</span>
        </div>
        <div class="btn" @click="settle">
            <i class="fa fa-money"></i>
            <span class="text">{{text('PAYMENT')}}</span>
        </div>
        <div class="btn" @click="print">
            <i class="fa fa-print"></i>
            <span class="text">{{text('PRINT')}}</span>
        </div>
        <div class="btn" @click="calendar">
            <i class="fa fa-calendar"></i>
            <span class="text">{{text('BY_CALENDAR')}}</span>
        </div>
        <div class="btn" @click="search">
            <i class="fa fa-search"></i>
            <span class="text">{{text('SEARCH')}}</span>
        </div>
        <div class="btn" @click="terminal">
            <i class="fa fa-tablet"></i>
            <span class="text">{{text('TERMINAL')}}</span>
        </div>
        <div class="btn" @click="report">
            <i class="fa fa-file-text"></i>
            <span class="text">{{text('REPORT')}}</span>
        </div>
        <div class="btn">
            <i class="fa fa-bar-chart"></i>
            <span class="text">{{text('STATISTIC')}}</span>
        </div>
        <div class="btn" @click="exit">
            <i class="fa fa-times"></i>
            <span class="text">{{text("EXIT")}}</span>
        </div>
        <div :is="component" :init="componentData"></div>
    </aside>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import Terminal from './terminal'
import Dialoger from '../common/dialoger'
import Payment from '../payment/payment'
import Reason from './reason'
import Calendar from './calendar'
import Report from './report'
import Search from './search'
import Printer from '../../print'
export default {
    props: ['today', 'calendarDate'],
    data() {
        return {
            component: null,
            componentData: null
        }
    },
    methods: {
        isEditable() {
            if (this.isEmptyOrder) return;
            if (!this.approval(this.op.modify, "order")) {
                this.$denyAccess();
                return;
            };
            if (this.calendarDate || (this.calendarDate && this.calendarDate !== this.today)) {
                this.$dialog({
                    type: "alert",
                    title: 'UNVOIDABLE_PREVS_ORDER',
                    msg: 'UNVOIDABLE_PREVS_ORDER_TIP'
                }).then(() => {
                    this.$exitComponent();
                })
                return;
            };
            if (this.order.status === 0) {
                this.$dialog({
                    title: 'CANT_EDIT_VOIDED_ORDER',
                    msg: this.text('CANT_EDIT_VOIDED_ORDER_TIP', this.order.void.by)
                }).then(() => {
                    this.$exitComponent();
                })
                return;
            };
            if (this.order.settled) {
                this.confirmPaymentRemoval();
                return;
            };
            this.editOrder();
        },
        isVoidable() {
            if (this.isEmptyOrder) return;
            if (!this.approval(this.op.modify, "order")) {
                this.$denyAccess();
                return;
            };
            if (this.order.settled) {
                this.confirmPaymentRemoval();
                return;
            };
            this.voidOrder();
        },
        isSettledOrder() {
            this.$dialog({
                title: "ORDER_SETTLED",
                msg: "TIP_ORDER_SETTLED",
                buttons: [{ text: 'CONFIRM', fn: 'resolve' }]
            }).then(() => {
                this.$exitComponent();
            })
        },
        editOrder() {
            this.setTicket({
                type: this.order.type,
                number: this.order.number
            });
            this.setApp({
                mode: 'edit'
            });
            this.$router.push({ path: '/main/menu' });
        },
        voidOrder() {
            this.$dialog({
                type: "warning",
                title: this.text('VOID_ORDER_CONFIRM', this.order.number, this.text(this.order.type)),
                msg: 'VOID_ORDER_CONFIRM_TIP',
                buttons: [{
                    text: 'CANCEL',
                    fn: 'reject'
                }, {
                    text: 'DEL_ORDER',
                    fn: 'resolve'
                }]
            }).then(confirm => {
                this.$exitComponent();
                new Promise(resolve => {
                    this.componentData = { resolve };
                    this.component = "Reason";
                }).then(note => {
                    let order = Object.assign({}, this.order);
                    order.status = 0;
                    order.void = {
                        by: this.op.name,
                        time: "" + new Date(),
                        note
                    };
                    this.$socket.emit("ORDER_MODIFIED", order);
                    this.$exitComponent();
                })
            }).catch(() => {
                this.$exitComponent();
            })
        },
        confirmPaymentRemoval() {
            this.$dialog({
                title: this.text('REOPEN_SETTLED_ORD', this.order.number),
                msg: this.text('REOPEN_SETTLED_ORD_TIP', this.text(this.order.payment.type)),
                buttons: [{
                    text: 'REMOVE_PAYMENT',
                    fn: 'resolve'
                }, {
                    text: 'CANCEL',
                    fn: 'reject'
                }]
            }).then(() => {
                this.$exitComponent();
                this.removeOrderPayment();
            }).catch(() => {
                this.$exitComponent();
            })
        },
        removeOrderPayment() {
            this.$dialog({
                type: "warning",
                title: 'PAYMENT_REMOVE',
                msg: this.text('PAYMENT_REMOVE_CONFIRM', this.text(this.order.payment.type)),
                buttons: [{
                    text: 'CANCEL',
                    fn: 'reject'
                }, {
                    text: 'CONFIRM',
                    fn: 'resolve',
                    prevent: true
                }]
            }).then(() => {
                this.removePayment();
                this.$socket.emit("ORDER_MODIFIED", this.order)
                this.$exitComponent();
                this.$dialog({
                    title: "PAYMENT_REMOVED",
                    msg: this.text("ORDER_PAYMENT_REMOVED", this.order.number),
                    buttons: [{ text: 'CONFIRM', fn: 'resolve' }]
                }).then(() => {
                    this.editOrder();
                });
            }).catch(() => {
                this.$exitComponent();
            })
        },
        reOpenOrder() {
            if (this.isEmptyOrder) return;
            this.$dialog({
                type: "question",
                title: this.text('RECOVER_ORDER_CONFIRM', this.order.number),
                msg: this.text('RECOVER_ORDER_CONFIRM_TIP', this.order.void.by, this.text(this.order.void.note))
            }).then(() => {
                let order = JSON.parse(JSON.stringify(this.order));
                order.status = 1;
                delete order.void;
                this.$socket.emit("ORDER_MODIFIED", order);
                this.$exitComponent();
            }).catch(() => {
                this.$exitComponent();
            })
        },
        calendar() {
            new Promise((resolve, reject) => {
                this.componentData = { resolve, reject };
                this.component = "Calendar";
            }).then(date => {
                this.$emit("update", date);
                this.$socket.emit('INQUIRY_HISTORY_ORDER_LIST', date);
                this.$exitComponent();
            }).catch(() => {
                this.$exitComponent();
            })
        },
        settle() {
            if (this.isEmptyOrder) return;
            if (this.order.settled) {
                this.isSettledOrder();
                return;
            }
            let payment = this.order.payment;
            payment.due = payment.hasOwnProperty('due') ?
                payment.due :
                payment.total + payment.tip + payment.gratuity - payment.discount;
            new Promise((resolve, reject) => {
                this.componentData = {
                    payment, resolve, reject
                };
                this.component = "Payment";
            }).then(result => {
                let _order = JSON.parse(JSON.stringify(this.order));
                _order.payment = result.payment;
                _order.settled = true;
                this.$socket.emit("ORDER_MODIFIED", _order);
                _order.type = "PAYMENT";
                Printer.init(this.config).setJob("receipt").print(_order);
                this.$exitComponent();
            }).catch(() => {
                if (!this.order.settled) {
                    delete this.order.payment.due;
                    this.order.payment.log = [];
                }
                this.$exitComponent();
            });
        },
        print() {
            let order = Object.assign({}, this.order);
            Printer.init(this.config).setJob("receipt").print(order);
            order.content = order.content.map(item => {
                item.print = true;
                item.pending = false;
                return item;
            });
            this.$socket.emit("ORDER_MODIFIED", order)
        },
        terminal() {
            if (this.station.terminal.enable) {
                new Promise(resolve => {
                    this.componentData = { resolve };
                    this.component = "Terminal";
                }).then(() => {
                    this.$exitComponent();
                });
            } else {
                this.$dialog({ title: 'UNABLE_ACCESS', msg: 'STA_TERM_NA' }).then(() => { this.$exitComponent() })
            }
        },
        report() {
            if (!this.approval(this.op.access, "report")) {
                this.$denyAccess();
                return;
            }
            new Promise((resolve, reject) => {
                this.componentData = { resolve, reject };
                this.component = "Report";
            }).then(resolve => {
                this.$exitComponent();
            }).catch(() => {
                this.$exitComponent();
            })
        },
        search() { },
        exit() {
            this.resetMenu();
            this.$router.push({ path: "/main" });
        },
        ...mapActions(['setApp', 'setTicket', 'resetMenu', 'removePayment'])
    },
    computed: {
        ...mapGetters(['op', 'order', 'config', 'station', 'isEmptyOrder'])
    },
    components: {
        Calendar, Dialoger, Terminal, Payment, Reason, Report
    }
}
</script>

<style scoped>
aside {
    display: flex;
    flex-direction: column;
    padding: 4px;
}
</style>