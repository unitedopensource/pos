<template>
    <div>
        <button class="btn" @click="editOrder" :disabled="order.content.length === 0">
            <i class="fa fa-list-alt"></i>
            <span class="text">{{$t('button.edit')}}</span>
        </button>
        <button class="btn" @click="switchTable">
            <i class="fa fa-exchange"></i>
            <span class="text">{{$t("button.switchTable")}}</span>
        </button>
        <button class="btn" @click="combineTable">
            <i class="fa fa-hand-paper-o"></i>
            <span class="text">{{$t('button.combineTable')}}</span>
        </button>
        <button class="btn" @click="prePayment">
            <i class="fa fa-print"></i>
            <span class="text">{{$t('button.receipt')}}</span>
        </button>
        <button class="btn" @click="settle">
            <i class="fa fa-money"></i>
            <span class="text">{{$t('button.payment')}}</span>
        </button>
        <button class="btn" @click="switchStaff">
            <i class="fa fa-user-times"></i>
            <span class="text">{{$t('button.switch')}}</span>
        </button>
        <button class="btn" @click="split">
            <i class="fa fa-clone"></i>
            <span class="text">{{$t('button.split')}}</span>
        </button>
        <button class="btn" @click="exit">
            <i class="fa fa-times"></i>
            <span class="text">{{$t('button.exit')}}</span>
        </button>
        <button class="btn" @click="clearTable">
            <i class="fa fa-recycle"></i>
            <span class="text">{{$t('button.clearTable')}}</span>
        </button>
        <div :is="component" :init="componentData"></div>
    </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import dialoger from '../common/dialoger'
