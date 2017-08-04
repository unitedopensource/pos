<template>
    <div class="popupMask center dark">
        <div class="window" v-show="!component">
            <header class="title">
                <span>{{text('PAYMENT')}}</span>
                <div v-if="!payMode && order.hasOwnProperty('splitPayment')" class="splitter">
                    <label v-for="(split,index) in order.splitPayment" :key="index">
                        <input type="radio" name="split" :id="'split_'+index" :value="index" v-model="current" @change="switchInvoice">
                        <label :for="'split_'+index" class="tag">#{{index + 1}}</label>
                    </label>
                </div>
                <i class="fa fa-times" @click="init.reject"></i>
            </header>
            <nav>
                <div class="typeWrap">
                    <div class="type" @click="setPaymentType('CASH')">{{text('CASH')}}</div>
                    <div class="type" @click="setPaymentType('CREDIT')">{{text('CREDIT_CARD')}}</div>
                    <div class="type" @click="setPaymentType('GIFT')">{{text('GIFT_CARD')}}</div>
                </div>
                <div class="totalDue" @dblclick="roundUp">
                    <span class="text">{{text('BALANCE_DUE')}}:</span>
                    <div class="inner">
                        <span class="due">{{payment.balance | decimal}}</span>
                        <div class="addition" v-show="payment.discount !== 0">
                            <span class="text">{{text('DISCOUNT')}}</span>
                            <span class="value">-{{payment.discount | decimal}}</span>
                        </div>
                        <div class="addition" v-show="payment.tip !== 0">
                            <span class="text">{{text('TIP')}}</span>
                            <span class="value">+{{payment.tip | decimal}}</span>
                        </div>
                        <div class="addition" v-show="payment.gratuity !== 0">
                            <span class="text">{{text('GRATUITY')}}</span>
                            <span class="value">+{{payment.gratuity | decimal}}</span>
                        </div>
                    </div>
                </div>
                <div class="extra">
                    <div class="btn" @click="setTips">{{text('SET_TIP')}}</div>
                    <div class="btn" @click="setDiscount">{{text('SET_DISCOUNT')}}</div>
                    <div class="btn" @click="savePayment">{{text('SAVE')}}</div>
                </div>
            </nav>
            <article>
                <section class="numpad">
                    <div @click="input('7')">7</div>
                    <div @click="input('8')">8</div>
                    <div @click="input('9')">9</div>
                    <div @click="input('4')">4</div>
                    <div @click="input('5')">5</div>
                    <div @click="input('6')">6</div>
                    <div @click="input('1')">1</div>
                    <div @click="input('2')">2</div>
                    <div @click="input('3')">3</div>
                    <div @click="input('0')">0</div>
                    <div @click="input('00')">00</div>
                </section>
                <section class="field" v-if="payment.type ==='CASH'">
                    <div class="display">
                        <div class="data" @click="setInputAnchor('paid',$event)">
                            <span class="text">{{text('PAYMENT')}}</span>
                            <span class="value">{{paid | decimal}}</span>
                        </div>
                        <div class="data">
                            <span class="text">{{text('CHANGE_DUE')}}</span>
                            <span class="value">{{due.change}}</span>
                        </div>
                        <div class="data">
                            <span class="text">{{text('BALANCE_REMAIN')}}</span>
                            <span class="value">{{due.balance}}</span>
                        </div>
                        <div class="data" @click="setInputAnchor('evenPay',$event)">
                            <span class="text">{{text('SEPARATE')}}
                                <span class="people">${{(payment.due / evenPay) | decimal}}</span>
                            </span>
                            <span class="value">{{evenPay}}</span>
                        </div>
                    </div>
                    <aside class="numpad">
                        <div @click="delCash">&#8592;</div>
                        <div @click="clearCash">C</div>
                        <div @click="chargeCash">&#8626;</div>
                    </aside>
                </section>
                <section class="field" v-else-if="payment.type === 'CREDIT'">
                    <div class="display">
                        <div class="data" @click="setInputAnchor('paid',$event)">
                            <span class="text">{{text('PAYMENT')}}</span>
                            <span class="value">{{paid | decimal}}</span>
                        </div>
                        <div class="data" @click="setInputAnchor('number',$event)">
                            <span class="text">{{text('CC_NUMBER')}}</span>
                            <input v-model="creditCard.number">
                        </div>
                        <div class="data" @click="setInputAnchor('date',$event)">
                            <span class="text">{{text('CC_EXP')}}</span>
                            <span class="value">{{creditCard.date | exp}}</span>
                        </div>
                        <div class="data" @click="setInputAnchor('code',$event)">
                            <span class="text">{{text('CVV')}}</span>
                            <span class="value">{{creditCard.code}}</span>
                        </div>
                    </div>
                    <aside class="numpad">
                        <div @click="delCredit">&#8592;</div>
                        <div @click="clearCredit">C</div>
                        <div @click="chargeCredit">&#8626;</div>
                    </aside>
                </section>
                <section class="field" v-else>
                    <div class="display">
                        <div class="data" @click="setInputAnchor('paid',$event)">
                            <span class="text">{{text('PAYMENT')}}</span>
                            <span class="value">{{paid}}</span>
                        </div>
                        <div class="data" @click="setInputAnchor('number',$event)" v-if="giftCard.number.length !== 16">
                            <span class="text">{{text('CC_NUMBER')}}</span>
                            <input v-model="giftCard.number">
                        </div>
                        <div class="data" v-else>
                            <span class="text">{{text('BALANCE_DUE')}}
                                <span class="card" v-show="giftCard.number">(...{{giftCard.number.slice(12,16)}})</span>
                            </span>
                            <span class="value">$ {{giftCard.balance | decimal}}</span>
                        </div>
                        <div class="option">
                            <div class="grid btn" @click="reload">
                                <i class="fa fa-plus"></i>
                                <span class="text">{{text('ADD_VALUE')}}</span>
                            </div>
                            <div class="grid btn" @click="cashOut">
                                <i class="fa fa-money"></i>
                                <span class="text">{{text('REDEMP')}}</span>
                            </div>
                            <div class="grid btn" @click="printBalance">
                                <i class="fa fa-print"></i>
                                <span class="text">{{text('PRT_BALANCE')}}</span>
                            </div>
                            <div class="grid btn">
                                <i class="fa fa-list-ol"></i>
                                <span class="text">{{text('HISTORY')}}</span>
                            </div>
                        </div>
                    </div>
                    <aside class="numpad">
                        <div @click="delGift">&#8592;</div>
                        <div @click="clearGift">C</div>
                        <div @click="chargeGift">&#8626;</div>
                    </aside>
                </section>
                <section class="quickInput">
                    <div class="numKey" v-for="(num,i) in quickInput" @click="setQuickInput(num)" :key="i">{{num}}</div>
                </section>
            </article>
        </div>
        <div :is="component" :init="componentData"></div>
    </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

