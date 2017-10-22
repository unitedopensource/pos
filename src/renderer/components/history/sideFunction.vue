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
            <span class="text">{{$t('button.void')}}</span>
        </div>
        <button class="btn" @click="isSettled" :disabled="order.settled">
            <i class="fa fa-money"></i>
            <span class="text">{{$t('button.payment')}}</span>
        </button>
        <div class="btn" @click="receipt">
            <i class="fa fa-print"></i>
            <span class="text">{{$t('button.receipt')}}</span>
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
        <button class="btn" @click="stats" :disabled="!op.access.includes('report')">
            <i class="fa fa-bar-chart"></i>
            <span class="text">{{$t('button.stats')}}</span>
        </button>
        <div :is="component" :init="componentData"></div>
    </aside>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import paymentMark from '../payment/mark'
import Dialoger from '../common/dialoger'
import Payment from '../payment/index'
import Report from '../report/report'
import statistic from './statistic'
import Calendar from './calendar'
import Terminal from './terminal'
import Reason from './reason'
import Search from './search'

export default {
    props: ['date'],
    components: { Calendar, Dialoger, Terminal, Payment, Reason, Report, paymentMark, statistic },
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
                return
            }
            if (this.date !== this.today) {
                this.$dialog({
                    title: 'dialog.unableEdit', msg: 'dialog.editPrevOrderTip',
                    buttons: [{ text: 'button.confirm', fn: 'resolve' }]
                }).then(() => { this.$q() })
                return
            }
            if (this.order.status === 0) {
                this.$dialog({
                    title: 'dialog.unableEdit', msg: ['dialog.editVoidOrderTip', this.order.void.by],
                    buttons: [{ text: 'button.confirm', fn: 'resolve' }]
                }).then(() => { this.$q() })
                return
            }
            if (this.order.settled) {
                this.confirmPaymentRemoval();
                return
            }
            this.editOrder();
        },
        isVoidable() {
            !this.isEmptyTicket && this.approval(this.op.modify, "order") ?
                this.order.settled ? this.confirmPaymentRemoval() : this.voidOrder() : this.$denyAccess();
        },
        editOrder() {
            this.setTicket({ type: this.order.type, number: this.order.number });
            this.setApp({ mode: 'edit' });
            this.setCustomer(this.order.customer);
            this.setOrder(JSON.parse(JSON.stringify(this.order)))
            this.$router.push({ path: '/main/menu' });
        },
        voidOrder() {
            this.$dialog({
                type: "warning",
                title: ['dialog.voidOrderConfirm', this.order.number, this.$t('type.' + this.order.type)],
                msg: 'dialog.voidOrderConfirmTip',
                buttons: [{ text: 'button.cancel', fn: 'reject' }, { text: 'button.void', fn: 'resolve' }]
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
                this.$q();
                this.order.payment.type === 'GIFT' && this.issueGiftCardRefund();
                this.removePayment();
                this.updateInvoice(this.order);
                this.$nextTick(() => {
                    this.$dialog({
                        title: "dialog.paymentRemoved", msg: ["dialog.paymentRemovedTip", this.order.number],
                        buttons: [{ text: 'button.done', fn: 'reject' }, { text: 'button.edit', fn: 'resolve' }]
                    }).then(() => { this.editOrder() }).catch(() => { this.$q() })
                })
            }).catch(() => { this.$q() })
        },
        issueGiftCardRefund() {
            this.order.payment.log.filter(log => log.type === 'GIFT').map(log => log._id).forEach(_id => {
                this.$socket.emit('[GIFTCARD] REFUND', { cashier: this.op.name, _id })
            })
        },
        reOpenOrder() {
            if (this.isEmptyTicket) return;
            this.$dialog({
                type: "question",
                title: ['dialog.recoverOrderConfirm', this.order.number],
                msg: ['dialog.recoverOrderConfirmTip', this.order.void.by, this.$t('reason.' + this.order.void.note)]
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
            this.order.settled ? this.handleSettledInvoice() :
                this.order.source === 'POS' ? this.$p("Payment") :
                    this.askSettleType();
        },
        handleSettledInvoice() {
            this.$dialog({
                title: "dialog.orderSettled", msg: "dialog.orderSettledTip",
                buttons: [{ text: 'button.confirm', fn: 'resolve' }]
            }).then(() => { this.$q() })
        },
        askSettleType() {
            this.$dialog({
                type: 'question', title: 'dialog.thirdPartyInvoice', msg: 'dialog.thirdPartyInvoiceTip',
                buttons: [{ text: 'button.pay', fn: 'reject' }, { text: 'button.markAsPaid', fn: 'resolve' }]
            }).then(() => {
                this.$p('paymentMark')
            }).catch(() => {
                this.$p('Payment')
            })
        },
        print() {
            if (this.isEmptyTicket) return;

            let order = JSON.parse(JSON.stringify(this.order));
            order.split ? this.askSplitPrint(order) : this.printTicket(order);
        },
        receipt() {
            if (this.isEmptyTicket) return;

            let order = JSON.parse(JSON.stringify(this.order));
            order.split ? this.askSplitPrintReceipt(order) : this.printTicket(order, true);
        },
        askSplitPrint(order) {
            this.$dialog({
                type: 'question', title: 'dialog.printSplitTicket', msg: 'dialog.printSplitTicketTip',
                buttons: [{ text: 'button.combinePrint', fn: 'reject' }, { text: 'button.splitPrint', fn: 'resolve' }]
            }).then(() => { this.$q(), this.splitPrint(order) }).catch(() => { this.$q(), this.printTicket(order) })
        },
        askSplitPrintReceipt(order) {
            this.$dialog({
                type: 'question', title: 'dialog.printSplitTicket', msg: 'dialog.printSplitTicketTip',
                buttons: [{ text: 'button.combinePrint', fn: 'reject' }, { text: 'button.splitPrint', fn: 'resolve' }]
            }).then(() => { this.$q(), this.splitPrint(order, true) }).catch(() => { this.$q(), this.printTicket(order, true) })
        },
        printTicket(order, receipt) {
            receipt ?
                Printer.setTarget('Receipt').print(order, true) :
                Printer.setTarget('All').print(order);
            receipt && order.content.forEach(item => {
                delete item.new;
                item.print = true;
                item.pending = false;
            })
            this.updateInvoice(order);
        },
        splitPrint(order, receipt) {
            let split = [].concat.apply([], order.content.map(item => item.sort)).filter((v, i, s) => s.indexOf(v) === i).length;
            let ticket = JSON.parse(JSON.stringify(order));
            for (let i = 1; i < split + 1; i++) {
                ticket.content = order.content.filter(item => Array.isArray(item.sort) ? item.sort.includes(i) : item.sort === i);
                ticket.payment = order.splitPayment[i - 1];
                ticket.number = `${order.number}-${i}`;
                receipt ?
                    Printer.setTarget('Receipt').print(ticket, true) :
                    Printer.setTarget('All').print(ticket)
            }
            !receipt && order.content.forEach(item => {
                delete item.new;
                item.print = true;
                item.pending = false;
            })
            this.updateInvoice(order);
        },
        terminal() {
            this.station.terminal.enable ?
                this.$p("Terminal") :
                this.$dialog({
                    title: 'dialog.noTerminal', msg: 'dialog.stationNoTerminal',
                    buttons: [{ text: 'button.confirm', fn: 'resolve' }]
                }).then(() => { this.$q() })
        },
        report() {
            this.approval(this.op.access, "report") ? this.$p("Report") : this.$denyAccess();
        },
        search() { },
        updateInvoice(ticket) {
            this.$socket.emit("[UPDATE] INVOICE", ticket,true);
        },
        stats() {
            this.$parent.prevHistory.length > 0 ?
                this.$p('statistic', { history: this.$parent.prevHistory }) :
                this.$p('statistic')
        },
        ...mapActions(['setApp', 'setOrder', 'setTicket', 'resetMenu', 'setCustomer', 'removePayment'])
    },
    computed: {
        ...mapGetters(['op', 'order', 'station', 'isEmptyTicket'])
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