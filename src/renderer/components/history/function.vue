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
        <div class="btn" @click="isSettled">
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
        <div class="btn" @click="stats">
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
import Report from '../report/report'
import Calendar from './calendar'
import Printer from '../../print'
import Reason from './reason'
import Search from './search'
export default {
    props: ['date'],
    data() {
        return {
            today: today(),
            component: null,
            componentData: null
        }
    },
    methods: {
        isEditable() {
            if (this.isEmptyTicket) return;
            if (!this.approval(this.op.modify, "order")) {
                this.$denyAccess();
                return;
            };
            if (this.date !== this.today) {
                this.$dialog({ title: 'UNAVOIDABLE_PREVS_ORDER', msg: 'UNAVOIDABLE_PREVS_ORDER_TIP', buttons: [{ text: 'CONFIRM', fn: 'resolve' }] }).then(() => { this.$q() })
                return;
            };
            if (this.order.status === 0) {
                this.$dialog({ title: 'CANT_EDIT_VOIDED_ORDER', msg: this.text('CANT_EDIT_VOIDED_ORDER_TIP', this.order.void.by), buttons: [{ text: 'CONFIRM', fn: 'resolve' }] }).then(() => { this.$q() })
                return;
            };
            if (this.order.settled) {
                this.confirmPaymentRemoval();
                return;
            };
            this.editOrder();
        },
        isVoidable() {
            !this.isEmptyTicket && this.approval(this.op.modify, "order") && !this.order.settled && this.voidOrder();
            !this.approval(this.op.modify, "order") ? this.$denyAccess() : this.order.settled && this.confirmPaymentRemoval();
        },
        handleSettledInvoice() {
            this.$dialog({ title: "ORDER_SETTLED", msg: "TIP_ORDER_SETTLED", buttons: [{ text: 'CONFIRM', fn: 'resolve' }] }).then(() => { this.$q() })
        },
        editOrder() {
            this.setTicket({ type: this.order.type, number: this.order.number });
            this.setApp({ mode: 'edit' });
            this.$router.push({ path: '/main/menu' });
        },
        voidOrder() {
            this.$dialog({
                type: "warning",
                title: this.text('VOID_ORDER_CONFIRM', this.order.number, this.text(this.order.type)),
                msg: 'VOID_ORDER_CONFIRM_TIP',
                buttons: [{ text: 'CANCEL', fn: 'reject' }, { text: 'DEL_ORDER', fn: 'resolve' }]
            }).then(confirm => { this.$p("Reason") }).catch(() => { this.$q() })
        },
        confirmPaymentRemoval() {
            this.$dialog({
                title: this.text('REOPEN_SETTLED_ORD', this.order.number),
                msg: this.text('REOPEN_SETTLED_ORD_TIP', this.text(this.order.payment.type)),
                buttons: [{ text: 'REMOVE_PAYMENT', fn: 'resolve' }, { text: 'CANCEL', fn: 'reject' }]
            }).then(() => { this.removeOrderPayment() }).catch(() => { this.$q() })
        },
        removeOrderPayment() {
            this.$dialog({
                type: "warning", title: 'PAYMENT_REMOVE', msg: this.text('PAYMENT_REMOVE_CONFIRM', this.text(this.order.payment.type))
            }).then(() => {
                this.removePayment();
                this.updateInvoice(this.order);
                this.$dialog({ title: "PAYMENT_REMOVED", msg: this.text("ORDER_PAYMENT_REMOVED", this.order.number), buttons: [{ text: 'CONFIRM', fn: 'reject' }, { text: 'EDIT_ORDER', fn: 'resolve' }] })
                    .then(() => { this.editOrder() }).catch(() => { this.$q() });
            }).catch(() => { this.$q() })
        },
        reOpenOrder() {
            if (this.isEmptyTicket) return;
            this.$dialog({
                type: "question",
                title: this.text('RECOVER_ORDER_CONFIRM', this.order.number),
                msg: this.text('RECOVER_ORDER_CONFIRM_TIP', this.order.void.by, this.text(this.order.void.note))
            }).then(() => {
                let order = JSON.parse(JSON.stringify(this.order));
                order.status = 1;
                delete order.void;
                this.updateInvoice(order);
                this.$q();
            }).catch(() => { this.$q() })
        },
        calendar() {
            new Promise((resolve, reject) => {
                this.componentData = { resolve, reject };
                this.component = "Calendar";
            }).then((date) => {
                console.log(date);
                this.$emit("change", date)
                this.$q();
            }).catch(() => { this.$q() })
        },
        isSettled() {
            if (this.isEmptyTicket) return;
            this.order.settled ? this.handleSettledInvoice() : this.$p("Payment");
        },
        print() {
            let order = Object.assign({}, this.order);
            Printer.init(this.config).setJob("receipt").print(order);
            order.content = order.content.map(item => {
                item.print = true;
                item.pending = false;
                return item;
            });
            this.updateInvoice(order);
        },
        terminal() {
            this.station.terminal.enable ?
                this.$p("Terminal") :
                this.$dialog({ title: 'UNABLE_ACCESS', msg: 'STA_TERM_NA', buttons: [{ text: 'CONFIRM', fn: 'resolve' }] }).then(() => { this.$q() });
        },
        report() {
            this.approval(this.op.access, "report") ? this.$p("Report") : this.$denyAccess();
        },
        search() { },
        updateInvoice(ticket) {
            this.$socket.emit("[UPDATE] INVOICE", ticket);
        },
        stats() {
        },
        exit() {
            this.resetMenu();
            this.$router.push({ path: "/main" });
        },
        ...mapActions(['setApp', 'setTicket', 'resetMenu', 'removePayment'])
    },
    computed: {
        ...mapGetters(['op', 'order', 'config', 'station', 'isEmptyTicket'])
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