import Dialoger from '../common/dialoger'
import CreditCard from './creditCard'
import Splitter from '../menu/split'
import Preset from '../../preset'
import GiftCard from './giftCard'
import Printer from '../../print'
import Reloader from './Reloader'
import Discount from './discount'
import Tips from './tips'
export default {
    props: ['init'],
    components: { Dialoger, Reloader, Discount, CreditCard, GiftCard, Tips, Splitter },
    data() {
        return {
            componentData: null,
            component: null,
            quickInput: [],
            payment: {},
            anchor: "paid",
            paid: "0.00",
            reset: true,
            creditCard: {
                number: "",
                date: "",
                code: ""
            },
            giftCard: {
                number: "",
                balance: "0.00"
            },
            evenPay: 1,
            current: 0,
            payMode: true //true pay in whole , false pay in 
        }
    },
    created() {
        this.init.hasOwnProperty("payment") ? this.payIndividual() :
            this.order.split ? this.askSplitPay() : this.initial();
    },
    mounted() {
        this.setPaymentType(this.payment.type || 'CASH');
    },
    methods: {
        initial() {
            this.payment = JSON.parse(JSON.stringify(this.order.payment));
            this.payment.balance = Math.max(0, (this.payment.due - this.payment.paid));
            this.getQuickInput(this.payment.balance);
            this.poleDisplay(["TOTAL DUE:", ""], ["", this.payment.due.toFixed(2)]);
        },
        payIndividual() {
            this.payMode = false;
            this.payment = JSON.parse(JSON.stringify(this.init.payment));
            this.payment.balance = Math.max(0, (this.payment.due - this.payment.paid));
            this.getQuickInput(this.payment.balance);
        },
        askSplitPay() {
            this.$dialog({
                type: "question",
                title: "SPLIT_PAYMENT",
                msg: "TIP_SPLIT_PAYMENT",
                buttons: [{ text: 'PAID_IN_FULL', fn: "reject" }, { text: "SPLIT_PAY", fn: "resolve" }]
            }).then(() => {
                this.paySplit();
                this.$q();
            }).catch(() => {
                this.initial();
                this.setPaymentType(this.payment.type || 'CASH');
                this.$q()
            })
        },
        paySplit() {
            this.payMode = false;
            this.switchInvoice();
        },
        setPaymentType(type) {
            let dom = document.querySelector('.type.set');
            let doms = document.querySelectorAll(".typeWrap > div");
            dom && dom.classList.remove('set');
            dom = document.querySelector('.data.anchor');
            dom && dom.classList.remove("anchor");

            switch (type) {
                case "CASH":
                    doms[0].classList.add("set");
                    this.paid = '0.00';
                    break;
                case "CREDIT":
                    doms[1].classList.add("set");
                    this.paid = this.payment.due.toFixed(2);
                    break;
                case "GIFT":
                    doms[2].classList.add("set");
                    this.paid = this.payment.due.toFixed(2);
                    this.giftCard = {
                        number: "",
                        balance: "0.00"
                    }
                    this.swipeGiftCard();
                    break;
            }
            this.$nextTick(() => { document.querySelector('.display .data').classList.add('anchor') });
            this.setInputAnchor("paid");
            this.payment = Object.assign({}, this.payment, { type });
            this.reset = true;
        },
        setInputAnchor(target, e) {
            this.$nextTick(() => {
                let dom = document.querySelector('.data.anchor');
                dom && dom.classList.remove('anchor');
                e ? e.currentTarget.classList.add('anchor') :
                    document.querySelector('.display .data').classList.add('anchor');
                target === 'number' && document.querySelector('.data input').focus();
            });
            this.anchor = target;
            this.reset = true;
        },
        input(num) {
            switch (this.payment.type) {
                case "CASH":
                    if (this.anchor === "paid") {
                        let value = (this.paid * 100).toFixed(0).toString() + num;
                        this.reset ?
                            this.paid = (num / 100).toFixed(2) :
                            this.paid = (value / 100).toFixed(2);
                        this.paid = this.paid > 9999 ? "9999.00" : this.paid;
                    } else {
                        this.reset ?
                            this.evenPay = num :
                            this.evenPay = String(this.evenPay) + num;
                        this.evenPay = this.evenPay > 99 ? 99 : this.evenPay;
                    }
                    break;
                case "CREDIT":
                    switch (this.anchor) {
                        case "paid":
                            let value = (this.paid * 100).toFixed(0).toString() + num;
                            this.reset ?
                                this.paid = (num / 100).toFixed(2) :
                                this.paid = (value / 100).toFixed(2);
                            this.paid = this.paid > 9999 ? "9999.00" : this.paid;
                            break;
                        case "number":
                            this.reset ?
                                this.creditCard.number = num :
                                this.creditCard.number = String(this.creditCard.number) + num;
                            this.creditCard.number = this.creditCard.number.replace(/[^0-9]/g, '').slice(0, 16);
                            break;
                        case "date":
                            this.reset ?
                                this.creditCard.date = num :
                                this.creditCard.date = (this.creditCard.date.replace(/[^0-9]/g, '') + num).slice(0, 4);
                            break;
                        case "code":
                            this.reset ?
                                this.creditCard.code = num :
                                this.creditCard.code = (this.creditCard.code + num).slice(0, 4);
                            break;
                    }
                    break;
                case "GIFT":
                    if (this.anchor === 'number') {
                        this.reset ?
                            this.giftCard.number = num :
                            this.giftCard.number = String(this.giftCard.number) + num;
                        let number = this.giftCard.number.replace(/[^0-9]/g, '').slice(0, 16).replace(/(.{4})(.{4})(.{4})(.{4})/g, '$1 $2 $3 $4');
                        this.giftCard.number = number;
                    } else {
                        let value = (this.paid * 100).toFixed(0) + num;
                        this.reset ?
                            this.paid = (num / 100).toFixed(2) :
                            this.paid = (value / 100).toFixed(2);
                        this.paid = this.paid > 9999 ? "9999.00" : this.paid;
                    }
                    break;
            }
            this.reset = false;
        },
        delCash() {
            if (this.anchor === "paid") {
                let value = (this.paid * 100).toFixed(0).slice(0, -1);
                this.paid = (value / 100).toFixed(2);
            } else {
                let value = String(this.evenPay).slice(0, -1);
                this.evenPay = value || 1;
                value || (this.reset = true);
            }
        },
        clearCash() {
            this.anchor === 'paid' ? this.paid = "0.00" : this.evenPay = 1;
            this.reset = true;
        },
        delCredit() {
            let p = this.anchor;
            p !== 'paid' ?
                this.creditCard[p] = this.creditCard[p].slice(0, -1) :
                this.paid = (this.paid * 100).toFixed(0).slice(0, -1) / 100;
        },
        delGift() {
            let p = this.pointer;
            p !== 'paid' ?
                this.giftCard.number = this.giftCard.number.slice(0, -1) :
                this.paid = (this.paid * 100).toFixed(0).slice(0, -1) / 100;
        },
        clearCredit() {
            switch (this.pointer) {
                case "number":
                    this.creditCard.number = "";
                    break;
                case "date":
                    this.creditCard.date = "";
                    break;
                case "code":
                    this.creditCard.code = "";
                    break;
                default:
                    this.paid = "0.00"
            }
        },
        clearGift() {
            this.giftCard.number = "";
            this.giftCard.balance = "0.00";
        },
        chargeCash() {
            if (parseFloat(this.paid) === 0) return;
            this.payment.paid += parseFloat(this.paid);

            let change = this.payment.change = Math.max(0, (this.paid - this.payment.due)).toFixed(2);
            let balance = this.payment.balance = Math.max(0, (this.payment.due - this.payment.paid)).toFixed(2);

            this.payment.log.push({
                type: "CASH",
                paid: this.paid,
                change, balance
            });
            this.changeDue(this.paid, change, balance);
        },
        changeDue(paid, change, balance) {
            this.recordCashDrawerAction(paid, change);
            this.poleDisplay(["Paid Cash", this.paid.toFixed(2)], ["Change Due:", change]);

            balance > 0 ?
                this.payRemainBalance() :
                this.invoicePaid(paid, change, "CASH");
        },
        payRemainBalance() {
            this.paid = "0.00";
            this.reset = true;
            this.getQuickInput(this.payment.balance);
            this.setInputAnchor("paid");
        },
        chargeCredit() {
            if (parseFloat(this.paid) === 0) return;
            if (this.paid > this.payment.due) this.paid = this.payment.due.toFixed(2);

            let card = Object.assign({}, {
                creditCard: this.creditCard,
                amount: this.paid
            });

            new Promise((resolve, reject) => {
                this.componentData = { card, resolve, reject };
                this.component = "CreditCard";
            }).then((data) => { this.creditAccept(data) }).catch((reason) => { this.creditReject(reason) });
        },
        creditAccept(trans) {
            this.payment.balance = Math.max(0, (this.payment.due - trans.amount.approve)).toFixed(2);
            this.payment.log.push({
                id: trans.unique,
                type: "CREDIT",
                paid: trans.amount.approve,
                change: "0.00",
                balance: this.payment.balance,
                number: trans.account.number
            });
            Object.assign(trans, { order: this.assignOrder() });
            this.$socket.emit("[TERM] SAVE_TRANSACTION", trans);
            Printer.init(this.config).setJob("creditCard").print(trans);
            if (parseFloat(this.payment.balance) === 0) {
                this.payment.settled = true;
                this.poleDisplay("PAID by Credit Card", "Thank You");
                this.invoicePaid(trans.amount.approve, 0, "CREDIT")
            }
        },
        creditReject(reason) {
            this.$dialog(reason).then(() => { $q() }).catch(() => { this.$q() })
        },
        swipeGiftCard() {
            new Promise((resolve, reject) => {
                this.componentData = { resolve, reject };
                this.component = "GiftCard";
            }).then(card => {
                this.giftCard.number = card;
                this.$q();
            }).catch(() => { this.$q() })
        },
        assignOrder() {
            return this.ticket.type === 'DINE_IN' ?
                {
                    type: this.order.hasOwnProperty("type") ? this.order.type : this.ticket.type,
                    number: this.order.hasOwnProperty("number") ? this.order.number : this.ticket.number,
                    cashier: this.order.hasOwnProperty("cashier") ? this.order.cashier : this.op.name,
                    server: this.order.hasOwnProperty("server") ? this.order.server : this.op.name,
                } : {
                    type: this.order.hasOwnProperty("type") ? this.order.type : this.ticket.type,
                    number: this.order.hasOwnProperty("number") ? this.order.number : this.ticket.number,
                    cashier: this.order.hasOwnProperty("cashier") ? this.order.cashier : this.op.name,
                }
        },
        setTips() {
            new Promise((resolve, reject) => {
                this.componentData = { payment: this.payment, resolve, reject };
                this.component = "Tips"
            }).then(result => {
                let due = parseFloat(this.payment.total) + parseFloat(result.tip) + parseFloat(result.gratuity) - parseFloat(this.payment.discount);
                this.payment = Object.assign({}, this.payment, {
                    tip: parseFloat(result.tip),
                    gratuity: parseFloat(result.gratuity),
                    due, balance: due
                });
                this.getQuickInput(due);
                this.poleDisplay(["Tip Adjust:", result.tip.toFixed(2)], ["Total:", due.toFixed(2)]);
                this.$q();
            }).catch(() => { this.$q() });
        },
        setDiscount() {
            new Promise((resolve, reject) => {
                this.componentData = { payment: this.payment, resolve, reject };
                this.component = "Discount";
            }).then(result => {
                let due = parseFloat(this.payment.total) + parseFloat(result.tip) + parseFloat(result.gratuity) - parseFloat(this.payment.discount);
                this.payment = Object.assign({}, this.payment, {
                    tip: parseFloat(result.tip),
                    gratuity: parseFloat(result.gratuity),
                    due, balance: due
                });
                this.getQuickInput(due);
                this.poleDisplay(["Discount:", -result.discount.toFixed(2)], ["Total:", due.toFixed(2)]);
                this.$q();
            }).catch(() => { this.$q() });
        },
        reload() {
            if (!this.giftCard._id) return;
            this.$p("Reloader", { title: "ADD_VALUE", giftCard: this.giftCard });
        },
        cashOut() {
            if (parseFloat(this.giftCard.balance) === 0) return;
            this.$dialog({
                type: "question", title: "CASH_OUT", msg: this.text("TIP_CASH_OUT", this.giftCard.balance.toFixed(2))
            }).then(() => {
                this.recordCashDrawerAction(0, parseFloat(this.giftCard.balance));
                let money = this.giftCard.balance;
                let value = 0;
                let activity = {
                    date: today(),
                    time: +new Date,
                    amount: value,
                    balance: value,
                    type: 'CASHOUT',
                    op: this.op.name
                };
                this.$dialog({ title: this.text('WITHDRAW', money.toFixed(2)), msg: "TIP_WITHDRAW", buttons: [{ text: 'CONFIRM', fn: 'resolve' }] }).then(() => {
                    this.$socket.emit("[GIFTCARD] CARD_ADJUST_VALUE", { _id: this.giftCard._id, value, activity });
                    this.giftCard.balance = 0;
                    Printer.init(this.config).setJob("cashout").print(this.giftCard);
                    this.$q();
                })
            }).catch(() => { this.$q() })
        },
        printBalance() {
            if (!this.giftCard._id) return;
            this.poleDisplay("Gift Card Balance:", ["", this.giftCard.balance.toFixed(2)])
            Printer.init(this.config).setJob("balance").print(this.giftCard);
        },
        activateGiftCard() {
            // new Promise((resolve, reject) => {
            //     let title = "INIT_AMOUNT";
            //     this.componentData = { title, resolve, reject };
            //     this.component = "Inputter";
            // }).then((initialAmount) => {
            //     this.recordCashDrawerAction(parseFloat(initialAmount), 0);
            //     let card = Preset.giftCard(number, this.op.name, initialAmount, 0);
            //     if (this.customer._id) {
            //         card = Object.assign(card, { customer: this.customer._id })
            //     }
            //     this.giftCard = card;
            //     this.$socket.emit("[GIFTCARD] CARD_ACTIVATION", card);
            //     Printer.init(this.config).setJob("activation").print(card);
            //     this.$q();
            // }).catch(() => { this.$q() })
        },
        chargeGift() {
            if (parseFloat(this.paid) === 0) return;
            if (this.giftCard.balance > this.paid) {
                this.poleDisplay("PAID by Gift Card", "Thank You");
                let balance = Math.max(0, (this.payment.due - this.paid)).toFixed(2);
                this.payment.log.push({
                    type: "GIFT",
                    paid: this.paid,
                    change: 0,
                    balance
                });
                let activity = {
                    date: today(),
                    time: +new Date,
                    amount: this.paid,
                    balance,
                    type: 'DEBET',
                    op: this.op.name
                };
                let remain = this.giftCard.balance - this.paid;
                this.$socket.emit("[GIFTCARD] CARD_ACTIVITY", {
                    _id: this.giftCard._id,
                    value: remain,
                    activity
                });
                this.payment.settled = true;
                this.summarize({ print: true });
            } else {
                //insufficient fund
                let balance = (Math.abs(this.giftCard.balance - this.paid)).toFixed(2);
                this.poleDisplay("Gift Card NSF", ["Due:", balance]);
                this.payment.log.push({
                    type: "GIFT",
                    paid: this.paid,
                    change: 0,
                    balance
                });
                let activity = {
                    date: today(),
                    time: +new Date,
                    amount: this.paid,
                    balance,
                    type: 'DEBET',
                    op: this.op.name
                };
                let remain = Math.max(0, (this.giftCard.balance - this.paid));
                this.$socket.emit("[GIFTCARD] CARD_ACTIVITY", {
                    _id: this.giftCard._id,
                    value: remain,
                    activity
                });
            }
        },
        setQuickInput(value) {
            this.paid = value.toFixed(2);
        },
        invoicePaid(paid, change, type) {
            let order = JSON.parse(JSON.stringify(this.order));
            let customer = Object.assign({}, this.customer);
            let paidCash = 0, paidCredit = 0, paidGift = 0;
            delete customer.extra;

            Object.assign(order, {
                payment: this.payment,
                customer,
                type: this.newTicket ? this.ticket.type : this.order.type,
                number: this.newTicket ? this.ticket.number : this.order.number,
                station: this.station.alies,
                cashier: this.op.name,
                source: "POS",
                modify: this.newTicket ? 0 : this.order.modify + 1,
                status: 1,
                time: this.newTicket ? +new Date() : this.order.time,
                date: today(),
                settled: true,
                print: true
            });

            order.payment.log.forEach(trans => {
                switch (trans.type) {
                    case "CASH":
                        paidCash += parseFloat(trans.paid);
                        break;
                    case "CREDIT":
                        paidCredit += parseFloat(trans.paid);
                        break;
                    case "GIFT":
                        paidGift += parseFloat(trans.paid);
                        break;
                }
            })
            if (paidCash) order.payment.paidCash = paidCash.toFixed(2);
            if (paidCredit) order.payment.paidCredit = paidCredit.toFixed(2);
            if (paidGift) order.payment.paidGift = paidGift.toFixed(2);
            if (this.payMode) {
                this.newTicket ?
                    this.$socket.emit("[SAVE] INVOICE", order) : this.$socket.emit("[UPDATE] INVOICE", order);

                type === 'CASH' ?
                    this.$dialog({
                        title: this.text("CHANGE", change),
                        msg: this.text("CUST_PAID", paid.toFixed(2)),
                        buttons: [{ text: 'CONFIRM', fn: 'reject' }, { text: 'PRINT_RECEIPT', fn: 'resolve' }]
                    }).then(() => { this.invoiceSettled(order) }).catch(() => { this.invoiceSettled(false) }) :
                    this.askReceipt.then(() => { this.invoiceSettled(order) }).catch(() => { this.invoiceSettled(false) });
            } else {
                this.payment.settled = true;
                if (this.order.hasOwnProperty('splitPayment')) {
                    this.order.splitPayment[this.current] = this.payment;
                    this.askReceipt().then(() => { this.printSplitReceipt() }).catch(() => { this.nextSplit() });
                } else {
                    this.init.resolve(this.payment);
                }
            }
        },
        askReceipt() {
            return this.$dialog({ type: "question", title: "PRINT_RECEIPT", msg: "TIP_PRINT_RECEIPT", buttons: [{ text: 'CONFIRM', fn: 'reject' }, { text: 'PRINT_RECEIPT', fn: 'resolve' }] })
        },
        printSplitReceipt() {
            let index = this.current + 1;
            let order = JSON.parse(JSON.stringify(this.order));
            order.number = order.number + '-' + index;
            order.payment = order.splitPayment[this.current];
            order.cashier = this.op.name;
            order.customer = this.customer;
            Printer.init(this.config).setJob("receipt").print(order);
            order.content.filter(item => item.sort === this.payment.sort).forEach(item => {
                item.print = true;
                item.pending = false;
            });
            this.nextSplit();
        },
        nextSplit() {
            this.$q();
            let settled = this.order.splitPayment.every(ticket => ticket.settled === true);
            if (settled) {
                this.saveSplitPayment();
                return;
            };
            let index = this.order.splitPayment.findIndex(ticket => !ticket.settled);
            index === -1 ? this.saveSplitPayment() && this.init.resolve() : this.switchInvoice(index);
        },
        saveSplitPayment() {
            let customer = Object.assign({}, this.customer);
            delete customer.extra;
            switch (this.$route.name) {
                case "Menu":
                    if (this.app.mode === 'create') {
                        this.setOrder({
                            customer,
                            payment: this.combineSplitPayment(),
                            type: this.ticket.type,
                            number: this.ticket.number,
                            station: this.station.alies,
                            cashier: this.op.name,
                            source: "POS",
                            modify: 0,
                            status: 1,
                            settled: true,
                            time: +new Date,
                            date: today()
                        });
                        this.$socket.emit("[SAVE] INVOICE", this.order);
                    } else {
                        this.setOrder({
                            lastEdit: +new Date,
                            editor: this.op.name,
                            modify: this.order.modify + 1,
                            cashier: this.op.name,
                            payment: this.combineSplitPayment(),
                            settled: true
                        });
                        this.$socket.emit("[UPDATE] INVOICE", this.order)
                    }
                    this.resetAll();
                    this.$router.push({ path: "/main" });
                    break;
                case "Table":
                    this.setOrder({
                        cashier: this.op.name,
                        payment: this.combineSplitPayment(),
                        settled: true
                    });
                    this.$socket.emit("[UPDATE] INVOICE", this.order);
                    this.store.table.autoClean ? this.resetCurrentTable() : this.setTableInfo({ status: 4 });
                    this.$socket.emit("TABLE_MODIFIED", this.currentTable);
                    this.init.resolve();
                    break;
                case "History":
                    this.setOrder({
                        cashier: this.op.name,
                        payment: this.combineSplitPayment(),
                        settled: true
                    });
                    this.$socket.emit("[UPDATE] INVOICE", this.order);
                    this.init.resolve();
                    break;
            }
        },
        combineSplitPayment() {
            let payment = { tip: 0, gratuity: 0, discount: 0, delivery: 0, subtotal: 0, tax: 0, total: 0, paid: 0, due: 0, log: [], paidCash: 0, paidCredit: 0, paidGift: 0 };
            this.order.splitPayment.forEach(settle => {
                payment.tip += settle.tip;
                payment.gratuity += settle.gratuity;
                payment.discount += settle.discount;
                payment.delivery += settle.delivery;
                payment.subtotal += settle.subtotal;
                payment.tax += settle.tax;
                payment.total += settle.total;
                payment.paid += settle.paid;
                payment.due += settle.due;
                payment.log.push(...settle.log);
                settle.hasOwnProperty('paidCash') && (payment.paidCash += parseFloat(settle.paidCash));
                settle.hasOwnProperty('paidCredit') && (payment.paidCredit += parseFloat(settle.paidCredit));
                settle.hasOwnProperty('paidGift') && (payment.paidGift += parseFloat(settle.paidGift));
            })
            return payment
        },
        savePayment() {
            if (this.payMode) {
                this.setOrder({ cashier: this.op.name, payment: this.payment });
                this.init.resolve();
            } else {
                this.init.resolve(this.payment);
            }
        },
        invoiceSettled(ticket) {
            if (ticket) {
                Printer.init(this.config).setJob("receipt").print(ticket);
                ticket.content.forEach(item => {
                    item.print = true;
                    item.pending = false;
                });
                this.$socket.emit("[UPDATE] INVOICE", ticket);
            }

            switch (this.$route.name) {
                case "Menu":
                    if (ticket.type !== 'BUFFET') {
                        this.resetAll();
                        this.init.resolve();
                        this.$router.push({ path: "/main" });
                    } else {
                        this.init.resolve();
                        this.$emit("execute", 'resetSection');
                    }
                    break;
                case "History":
                    this.init.resolve();
                    break;
                case "Table":
                    this.store.table.autoClean ? this.resetCurrentTable() : this.setTableInfo({ status: 4 });
                    this.$socket.emit("TABLE_MODIFIED", this.currentTable);
                    this.init.resolve();
                    break;
            }
        },
        recordCashDrawerAction(inflow, outflow) {
            Printer.init(this.config).openCashDrawer();
            let cashDrawer = this.store.stuffBank ? this.op.name : this.station.cashDrawer.name;
            let activity = {
                type: "CASHFLOW",
                inflow: parseFloat(inflow),
                outflow: parseFloat(outflow),
                time: +new Date,
                ticket: this.ticket,
                operator: this.op.name
            }
            this.$socket.emit("[CASHFLOW] NEW_ACTIVITY", { cashDrawer, activity });
        },
        switchInvoice(index) {
            if (isNumber(index)) this.current = index;
            this.payment = this.order.splitPayment[this.current];
            this.payment.balance = Math.max(0, (this.payment.due - this.payment.paid));
            this.paid = "0.00";
            this.setPaymentType("CASH");
            this.getQuickInput(this.payment.balance);
        },
        roundUp() {
            let rounded = Math.ceil(this.payment.due);
            this.payment.due = rounded;
            this.payment.balance = Math.max(0, (rounded - this.payment.discount)).toFixed(2);
            this.paid = "0.00";
            this.getQuickInput(rounded);
        },
        getQuickInput(amount) {
            let preset = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 60, 70, 80, 100, 120, 140, 150, 200, 300, 350, 400, 450, 500, 600, 700, 800, 900, 1000];
            let array = [];
            let round = Math.ceil(isNumber(amount) ? amount : 0);
            array.push(amount.toFixed(2));
            amount === round ? array.push((round + 1)) : array.push(round);
            let index = preset.findIndex(i => i > round);
            array.push(preset.slice(index, index + 6));
            this.quickInput = [].concat.apply([], array);
        },
        poleDisplay() {
            if (!this.device.poleDisplay) return;
            poleDisplay.write('\f');
            poleDisplay.write(line(line1, line2));
        },
        ...mapActions(['setOrder', 'resetAll', 'setTableInfo', 'resetCurrentTable'])
    },
    computed: {
        isNewTicket(){
            return this.app.mode === 'create' && this.$route.name === 'Menu';
        },
        due() {
            let change = this.paid - this.payment.due;
            let balance = this.payment.settled ? this.payment.balance : this.payment.due - this.paid;

            return {
                change: Math.max(0, change).toFixed(2),
                balance: Math.max(0, balance).toFixed(2)
            }
        },
        ...mapGetters(['op', 'app', 'config', 'ticket', 'order', 'store', 'device', 'station', 'customer', 'currentTable'])
    },
    filters: {
        cc: {
            read(value) {
                let card = [];
                for (let i = 0; i < value.length; i += 4) {
                    card.push(value.substring(i, i + 4));
                }
                return card.join(' ');
            },
            write(value) {
                return value.replace(/[^0-9]/g, "");
            }
        },
        exp(date) {
            return date.replace(/(.{2})/, '$1 / ')
        }
    }
}
</script>

