<template>
    <div class="popupMask center dark">
        <div class="window" v-show="!component">
            <header class="title">{{text('PAYMENT')}}
                <i class="fa fa-times" @click="init.reject"></i>
            </header>
            <nav>
                <div class="typeWrap">
                    <div class="type" @click="setPaymentType('CASH')">{{text('CASH')}}</div>
                    <div class="type" @click="setPaymentType('CREDIT')">{{text('CREDIT_CARD')}}</div>
                    <div class="type" @click="setPaymentType('GIFT')">{{text('GIFT_CARD')}}</div>
                </div>
                <div class="totalDue">
                    <span class="text">{{text('BALANCE_DUE')}}:</span>
                    <div class="inner">
                        <span class="due">{{payment.due | decimal}}</span>
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
                    <div class="btn" @click="roundUp">{{text('ROUND_UP')}}</div>
                    <div class="btn" @click="setTips">{{text('SET_TIP')}}</div>
                    <div class="btn" @click="setDiscount">{{text('SET_DISCOUNT')}}</div>
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
                            <span class="value">{{paid}}</span>
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
                            <div class="grid btn" @click="addValue">
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
                    <div class="numKey" v-for="num in quickInput" @click="setQuickInput(num)">{{num}}</div>
                </section>
            </article>
        </div>
        <div :is="component" :init="componentData"></div>
    </div>
</template>

<script>
import { mapGetters } from 'vuex'
import moment from 'moment'
import Preset from '../../preset'
import Dialoger from '../common/dialoger'
import CreditCard from './creditCard'
import GiftCard from './giftCard'
import Printer from '../../print'
import Inputter from './inputter'
import Discount from './discount'
import Tips from './tips'

