<template>
    <aside>
        <div class="btn" @click="isEditable">
            <i class="fa fa-pencil-square-o"></i>
            <span class="text">{{$t('button.edit')}}</span>
        </div>
        <div class="btn" @click="reOpenOrder" v-if="this.order && this.order.status !== 1">
            <i class="fa fa-ban"></i>
            <span class="text">{{$t('button.recover')}}</span>
        </div>
        <div class="btn" @click="isVoidable" v-else>
            <i class="fa fa-ban"></i>
            <span class="text">{{$t('button.delete')}}</span>
        </div>
        <div class="btn" @click="isSettled">
            <i class="fa fa-money"></i>
            <span class="text">{{$t('button.payment')}}</span>
        </div>
        <div class="btn" @click="print">
            <i class="fa fa-print"></i>
            <span class="text">{{$t('button.print')}}</span>
        </div>
        <div class="btn" @click="calendar">
            <i class="fa fa-calendar"></i>
            <span class="text">{{$t('button.calendar')}}</span>
        </div>
        <div class="btn" @click="search">
            <i class="fa fa-search"></i>
            <span class="text">{{$t('button.search')}}</span>
        </div>
        <div class="btn" @click="terminal">
            <i class="fa fa-tablet"></i>
            <span class="text">{{$t('button.terminal')}}</span>
        </div>
        <div class="btn" @click="report">
            <i class="fa fa-file-text"></i>
            <span class="text">{{$t('button.report')}}</span>
        </div>
        <div class="btn" @click="stats">
            <i class="fa fa-bar-chart"></i>
            <span class="text">{{$t('button.stats')}}</span>
        </div>
        <div class="btn" @click="exit">
            <i class="fa fa-times"></i>
            <span class="text">{{$t('button.exit')}}</span>
        </div>
        <div :is="component" :init="componentData"></div>
    </aside>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import Dialoger from '../common/dialoger'
import Payment from '../payment/payment'
import Report from '../report/report'
import Calendar from './calendar'
import Printer from '../../print'
import Terminal from './terminal'
import Reason from './reason'
import Search from './search'
export default {
    props: ['date'],
    components: { Calendar, Dialoger, Terminal, Payment, Reason, Report },
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
                this.$dialog({
                    title: 'dialog.unableEdit', msg: 'dialog.editPrevOrderTip',
                    buttons: [{ text: 'button.confirm', fn: 'resolve' }]
                }).then(() => { this.$q() })
                return;
            };
            if (this.order.status === 0) {
                this.$dialog({
                    title: 'dialog.unableEdit', msg: ['dialog.editVoidOrderTip', this.order.void.by],
                    buttons: [{ text: 'button.confirm', fn: 'resolve' }]
                }).then(() => { this.$q() })
                return;
            };
            if (this.order.settled) {
                this.confirmPaymentRemoval();
                return;
            };
            this.editOrder();
        },
        isVoidable() {
            !this.isEmptyTicket && this.approval(this.op.modify, "order") ?
                this.order.settled ? this.confirmPaymentRemoval() : this.voidOrder() : this.$denyAccess();
        },
        handleSettledInvoice() {
            this.$dialog({
                title: "dialog.orderSettled", msg: "dialog.orderSettledTip",
                buttons: [{ text: 'button.confirm', fn: 'resolve' }]
            }).then(() => { this.$q() })
        },
        editOrder() {
            this.setTicket({ type: this.order.type, number: this.order.number });
            this.setApp({ mode: 'edit' });
            this.setCustomer(this.order.customer);
            this.$router.push({ path: '/main/menu' });
        },
        voidOrder() {
            this.$dialog({
                type: "warning",
                title: ['dialog.voidOrderConfirm', this.order.number, this.$t('type.' + this.order.type)],
                msg: 'dialog.voidOrderConfirmTip',
                buttons: [{ text: 'button.cancel', fn: 'reject' }, { text: 'button.delete', fn: 'resolve' }]
            }).then(confirm => { this.$p("Reason") }).catch(() => { this.$q() })
        },
        confirmPaymentRemoval() {
            this.$dialog({
                type: 'question',
                title: 'dialog.paymentRemove',
                msg: ['dialog.paymentRemoveTip', this.$t('type.' + this.order.payment.type)],
                buttons: [{ text: 'button.removePayment', fn: 'resolve' }, { text: 'button.cancel', fn: 'reject' }]
            }).then(() => {
                this.$q();
                this.$nextTick(() => { this.removeOrderPayment() })
            }).catch(() => { this.$q() })
        },
        removeOrderPayment() {
            this.$dialog({
                type: "warning", title: 'dialog.paymentRemoveConfirm',
                msg: ['dialog.paymentRemoveConfirmTip', this.$t('type.' + this.order.payment.type)]
            }).then(() => {
                this.removePayment();
                this.updateInvoice(this.order);
                this.$dialog({
                    title: "dialog.paymentRemoved", msg: ["dialog.paymentRemovedTip", this.order.number],
                    buttons: [{ text: 'button.done', fn: 'reject' }, { text: 'button.edit', fn: 'resolve' }]
                }).then(() => { this.editOrder() }).catch(() => { this.$q() });
            }).catch(() => { this.$q() })
        },
        reOpenOrder() {
            if (this.isEmptyTicket) return;
            this.$dialog({
                type: "question",
                title: ['dialog.recoverOrderConfirm', this.order.number],
                msg: ['dialog.recoverOrderConfirm', this.order.void.by, this.$t('reason.' + this.order.void.note)]
            }).then(() => {
                let order = JSON.parse(JSON.stringify(this.order));
                order.status = 1;
                delete order.void;
                this.updateInvoice(order);
                this.$q()
            }).catch(() => { this.$q() })
        },
        calendar() {
            new Promise((resolve, reject) => {
                this.componentData = { resolve, reject };
                this.component = "Calendar";
            }).then((date) => {
                this.$emit("change", date)
                this.$q()
            }).catch(() => { this.$q() })
        },
        isSettled() {
            if (this.isEmptyTicket) return;
            if (this.order.status === 0) {
                this.$dialog({
                    title: 'dialog.orderVoided',
                    msg: 'dialog.settleVoidedOrder',
                    buttons: [{ text: 'button.confirm', fn: 'resolve' }]
                }).then(() => { this.$q() })
                return;
            }
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
                this.$dialog({
                    title: 'dialog.accessDenied', msg: 'dialog.stationNoTerminal',
                    buttons: [{ text: 'button.confirm', fn: 'resolve' }]
                }).then(() => { this.$q() })
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
        ...mapActions(['setApp', 'setTicket', 'resetMenu', 'setCustomer', 'removePayment'])
    },
    computed: {
        ...mapGetters(['op', 'order', 'config', 'station', 'isEmptyTicket'])
    },

}
</script>

<style scoped>
aside {
    display: flex;
    flex-direction: column;
    padding: 4px;
}
</style>