<style scoped>
.window {
    width: 916px;
}

nav {
    display: flex;
    margin-left: 4px;
}

.typeWrap {
    display: flex;
    height: 60px;
}

.type {
    width: 104px;
    margin: 4px 6px 4px 0;
    background: #fff;
    border: 2px solid #e0e0e0;
    position: relative;
    text-align: center;
    line-height: 49px;
    border-radius: 4px;
    color: #bdbdbd;
}

.type.set {
    background: #66bb6a;
    color: #fafafa;
    border: 2px solid #009688;
    text-shadow: 0 2px 1px rgba(0, 0, 0, .5);
    box-shadow: 0 1px 2px rgba(0, 0, 0, .3);
}

.type.set:before {
    position: absolute;
    content: ' ';
    width: 23px;
    height: 15px;
    background: #009688;
    bottom: 0;
    right: 0;
    border-top-left-radius: 4px;
}

.type.set:after {
    position: absolute;
    content: '\f00c';
    font-family: fontAwesome;
    bottom: -17px;
    right: 2px;
}

.totalDue {
    width: 219px;
    height: 42px;
    margin: 10px 0 4px;
    border-radius: 4px;
    border: 2px solid #607d8b;
    color: #3c3c3c;
    position: relative;
}

.totalDue>.text {
    position: absolute;
    top: -10px;
    background: #f5f5f5;
    font-weight: 700;
    left: 10px;
    padding: 0 5px;
}