import payment from '../payment/payment'
import Printer from '../../print'
import split from '../menu/split'
export default {
    components: { dialoger, payment, split },
    data() {
        return {
            componentData: null,
            component: null
        }
    },
    methods: {
        editOrder() {
            if (!this.approval(this.op.view, 'tables') && this.currentTable.current.server !== this.op.name) {
                this.editDenied();
                return
            }
            if (!this.order.settled) {
                this.setApp({ mode: 'edit' })
                this.setTicket({ type: 'DINE_IN', number: this.order.number })
                this.$router.push({ path: '/main/menu' })
            } else {
                this.handleSettledOrder()
            }
        },
        editDenied() {
            this.$dialog({
                title: 'dialog.cannotModify', msg: ['dialog.noRightToModify', this.order.server], buttons: [{ text: 'button.confirm', fn: 'resolve' }]
            }).then(() => { this.$q() })
        },
        handleSettledOrder() {
            this.$dialog({
                title: ['dialog.settledOrderReopen', this.order.number],
                msg: ['dialog.settledOrderReopenTip', this.$t('type.' + this.order.payment.type)],
                buttons: [{ text: 'button.removePayment', fn: 'resolve' }, { text: 'button.cancel', fn: 'reject' }]
            }).then(() => {
                this.$q();
                this.removeOrderPayment()
            }).catch(() => { this.$q() })
        },
        removeOrderPayment() {
            this.$dialog({
                title: 'dialog.paymentRemoveConfirm', msg: ['dialog.paymentRemoveConfirmTip', this.$t('type.' + this.order.payment.type)]
            }).then(() => {
                this.$q();
                this.removePayment();
                this.$socket.emit("[UPDATE] INVOICE", this.order);
                this.setTableInfo({ status: 3 });
                this.$socket.emit("TABLE_MODIFIED", this.currentTable);
                this.askEditOrder();
            }).catch(() => { this.$q() })
        },
        askEditOrder() {
            this.$dialog({
                title: "dialog.paymentRemoved", msg: ["dialog.paymentRemovedTip", this.order.number],
                buttons: [{ text: 'button.cancel', fn: 'reject' }, { text: 'button.edit', fn: 'resolve' }]
            }).then(() => { this.editOrder() }).catch(() => { this.$q() })
        },
        switchTable() {

        },
        combineTable() {

        },
        prePayment() {
            if (this.isEmptyTicket) return;
            if (this.order.settled) {
                this.settledOrder()
            } else if (this.order.print) {
                this.$dialog({
                    type: "question", title: "dialog.prePayment", msg: ['dialog.prePaymentTip', this.order.table],
                    buttons: [{ text: 'button.cancel', fn: "reject" }, { text: "button.print", fn: "resolve" }]
                }).then(() => {
                    this.$q();
                    this.$nextTick(() => {
                        this.order.split ? this.askSplitPrePayment() : this.printPrePayment();
                    })
                }).catch(() => { this.$q() })
            } else {
                let remain = this.order.content.filter(item => !item.print).length;
                this.$dialog({
                    title: 'dialog.prePaymentFailed', msg: ['dialog.prePaymentFailedTip', remain], buttons: [{ text: 'button.confirm', fn: 'resolve' }]
                }).then(() => { this.$q() })
            }
        },
        printPrePayment() {
            let order = JSON.parse(JSON.stringify(this.order));
            Object.assign(order, {
                type: 'PRE_PAYMENT',
                cashier: this.op.name
            })
            Printer.init(this.config).setJob('receipt').print(order);
            this.$socket.emit("[UPDATE] TABLE_SETTLED", { table: order.tableID, status: 3 })
            // this.setTableInfo({ status: 3 });
            // this.$socket.emit("TABLE_MODIFIED", this.currentTable);
        },
        askSplitPrePayment() {
            this.$dialog({
                type: 'question', title: 'dialog.printSplitTicket', msg: 'dialog.printSplitTicketTip',
                buttons: [{ text: 'button.combinePrint', fn: 'reject' }, { text: 'button.splitPrint', fn: 'resolve' }]
            }).then(() => { this.$q(), this.splitPrint() }).catch(() => { this.$q(), this.printPrePayment() })
        },
        splitPrint() {
            let split = [].concat.apply([], this.order.content.map(item => item.sort)).filter((v, i, s) => s.indexOf(v) === i).length;
            let ticket = JSON.parse(JSON.stringify(this.order));
            for (let i = 1; i < split + 1; i++) {
                ticket.content = this.order.content.filter(item => Array.isArray(item.sort) ? item.sort.includes(i) : item.sort === i);
                ticket.payment = this.order.splitPayment[i - 1];
                ticket.number = `${this.order.number}-${i}`;
                Printer.init(this.config).setJob("receipt").print(ticket);
            }
            this.setTableInfo({ status: 3 });
            this.$socket.emit("TABLE_MODIFIED", this.currentTable);
        },
        settle() {
            if (this.isEmptyTicket) return;
            if (this.op.cashCtrl !== 'enable' && this.op.cashCtrl !== 'staffBank') {
                this.$denyAccess();
                return;
            }
            if (this.order.settled) {
                this.settledOrder();
                return;
            }
            this.$p('payment')
        },
        settledOrder() {
            this.$dialog({
                title: "dialog.invoiceSettled", msg: "dialog.invoiceSettledTip",
                buttons: [{ text: 'button.confirm', fn: 'resolve' }]
            }).then(() => { this.$q() })
        },
        switchStaff() {

        },
        split() {
            if (this.isEmptyTicket) return;
            if (this.order.settled) {
                this.settledOrder();
                return;
            }
            this.$p('split')
        },
        exit() {
            this.resetAll();
            this.$router.push({ path: "/main" });
        },
        clearTable() {
            if (!this.currentTable) return;
            if (this.currentTable.status === 4 || this.currentTable.current.invoice.length === 0) {
                this.$dialog({
                    title: "dialog.tableClear", msg: ["dialog.tableClearTip", this.currentTable.name],
                    buttons: [{ text: 'button.cancel', fn: 'reject' }, { text: 'button.clear', fn: 'resolve' }]
                }).then(() => {
                    this.resetMenu();
                    this.resetCurrentTable();
                    this.$socket.emit("TABLE_MODIFIED", this.currentTable);
                    this.$q();
                }).catch(() => { this.$q() })
            } else {
                this.$dialog({
                    type: "info", title: 'dialog.tableClearFailed', msg: ['dialog.tableClearFailedTip', this.currentTable.name],
                    buttons: [{ text: 'button.confirm', fn: 'resolve' }]
                }).then(() => { this.$q() })
            }
        },
        ...mapActions(['setApp', 'resetMenu', 'resetAll', 'setTicket', 'removePayment', 'setTableInfo', 'resetCurrentTable'])
    },
    computed: {
        ...mapGetters(['op', 'config', 'order', 'isEmptyTicket', 'currentTable'])
    }
}
</script>