export default {
    props: ['init'],
    created() {
        this.payment = Object.assign({}, this.init.payment);
        this.quickInput = this.generateQuickInput(this.payment.due);
    },
    mounted() {
        this.setPaymentType(this.payment.type || 'CASH')
    },
    data() {
        return {
            componentData: null,
            component: null,
            payment: null,
            paid: "0.00",
            pointer: "paid",
            reset: true,
            quickInput: [],
            creditCard: {
                number: "",
                date: "",
                code: ""
            },
            giftCard: {
                number: "",
                balance: "0.00"
            },
            evenPay: 1
        }
    },
    methods: {
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

            this.$nextTick(() => {
                document.querySelector('.display .data').classList.add('anchor')
            });
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
            this.pointer = target;
            this.reset = true;
        },
        input(num) {
            switch (this.payment.type) {
                case "CASH":
                    if (this.pointer === "paid") {
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
                    switch (this.pointer) {
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
                    if (this.pointer === 'number') {
                        this.reset ?
                            this.giftCard.number = num :
                            this.giftCard.number = String(this.giftCard.number) + num;
                        let number = this.giftCard.number.replace(/[^0-9]/g, '').slice(0, 16).replace(/(.{4})(.{4})(.{4})(.{4})/g, '$1 $2 $3 $4');
                        this.giftCard.number = number;
                    } else {
                        let value = (this.paid * 100).toFixed(0).toString() + num;
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
            if (this.pointer === "paid") {
                let value = (this.paid * 100).round(2).toString().slice(0, -1);
                this.paid = (value / 100).toFixed(2);
            } else {
                let value = String(this.evenPay).slice(0, -1);
                this.evenPay = value || 1;
                value || (this.reset = true);
            }
        },
        clearCash() {
            this.pointer === 'paid' ? this.paid = "0.00" : this.evenPay = 1;
            this.reset = true;
        },
        delCredit() {
            let p = this.pointer;
            if (p !== 'paid') {
                this.creditCard[p] = this.creditCard[p].slice(0, -1)
            } else {
                this.paid = this.paid.slice(0, -1)
            }
        },
        delGift() {
            this.giftCard.number = this.giftCard.number.slice(0, -1);
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
            let change = (this.paid - this.payment.due) > 0 ? (this.paid - this.payment.due).toFixed(2) : "0.00";
            let balance = (this.payment.due - this.paid) > 0 ? (this.payment.due - this.paid).toFixed(2) : "0.00";
            this.payment.due = (this.payment.due - this.paid).round(2);
            this.payment.due = this.payment.due <= 0 ? 0 : this.payment.due;
            this.payment.paid = this.paid;
            this.payment.log.push({
                type: "CASH",
                paid: this.paid,
                change, balance
            });
            if (this.payment.due !== 0) {
                this.paid = "0.00";
                this.reset = true;
                this.quickInput = this.generateQuickInput(this.payment.due);
                this.setInputAnchor("paid");
            } else {
                Printer.init(this.config).openCashDrawer();
                this.poleDisplay(["Paid CASH", this.paid], ["Change Due:", change]);
                this.$dialog({
                    title: this.text("CHANGE", change),
                    msg: this.text("CUST_PAID", this.paid),
                    buttons: [{
                        text: "CONFIRM",
                        fn: 'reject'
                    }, {
                        text: 'PRINT_RECEIPT',
                        fn: 'resolve'
                    }]
                }).then(() => {
                    this.payment.settled = true;
                    this.summarize({ print: true });
                }).catch(() => {
                    this.summarize({ print: false });
                })
            }
        },
        chargeCredit() {
            if (parseFloat(this.paid) === 0) return;
            if (this.paid > this.payment.due) this.paid = this.payment.due;
            let card = Object.assign({}, this.creditCard, {
                amount: this.paid
            });
            new Promise((resolve, reject) => {
                this.componentData = { card, resolve, reject };
                this.component = "CreditCard"
            }).then(transaction => {
                this.$exitComponent();
                this.payment.due = (parseFloat(this.payment.due) - parseFloat(transaction.amount.approve)).round(2);
                this.payment.due = this.payment.due <= 0 ? 0 : this.payment.due;
                this.payment.log.push({
                    type: "CREDIT",
                    paid: transaction.amount.approve,
                    change: this.due.change,
                    balance: this.payment.due,
                    id: transaction.unique,
                    number: transaction.account.number
                })
                transaction.order = {
                    type: this.ticket.type,
                    number: this.ticket.number,
                    cashier: this.op.name
                }
                this.$socket.emit("[TERM] SAVE_TRANSACTION", transaction);
                Printer.init(this.config).setJob("creditCard").print(transaction);
                if (parseFloat(this.payment.due) === 0) {
                    this.poleDisplay("Paid Credit Card", "Thank You");
                    this.payment.settled = true;
                    this.summarize({ print: true, transaction });
                }

            }).catch(reject => {
                this.$exitComponent();
                this.$dialog(reject).then(() => {
                    let payment = Object.assign(this.payment, {
                        due: 0,
                        paid: this.payment.due,
                        paidCredit: this.payment.due
                    })
                    this.summarize({ print: true, payment });
                }).catch(error => {
                    (error && error.title) ?
                        this.$dialog(error).then(() => {
                            this.$exitComponent();
                        }).catch(() => { this.$exitComponent() }) :
                        this.$exitComponent();
                })
            })
        },
        chargeGift() {
            if (parseFloat(this.paid) === 0) return;
            if (this.giftCard.balance > this.paid) {
                this.poleDisplay("Paid Gift Card", "Thank You");
                this.payment.due = (parseFloat(this.payment.due) - parseFloat(this.paid)).round(2);
                this.payment.due = this.payment.due <= 0 ? 0 : this.payment.due;
                let balance = this.giftCard.balance - this.paid;
                this.payment.log.push({
                    type: "GIFT",
                    paid: this.paid,
                    change: 0,
                    balance: balance.toFixed(2)
                });
                let activity = {
                    date: today(),
                    time: +new Date,
                    amount: this.paid,
                    balance,
                    type: 'DEBET',
                    op: this.op.name
                };
                this.$socket.emit("[GIFTCARD] CARD_ACTIVITY", {
                    _id: this.giftCard._id,
                    value: balance,
                    activity
                });
                this.payment.settled = true;
                this.summarize({ print: true });
            }
        },
        setQuickInput(value) {
            this.paid = value.toFixed(2);
        },
        roundUp() {
            let rounded = Math.ceil(this.payment.due);
            this.payment.due = rounded;
            this.paid = "0.00";
            this.quickInput = this.generateQuickInput(rounded);
        },
        getCardType(number) {
            let reg = new RegExp("^4");
            if (number.match(reg) !== null)
                return "VS";

            reg = new RegExp("^(34|37)");
            if (number.match(reg) !== null)
                return "AE";

            reg = new RegExp("^5[1-5]");
            if (number.match(reg) !== null)
                return "MC";

            reg = new RegExp("^6011");
            if (number.match(reg) !== null)
                return "DS";

            return "";
        },
        setTips() {
            let payment = this.payment;
            new Promise((resolve, reject) => {
                this.componentData = { payment, resolve, reject };
                this.component = "Tips";
            }).then(resolve => {
                this.payment.tip = resolve.tip;
                this.payment.gratuity = resolve.gratuity;
                //delivery fee ?
                this.payment.due = this.payment.total + resolve.tip + resolve.gratuity - this.payment.discount;
                this.quickInput = this.generateQuickInput(this.payment.due);
                this.poleDisplay(["Tip Adjust:", parseFloat(resolve.tip).toFixed(2)], ["Total:", parseFloat(this.payment.due).toFixed(2)]);
                this.$exitComponent();
            }).catch(() => {
                this.$exitComponent();
            });
        },
        setDiscount() {
            let payment = this.payment;
            new Promise((resolve, reject) => {
                this.componentData = { payment, resolve, reject };
                this.component = "Discount";
            }).then(resolve => {
                this.payment.discount = resolve.discount;
                this.payment.due = this.payment.total + this.payment.tip + this.payment.gratuity - this.payment.discount;
                this.paid = this.payment.due;
                this.quickInput = this.generateQuickInput(this.payment.due);
                this.poleDisplay(["Discount:", "-" + parseFloat(resolve.discount).toFixed(2)], ["Total:", parseFloat(this.payment.due).toFixed(2)]);
                this.$exitComponent();
            }).catch(() => {
                this.$exitComponent();
            })
        },
        swipeGiftCard() {
            new Promise((resolve, reject) => {
                this.componentData = { resolve, reject };
                this.component = "GiftCard";
            }).then(card => {
                this.giftCard.number = card;
                this.$exitComponent();
            }).catch(() => {
                this.$exitComponent();
            })
        },
        addValue() {
            if (this.giftCard.number.length !== 16) return;
            new Promise((resolve, reject) => {
                let title = "ADD_VALUE";
                this.componentData = { title, resolve, reject };
                this.component = "Inputter";
            }).then(value => {
                let activity = {
                    date: today(),
                    time: +new Date,
                    amount: value,
                    balance: this.giftCard.balance + value,
                    type: 'RELOAD',
                    op: this.op.name,
                    ticket: this.ticket
                };
                this.giftCard.reload = value.toFixed(2);
                this.giftCard.balance = (this.giftCard.balance + value).toFixed(2);
                Printer.init(this.config).setJob("reload").print(this.giftCard);
                this.$socket.emit("[GIFTCARD] CARD_ADD_VALUE", {
                    _id: this.giftCard._id,
                    value, activity
                });
                this.$exitComponent();
            }).catch(() => {
                this.$exitComponent();
            })
        },
        cashOut() {
            if (parseFloat(this.giftCard.balance) === 0) return;
            this.$dialog({
                type: "question",
                title: "CASH_OUT",
                msg: this.text("TIP_CASH_OUT", this.giftCard.balance.toFixed(2))
            }).then(() => {
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
                Printer.init(this.config).openCashDrawer();
                this.$dialog({
                    title: this.text('WITHDRAW', money.toFixed(2)),
                    msg: "TIP_WITHDRAW"
                }).then(() => {
                    this.$socket.emit("[GIFTCARD] CARD_ADJUST_VALUE", {
                        _id: this.giftCard._id,
                        value, activity
                    });
                    this.giftCard.balance = 0;
                    Printer.init(this.config).setJob("cashout").print(this.giftCard);
                    this.$exitComponent();
                })
            }).catch(() => {
                this.$exitComponent();
            })
        },
        printBalance() {
            if (this.giftCard.number.length !== 16) return;
            Printer.init(this.config).setJob("balance").print(this.giftCard);
        },
        activateGiftCard(number) {
            new Promise((resolve, reject) => {
                let title = "INIT_AMOUNT";
                this.componentData = { title, resolve, reject };
                this.component = "Inputter";
            }).then(initialAmount => {
                let card = Preset.giftCard(number, initialAmount, this.op.name);
                if (this.customer._id) {
                    card = Object.assign(card, {
                        customer: this.customer._id
                    })
                }
                this.giftCard = card;
                this.$socket.emit("[GIFTCARD] CARD_ACTIVATION", card);
                Printer.init(this.config).setJob("activation").print(card);
                this.$exitComponent();
            }).catch(() => {
                this.$exitComponent();
            })
        },
        poleDisplay(line1, line2) {
            if (!this.device.poleDisplay) return;
            poleDisplay.write('\f');
            poleDisplay.write(line(line1, line2));
        },
        generateQuickInput(amount) {
            let preset = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 60, 70, 80, 100, 120, 140, 150, 200, 300, 350, 400, 450, 500, 600, 700, 800, 900];
            let array = [];
            let round = Math.ceil(amount);
            array.push(amount.round(2));
            amount === round ?
                array.push((round + 1)) : array.push(round);
            let index = preset.findIndex(i => i > round);
            array.push(preset.slice(index, index + 6));
            return [].concat.apply([], array);
        },
        summarize(data) {
            let payment = data.hasOwnProperty('payment') ? data.payment : this.payment;
            let paidCash = 0, paidCredit = 0, paidGift = 0;
            payment.log.forEach(trans => {
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
            });
            if (paidCash) payment.paidCash = paidCash.toFixed(2);
            if (paidCredit) payment.paidCredit = paidCredit.toFixed(2);
            if (paidGift) payment.paidGift = paidGift.toFixed(2);
            data.payment = payment;
            this.init.resolve(data);
        }
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
    },
    computed: {
        due() {
            let change = this.paid - this.payment.due;
            let balance = this.payment.due - this.paid;
            return {
                change: change > 0 ? change.toFixed(2) : "0.00",
                balance: balance > 0 ? balance.toFixed(2) : "0.00"
            }
        },
        ...mapGetters(['op', 'config', 'ticket', 'customer', 'device'])
    },
    watch: {
        'giftCard.number'(n) {
            n && n.replace(/[^0-9]/g, '').length === 16 && this.$socket.emit("[GIFTCARD] QUERY_CARD", n.replace(/[^0-9]/g, ''));
        }
    },
    components: {
        Dialoger, Inputter, Discount, CreditCard, GiftCard, Tips
    },
    sockets: {
        GIFT_CARD_RESULT(card) {
            console.log(card);
            this.giftCard = card;
            this.$exitComponent();
        },
        GIFT_CARD_NOT_FOUND(number) {
            this.$dialog({
                title: "GC_ACTIVATION",
                msg: this.text("GC_CARD_NUMBER", number.replace(/(.{4})(.{4})(.{4})(.{4})/g, '$1 $2 $3 $4')),
                buttons: [{
                    text: "CANCEL",
                    fn: "reject"
                }, {
                    text: "ACTIVATION",
                    fn: "resolve"
                }]
            }).then(resolve => {
                this.activateGiftCard(number);
            }).catch(() => {
                this.giftCard.number = "";
                this.giftCard.balance = "0.00";
                this.$exitComponent();
            })
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

@keyframes cursor {
    from {
        border-bottom: 2px solid #fafafa;
    }
    to {
        border-bottom: 2px solid transparent;
    }
}
</style>