article {
    display: flex;
    margin-left: 4px;
}

section.numpad {
    display: flex;
    flex-wrap: wrap;
    width: 342px;
}

section.numpad>div:last-child {
    width: 223px;
}

.extra {
    margin: 0 0 0 4px;
}

.extra .btn {
    height: 48px;
    margin: 6px 2px;
    width: 106px;
}

.data {
    width: 223px;
    height: 83.8px;
    margin-bottom: 5px;
    position: relative;
    border-radius: 2px;
    text-align: left;
    background: #fff;
    color: #555;
    box-shadow: var(--shadow);
}

.data .text {
    font-size: 1.5em;
    padding: 10px 10px 5px;
    display: block;
}

.data .value {
    margin: 5px 10px 0 0;
    font-size: 1.35em;
    text-align: right;
    float: right;
}

.data.anchor {
    background: #5c6bc0;
    color: #fff;
}

.data.anchor input {
    color: #fff;
}

section.field {
    display: flex;
}

aside.numpad {
    text-align: center;
    margin-left: 5px;
}

section.quickInput {
    margin-left: 3px;
    display: flex;
    flex-wrap: wrap;
    height: 353px;
    width: 228px;
}

.numKey {
    font-size: 2em;
    line-height: 55px;
}

.data.anchor .value {
    animation: cursor 1s linear infinite;
}

