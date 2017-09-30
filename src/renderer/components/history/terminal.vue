<template>
    <div class="popupMask center dark">
        <div class="window" v-show="!component">
            <header class="title">
                <div class="wrap">
                    <span>{{$t('title.terminalRecord')}}</span>
                    <div class="dateWrap">
                        <i class="fa fa-chevron-left" @click="prevDate"></i>
                        <span class="date">{{date | moment('YYYY-MM-DD')}}</span>
                        <i class="fa fa-chevron-right" @click="nextDate"></i>
                    </div>
                </div>
                <i class="fa fa-times" @click="init.resolve"></i>
            </header>
            <div class="inner">
                <section class="trans">
                    <header>
                        <span>&nbsp;</span>
                        <span class="trans">{{$t('text.transaction')}}</span>
                        <span class="record">{{$t('text.cardInfo')}}</span>
                        <span class="amount">{{$t('text.amount')}}</span>
                        <span class="action">{{$t("text.action")}}</span>
                    </header>
                    <ul class="content">
                        <li v-for="(trans,index) in transaction" :key="index" :class="{void:trans.status === 0,settled:trans.close}">
                            <i class="fa fa-exclamation-triangle risk" v-if="isRisk(trans)" :title="$t('text.chargeBackRisk')"></i>
                            <i :class="getIcon(trans.status)" class="status"></i>
                            <div class="info">
                                <span class="num">#{{trans.trace.trans}}</span>
                                <span class="type">{{trans.transType}}</span>
                                <span class="order">{{$t('type.'+trans.order.type)}}
                                    <span class="ticket">(#{{trans.order.number}})</span>
                                </span>
                            </div>
                            <div class="card">
                                <i :class="cardType(trans.account.type)"></i>
                                <span :title="trans.addition.CARDBIN">...{{trans.account.number}}</span>
                                <span class="auth">{{trans.host.auth}}</span>
                            </div>
                            <div class="amount">
                                <span>$ {{(parseFloat(trans.amount.approve) + parseFloat(trans.amount.tip)).toFixed(2)}}</span>
                                <span v-show="parseFloat(trans.amount.tip) > 0" class="tip">(Tip: $ {{trans.amount.tip}})</span>
                            </div>
                            <div class="action">
                                <span @click="adjustTip(trans)" class="adjust">{{$t('button.adjust')}}</span>
                                <span @click="print(trans)" class="reprint">{{$t('button.print')}}</span>
                                <span @click="voidSale(trans)" class="void">{{$t('button.void')}}</span>
                            </div>
                        </li>
                    </ul>
                </section>
            </div>
            <footer>
                <button class="btn" @click="batch" :disabled="!ready">{{$t('button.batch')}}</button>
                <div class="pagination">
                    <div class="page" @click="page = page > 0 ? page - 1 : 0">
                        <i class="fa fa-angle-left"></i>
                    </div>
                    <div class="page" v-for="i in totalPage" @click="page = (i-1)" :key="i" :class="{active:page === (i-1)}">{{i}}</div>
                    <div class="page" @click="page = page === (totalPage-1) ? page : page + 1">
                        <i class="fa fa-angle-right"></i>
                    </div>
                </div>
                <div>
                    <div class="btn" @click="init.resolve">{{$t('button.exit')}}</div>
                </div>
            </footer>
        </div>
        <div :is="component" :init="componentData"></div>
    </div>
</template>

<script>
import { mapGetters } from 'vuex'
import dialoger from '../common/dialoger'
import processor from '../common/processor'
import tipper from './tipper'
export default {
    props: ['init'],
    components: { dialoger, tipper, processor },
    data() {
        return {
            transactions: [],
            componentData: null,
            component: null,
            filter: "all",
            device: null,
            date: moment().subtract(4, 'hours'),
            page: 0,
            ready: false
        }
    },
    created() {
        this.station.terminal.enable ? this.initialTerminal() : this.missTerminal();
    },
    methods: {
        initialTerminal() {
            let terminal = this.station.terminal;
            this.msg = this.$t('terminal.initial', terminal.model);
            this.terminal = this.getFile(terminal.model);
            this.terminal.initial(terminal.address, terminal.port, terminal.sn, this.station.alies)
                .then(r => r.text()).then((device) => {
                    this.device = this.terminal.check(device);
                    this.device.code === '000000' ? this.ready = true : this.disableBatchFn();
                })
            this.$socket.emit("[TERM] INITIAL", data => {
                let sn = this.device ? this.device.sn : this.station.terminal.sn;
                this.transactions = data.filter(trans => trans.device.sn === sn);
            });
        },
        prevDate() {
            this.date = this.date.clone().subtract(1, 'days');
            this.page = 0;
            this.$socket.emit('[TERM] TRANSACTION_BY_DATE', this.date.format('YYYY-MM-DD'));
        },
        nextDate() {
            this.date = this.date.clone().add(1, 'days');
            this.page = 0;
            this.$socket.emit('[TERM] TRANSACTION_BY_DATE', this.date.format('YYYY-MM-DD'));
        },
        getFile(device) {
            switch (device) {
                case 'SP30':
                case 'S80':
                case 'S300':
                    return require('../payment/parser/pax.js')
                case 'NX2200':
                    return require('../payment/parser/exadigm.js')
                default:
                    return require('../payment/parser/pax.js')
            }
        },
        isRisk(trans) {
            return (trans.status === 1 || trans.status === 2) && trans.account.entry !== 'Chip'
        },
        cardType(card) {
            switch (card) {
                case "Visa":
                    return "fa fa-cc-visa";
                case "MasterCard":
                    return "fa fa-cc-mastercard";
                case "American Express":
                    return "fa fa-cc-amex";
                case "Discover":
                    return "fa fa-cc-discover";
                default:
                    return "fa fa-credit-card-alt"
            }
        },
        getIcon(status) {
            switch (status) {
                case 1:
                    return "fa fa-circle-o";
                case 2:
                    //tiped 
                    return "fa fa-circle";
                case 3:
                    //settled
                    return "fa fa-check-circle";
                case 4:
                    //insufficient 
                    return "fa fa-info-circle";
                case 0:
                    //void
                    return "fa fa-times-circle";
                default:
                    //other
                    return "fa fa-question-circle"
            }
        },
        print(receipt) {
            //Printer.init(this.config).setJob('reprint creditCard').print(receipt);
            Printer.printCreditCard(receipt, true);
        },
        voidSale(record) {
            this.$dialog({
                title: "dialog.voidCreditSale", msg: ["dialog.voidCreditSaleTip", record.order.number, this.$t('type.' + record.order.type)],
                buttons: [{ text: 'button.cancel', fn: 'reject' }, { text: 'button.confirmPrint', fn: 'resolve' }]
            }).then(() => {
                let invoice = record.order.number;
                let trans = record.trace.trans;
                this.terminal.voidSale(invoice, trans).then((r) => r.text()).then((response) => {
                    let transaction = this.terminal.explainTransaction(response);
                    record = Object.assign(record, transaction, { status: 0 });
                    this.$socket.emit("[TERM] UPDATE_TRANSACTION", record);
                    //Printer.init(this.config).setJob('creditCard').print(transaction);
                    Printer.printCreditCard(transaction);
                    let order = this.history.find(ticket => ticket._id === record.order._id);
                    this.removePayment(order)
                });
                this.$q()
            }).catch(() => { this.$q() })
        },
        removePayment(ticket) {
            let total = parseFloat(ticket.payment.total);

            delete ticket.payment.paidCash;
            delete ticket.payment.paidCredit;
            delete ticket.payment.paidGift;
            delete ticket.payment.type;
            delete ticket.settled;

            if (ticket.payment.splitPayment) {
                delete ticket.payment.splitPayment;
                delete ticket.split;
            }

            Object.assign(ticket.payment, {
                settled: false,
                tip: 0,
                gratuity: 0,
                paid: 0,
                discount: 0,
                log: [],
                balance: total,
                due: total
            })

            this.$socket.emit("[UPDATE] INVOICE", ticket)
        },
        adjustTip(record) {
            let tip = record.amount.tip;
            this.approval(this.op.modify, "transaction") ?
                new Promise((resolve, reject) => {
                    this.componentData = { tip, resolve, reject };
                    this.component = "tipper";
                }).then((value) => {
                    this.$q();
                    value = isNumber(value) ? value : 0;
                    let total = parseFloat(record.amount.approve) + value;
                    this.$dialog({
                        title: 'dialog.tipAdjustment', msg: ['dialog.tipAdjustmentTip', value.toFixed(2), total.toFixed(2)]
                    }).then(() => {
                        this.$p("processor", { timeout: 30000 });
                        let amount = Math.round(value * 100);
                        let invoice = record.order.number;
                        let trans = record.trace.trans;
                        this.terminal.adjust(invoice, trans, amount).then(r => r.text())
                            .then((response) => {
                                this.$q();
                                let result = this.terminal.explainTransaction(response);
                                console.log(result)
                                result.code === '000000' ? this.applyAdjustTip(record, result, value) : this.adjustTipFailed(result.code);
                            })
                    }).catch(() => { this.$q() })
                }).catch(() => { this.$q() }) : this.$denyAccess();
        },
        applyAdjustTip(record, result, value) {
            this.$dialog({ title: 'dialog.tipAdjusted', msg: ['dialog.tipAdjustedTip', value, result.amount.approve], buttons: [{ text: 'button.confirm', fn: 'resolve' }] })
                .then(() => {
                    this.$q();
                    record.status = 2;
                    record.amount.tip = value;
                    this.$socket.emit("[TERM] UPDATE_TRANSACTION", record);
                    this.adjustOrderTip(record, value);
                })
        },
        adjustTipFailed(code) {
            this.$dialog({
                type: 'error', title: 'dialog.tipAdjustDenied', msg: ['dialog.tipAdjustDeniedTip', code], buttons: [{ text: 'button.confirm', fn: 'resolve' }]
            }).then(() => { this.$q() })
        },
        adjustOrderTip(record, tip) {
            let { order, amount } = record;
            let invoice = this.history.find(ticket => order._id === ticket._id);
            if (invoice.split) {
                let unique = record.unique;
                invoice.splitPayment.forEach(payment => {
                    payment.log.forEach(log => {
                        if (log.id === unique) {
                            payment.tip = parseFloat(tip)
                        }
                    })
                })
                invoice.payment.tip = 0;
                invoice.splitPayment.forEach(payment => {
                    invoice.payment.tip += parseFloat(payment.tip)
                })
            } else {
                invoice.payment.tip = parseFloat(tip);
            }
            this.$socket.emit("[UPDATE] INVOICE", invoice);
        },
        batch() {
            this.preBatch() && this.$dialog({
                title: 'dialog.batchClose', msg: "dialog.batchCloseTip",
                buttons: [{ text: "button.cancel", fn: 'reject' }, { text: 'button.batch', fn: 'resolve' }]
            }).then(() => { this.processBatch() }).catch(() => { this.$q() })
        },
        processBatch() {
            this.$p("processor", { timeout: 300000 });
            this.terminal.batch().then(r => r.text()).then(response => {
                this.$q();
                let result = this.terminal.explainBatch(response);
                if (result.code === '000000') {
                    let { sn } = this.device;
                    let updated = this.transactions.filter(trans => !trans.close).map(trans => {
                        trans.hasOwnProperty('device') && trans.device.sn === sn && (trans.close = true);
                        return trans;
                    })
                    this.$socket.emit("[TERM] BATCH_TRANS_CLOSE", updated);
                    Printer.printBatchReport(result);
                    this.$socket.emit('[TERM] SAVE_BATCH_RESULT', result);
                } else {
                    this.$dialog({
                        type: 'warning', title: result.msg, msg: ['terminal.error', result.code],
                        buttons: [{ text: 'button.confirm', fn: 'resolve' }]
                    }).then(() => { this.$q() })
                }
            })
        },
        preBatch() {
            let summary = {
                visa: 0,
                visaAmount: 0,
                master: 0,
                masterAmount: 0,
                discover: 0,
                discoverAmount: 0,
                amex: 0,
                amexAmount: 0,
                other: 0,
                otherAmount: 0,
                sales: 0,
                salesAmount: 0,
                tip: 0,
                tipAmount: 0,
                voidSale: 0,
                voidSaleAmount: 0
            }

            let content = this.transactions.filter(trans => {
                if (trans.close) return false;
                let approve = parseFloat(trans.amount.approve);
                let tip = parseFloat(trans.amount.tip);
                if (trans.status === 0) {
                    summary.voidSale++;
                    summary.voidSaleAmount += approve;
                } else {
                    summary.sales++;
                    summary.salesAmount += approve + tip;

                    if (tip > 0) {
                        summary.tip++;
                        summary.tipAmount += tip;
                    }
                }

                switch (trans.account.type) {
                    case "Visa":
                        if (trans.status === 1 || trans.status === 2) {
                            summary.visa++;
                            summary.visaAmount += approve + tip;
                        }
                        break;
                    case "MasterCard":
                        if (trans.status === 1 || trans.status === 2) {
                            summary.master++;
                            summary.masterAmount += approve + tip;
                        }
                        break;
                    case "Discover":
                        if (trans.status === 1 || trans.status === 2) {
                            summary.discover++;
                            summary.discoverAmount += approve + tip;
                        }
                        break;
                    case "American Express":
                        if (trans.status === 1 || trans.status === 2) {
                            summary.amex++;
                            summary.amexAmount += approve + tip;
                        }
                        break;
                    default:
                        if (trans.status === 1 || trans.status === 2) {
                            summary.other++;
                            summary.otherAmount += approve + tip;
                        }
                }
                return trans.status !== 0
            }).map(trans => {
                return {
                    trans: "#" + trans.trace.trans,
                    transType: trans.transType,
                    card: trans.account.number,
                    total: (parseFloat(trans.amount.approve) + parseFloat(trans.amount.tip)).toFixed(2),
                    tip: parseFloat(trans.amount.tip),
                    time: moment(trans.trace.time, 'YYYYMMDDHHmmss').format('HH:mm'),
                    orderType: this.text(trans.order.type),
                    ticket: "#" + trans.order.number
                }
            });
            if (content.length === 0) {
                this.checkBatchRecord();
                return false;
            }
            //Printer.init(this.config).setJob("prebatch").print({ content, summary });
            Printer.printPreBatchReport({ content, summary })
            return true;
        },
        checkBatchRecord() {
            new Promise((resolve, reject) => {
                this.$socket.emit('[TERM] BATCH_RECORD_BY_DATE', this.date.format("YYYY-MM-DD"));
                this.$options.sockets['BATCH_RECORDS'] = (results) => {
                    results.length > 0 ? resolve(results) : reject()
                }
            }).then(results => {
                this.$dialog({
                    type: 'question', title: 'dialog.reprintBatchReport', msg: 'dialog.reprintBatchReportTip'
                }).then(() => {
                    this.$q();
                    results.forEach(batch => {
                        //Printer.init(this.config).setJob("batch").print(result);
                        Printer.printBatchReport(batch)
                    })
                }).catch(() => { this.$q() })
            }).catch(() => {
                this.$dialog({
                    title: "dialog.batchFailed", msg: this.$t('terminal.error', 100023),
                    buttons: [{ text: 'button.confirm', fn: 'resolve' }]
                }).then(() => { this.$q() })
            })
        },
        disableBatchFn() {
            this.$dialog({
                type: 'warning', title: 'terminal.connectError', msg: 'terminal.disableBatch', buttons: [{ text: 'button.confirm', fn: 'resolve' }]
            }).then(() => {
                this.device = null;
                this.$q();
            })
        },
        missTerminal() {
            this.$dialog({
                type: 'warning', title: 'dialog.noTerminal', msg: 'dialog.stationNoTerminal', buttons: [{ text: 'button.confirm', fn: 'resolve' }]
            }).then(() => {
                this.$q();
                this.init.resolve();
            })
        }
    },
    computed: {
        transaction() {
            let min = this.page * 12;
            let max = min + 12;
            return this.transactions.slice(min, max)
        },
        totalPage() {
            let length = this.transactions.length;
            return Math.ceil(length / 12)
        },
        ...mapGetters(['op', 'config', 'language', 'history', 'station'])
    },
    sockets: {
        TERM_TRANSACTION(data) {
            let sn = this.device ? this.device.sn : this.station.terminal.sn;
            this.transactions = this.op.role === 'Admin' ? data : data.filter(trans => trans.device.sn === sn)
        }
    }
}
</script>

<style scoped>
.inner {
    height: 550px;
}

section.trans {
    width: 850px;
}

ul.content {
    height: 515px;
}

.content li {
    display: flex;
    padding: 10px 0 10px 5px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
    margin: 5px;
    background: #fff;
    position: relative;
}

.risk {
    position: absolute;
    color: var(--yellow);
    left: 20px;
    bottom: 5px;
}

.status {
    width: 25px;
    text-align: center;
    color: var(--green);
    text-shadow: 0 0px 1px #009688;
}

.info {
    flex: 1;
    display: flex;
}

.card {
    width: 180px;
    display: flex;
}

.num {
    width: 30px;
    text-align: left;
    padding-left: 10px;
    font-weight: bold;
    color: #333;
}

.type {
    width: 90px;
    text-align: center;
}

.order {
    padding-left: 10px;
    flex: 1;
}

.ticket {
    margin: 0 5px;
    color: #607D8B;
}

.fa-cc-visa {
    color: var(--deepBlue);
}

.fa-cc-mastercard {
    color: var(--orange);
}

.fa-cc-discover {
    color: var(--yellow);
}

.auth {
    margin: 0 20px;
    padding: 0 5px;
    background: #4CAF50;
    color: #fff;
    border-radius: 4px;
    box-shadow: 0 1px 1px rgba(0, 0, 0, 0.3);
}

li .amount {
    flex: 1;
    max-width: 145px;
}

span.tip {
    font-size: 0.8em;
    color: #37474F;
}

.trans header {
    padding: 5px 15px;
    display: flex;
    color: #797575;
    text-shadow: 0 0px 1px #fff;
    font-family: 'Microsoft YaHei';
}

header .record {
    width: 180px;
}

header .amount {
    flex: 1;
}

header .action {
    width: 195px;
}

li .action {
    width: 205px;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 18px;
}

.action span {
    padding: 5px 10px;
    margin-right: 5px;
    border-radius: 4px;
    box-shadow: 0 1px 1px rgba(0, 0, 0, 0.5);
    text-shadow: 0 1px 1px #441800;
}

span.adjust {
    background: #FF9800;
    color: #fff;
}

span.void {
    background: red;
    color: #FFCDD2;
}

span.reprint {
    background: #9E9E9E;
    color: #fff;
}

li.void,
.void .num {
    color: #F44336;
}

.void .action {
    visibility: hidden;
}

.void .status {
    color: red;
    text-shadow: 0 0 1px #E91E63;
}

.settled {
    filter: opacity(0.7) grayscale(1);
    cursor: not-allowed;
    pointer-events: none;
}

.title .wrap {
    display: flex;
}

.date {
    font-family: 'Agency FB';
    color: #B3E5FC;
    text-shadow: 0 0 1px #0D47A1;
    font-weight: bold;
    width: 90px;
    text-align: center;
}

.dateWrap {
    flex: 1;
    align-items: center;
    padding: 0 10px;
    display: flex;
}

.dateWrap i {
    padding: 0 10px;
    cursor: pointer;
}

.pagination {
    flex: 1;
    display: flex;
    align-items: center;
    padding: 0 10px;
    justify-content: center;
}

.pagination .page {
    margin: 5px;
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