.totalDue .inner {
    display: flex;
    font-size: 1.5em;
    margin-top: 12px;
    padding: 0 10px;
    justify-content: flex-end;
    align-items: flex-end;
}

.addition {
    display: flex;
    flex-direction: column;
    padding: 0 4px;
    text-align: center;
    color: #FF9800;
    font-size: 16px;
}

.addition .text {
    font-size: 12px;
}

.data input {
    font-size: 1.3em;
    width: 200px;
    border: none;
    outline: none;
    margin: 0 10px;
    text-align: right;
    background: transparent;
}

.data.anchor input {
    border-bottom: 2px solid #E8EAF6;
}

span.people {
    display: inline-block;
    font-family: 'Microsoft YaHei';
    font-size: 14px;
    color: #fff;
    padding: 2px 8px;
    background: #4CAF50;
    border-radius: 4px;
    box-shadow: 0 1px 1px #607D8B;
}

.option {
    width: 223px;
}

.grid {
    width: 103px;
    padding: 9px 0;
    margin: 4px 4px 4px 2px;
}

span.card {
    font-size: 0.65em;
    color: #4CAF50;
}

.splitter input {
    display: none;
}

.splitter {
    display: inline-flex;
    margin-left: 10px;
}

.splitter input:checked+label {
    background: #3F51B5;
}

.splitter .tag {
    padding: 5px 15px;
    margin: 0 2px;
    cursor: pointer;
    transition: background 0.3s ease;
    border-radius: 4px;
    background: #51aef5;
}

@keyframes cursor {
    from {
        border-bottom: 2px solid #fafafa;
    }
    to {
        border-bottom: 2px solid transparent;
    }
}
</style>