<template>
    <div class="popupMask center dark">
        <transition-group name="payment" appear mode="out-in">
            <div class="window" v-show="!component" :key="0">
                <header class="title">
                    <span>{{$t('menu.payment')}}</span>
                    <div v-if="!payInFull && order.hasOwnProperty('splitPayment')" class="splitter">
                        <label v-for="(split,index) in order.splitPayment" :key="index">
                            <input type="radio" name="split" :id="'split_'+index" :value="index" v-model="current" @change="switchInvoice">
                            <label :for="'split_'+index" class="tag">#{{index + 1}}</label>
                        </label>
                    </div>
                    <i class="fa fa-times" @click="init.reject(false)"></i>
                </header>
                <nav>
                    <div class="typeWrap">
                        <div class="type">
                            <input type="radio" v-model="payment.type" name="paymentType" value="CASH" id="CASH" @change="setPaymentType('CASH')">
                            <label for="CASH">{{$t('type.CASH')}}</label>
                        </div>
                        <div class="type">
                            <input type="radio" v-model="payment.type" name="paymentType" value="CREDIT" id="CREDIT" @change="setPaymentType('CREDIT')">
                            <label for="CREDIT">{{$t('type.CREDIT')}}</label>
                        </div>
                        <div class="type">
                            <input type="radio" v-model="payment.type" name="paymentType" value="GIFT" id="GIFT" @change="setPaymentType('GIFT')">
                            <label for="GIFT">{{$t('type.GIFT')}}</label>
                        </div>
                    </div>
                    <div class="totalDue" @dblclick="roundUp">
                        <span class="text">{{$t('text.balanceDue')}}:</span>
                        <div class="inner">
                            <span class="due">{{payment.balance | decimal}}</span>
                            <div class="addition" v-show="parseFloat(payment.discount) !== 0">
                                <span class="text">{{$t('text.discount')}}</span>
                                <span class="value">-{{payment.discount | decimal}}</span>
                            </div>
                            <div class="addition" v-show="parseFloat(payment.tip) !== 0">
                                <span class="text">{{$t('text.tip')}}</span>
                                <span class="value">+{{payment.tip | decimal}}</span>
                            </div>
                            <div class="addition" v-show="parseFloat(payment.gratuity) !== 0">
                                <span class="text">{{$t('text.gratuity')}}</span>
                                <span class="value">+{{payment.gratuity | decimal}}</span>
                            </div>
                        </div>
                    </div>
                    <div class="extra">
                        <button class="btn" @click="setTips">{{$t('button.setTip')}}</button>
                        <button class="btn" @click="setDiscount" :disabled="!op.modify.includes('discount')">{{$t('button.setDiscount')}}</button>
                        <button class="btn" @click="savePayment">{{$t('button.save')}}</button>
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
                            <div class="data" @click="setInput('paid',$event)">
                                <span class="text">{{$t('text.paid')}}</span>
                                <span class="value">{{paid | decimal}}</span>
                            </div>
                            <div class="data">
                                <span class="text">{{$t('text.changeDue')}}</span>
                                <span class="value">{{due.change}}</span>
                            </div>
                            <div class="data">
                                <span class="text">{{$t('text.balance')}}</span>
                                <span class="value">{{due.balance}}</span>
                            </div>
                            <div class="data" @click="setInput('evenPay',$event)">
                                <span class="text">{{$t('text.separate')}}
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
                            <div class="data" @click="setInput('paid',$event)">
                                <span class="text">{{$t('text.paid')}}</span>
                                <span class="value">{{paid | decimal}}</span>
                            </div>
                            <div class="data" @click="setInput('tip',$event)">
                                <span class="text">{{$t('button.setTip')}}</span>
                                <span class="value">{{tip}}</span>
                            </div>
                            <div class="data" @click="setInput('number',$event)">
                                <span class="text">{{$t('card.number')}}</span>
                                <input v-model="creditCard.number">
                            </div>
                            <div class="data" @click="setInput('date',$event)">
                                <span class="text">{{$t('card.expirationDate')}}</span>
                                <span class="value">{{creditCard.date | exp}}</span>
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
                            <div class="data" @click="setInput('paid',$event)">
                                <span class="text">{{$t('text.paid')}}</span>
                                <span class="value">{{paid}}</span>
                            </div>
                            <div class="data" @click="setInput('number',$event)" v-if="giftCard.number.length !== 16">
                                <span class="text">{{$t('card.number')}}</span>
                                <input v-model="giftCard.number">
                            </div>
                            <div class="data" v-else>
                                <span class="text">{{$t('text.balance')}}
                                    <span class="card" v-show="giftCard.number">(...{{giftCard.number.slice(12,16)}})</span>
                                </span>
                                <span class="value">$ {{giftCard.balance | decimal}}</span>
                            </div>
                            <div class="option">
                                <div class="grid btn" @click="reload">
                                    <i class="fa fa-plus"></i>
                                    <span class="text">{{$t('card.reload')}}</span>
                                </div>
                                <div class="grid btn" @click="cashOut">
                                    <i class="fa fa-money"></i>
                                    <span class="text">{{$t('card.redemption')}}</span>
                                </div>
                                <div class="grid btn" @click="printBalance">
                                    <i class="fa fa-print"></i>
                                    <span class="text">{{$t('card.printBalance')}}</span>
                                </div>
                                <div class="grid btn">
                                    <i class="fa fa-list-ol"></i>
                                    <span class="text">{{$t('card.history')}}</span>
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
            <div :is="component" :init="componentData" :key="1"></div>
        </transition-group>
    </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import Dialoger from '../common/dialoger'
import Capture from '../giftCard/capture'
import Loader from '../giftCard/loader'
import CreditCard from './creditCard'
import Splitter from '../menu/split'
import Preset from '../../preset'
import Reloader from './Reloader'
import Discount from './discount'
import paymentMark from './mark'
import Tips from './tips'
export default {
    props: ['init'],
    components: { Dialoger, Reloader, Discount, CreditCard, Capture, Tips, Splitter, Loader, paymentMark },
    data() {
        return {
            releaseComponentLock: true,
            componentData: null,
            component: null,
            quickInput: [],
            payment: {},
            order: null,
            anchor: "paid",
            paid: "0.00",
            tip: '0.00',
            reset: true,
            creditCard: {
                number: "",
                date: ""
            },
            giftCard: {
                number: "",
                balance: "0.00"
            },
            evenPay: 1,
            current: 0,
            payInFull: true
        }
    },
    created() {
        this.order = JSON.parse(JSON.stringify(this.$store.getters.order));
        this.payment = Object.assign(this.order.payment, { type: 'CASH' });
        this.checkComponentUsage();
        this.setPaymentType('CASH');
    },
    beforeDestroy() {
        this.releaseComponentLock && this.$socket.emit('[COMPONENT] UNLOCK', { component: 'payment', lock: this.order._id })
    },
    methods: {
        checkComponentUsage() {
            let data = {
                component: 'payment',
                operator: this.op.name,
                lock: this.order._id,
                time: +new Date,
                exp: +new Date + 1000 * 120
            }
            this.$socket.emit('[COMPONENT] LOCK', data, result => {
                if (result) {
                    this.paymentPending(result)
                } else {
                    this.init.hasOwnProperty("index") ? this.paySplit(this.init.index) :
                        this.order.split ? this.askPayMode() : this.initial();
                }
            })
        },
        paymentPending(result) {
            let current = +new Date();
            let exp = result.exp;
            let duration = exp - current;
            this.releaseComponentLock = false;
            this.$dialog({
                title: 'dialog.pending', msg: 'dialog.pendingOrderAccessDenied', timeout: { duration, fn: 'resolve' },
                buttons: [{ text: 'button.confirm', fn: 'resolve' }]
            }).then(() => {
                this.init.reject()
            })
        },
        initial() {
            this.payment.balance = Math.max(0, (this.payment.due - this.payment.paid));
            this.getQuickInput(this.payment.balance);
            this.poleDisplay(["TOTAL DUE:", ""], ["", this.payment.due.toFixed(2)]);
        },
        askPayMode() {
            if (this.releaseComponentLock) {
                this.$dialog({
                    type: "question", title: "dialog.splitPayment", msg: "dialog.splitPaymentTip",
                    buttons: [{ text: 'button.paidInFull', fn: "reject" }, { text: "button.splitPay", fn: "resolve" }]
                }).then(() => {
                    this.paySplit();
                    this.$q();
                }).catch(() => {
                    this.payWhole();
                    this.setPaymentType('CASH');
                    this.$q()
                })
            }
        },
        paySplit(index) {
            this.appear = true;
            this.payInFull = false;
            index = isNumber(index) ? index : this.order.splitPayment.findIndex(payment => !payment.settled)
            this.switchInvoice(index);
        },
        payWhole() {
            let paid = 0;
            this.payment.log.forEach(log => { paid += (log.paid - log.change) });
            this.payment.balance = Math.max(0, (this.payment.due - paid));
            this.getQuickInput(this.payment.balance);
            this.poleDisplay(["TOTAL DUE:", ""], ["", this.payment.due.toFixed(2)]);
        },
        setPaymentType(type) {
            switch (type) {
                case "CASH":
                    this.paid = '0.00';
                    break;
                case "CREDIT":
                    this.paid = (parseFloat(this.payment.due) - parseFloat(this.payment.paid)).toFixed(2);
                    break;
                case "GIFT":
                    this.paid = (parseFloat(this.payment.due) - parseFloat(this.payment.paid)).toFixed(2);
                    this.giftCard = {
                        number: "",
                        balance: "0.00"
                    }
                    this.swipeGiftCard();
                    break;
            }
            this.setInput("paid");
            this.payment = Object.assign({}, this.payment, { type });
            this.payment.tip = this.tip = '0.00';
            this.reset = true;
        },
        setInput(target, e) {
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
                        case "tip":
                            let tip = (this.tip * 100).toFixed(0).toString() + num;
                            this.reset ?
                                this.tip = (num / 100).toFixed(2) :
                                this.tip = (tip / 100).toFixed(2);
                            this.payment.tip = this.tip = this.tip > 9999 ? "9999.00" : this.tip;
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
            let p = this.anchor;
            p !== 'paid' ?
                this.giftCard.number = this.giftCard.number.slice(0, -1) :
                this.paid = (this.paid * 100).toFixed(0).slice(0, -1) / 100;
        },
        clearCredit() {
            switch (this.anchor) {
                case "number":
                case "date":
                    this.creditCard[this.anchor] = "";
                    break;
                case "tip":
                    this.payment.tip = this.tip = '0.00'
                    this.payment.total = (parseFloat(this.payment.subtotal) + parseFloat(this.payment.tax) + parseFloat(this.payment.tip) + parseFloat(this.payment.gratuity)).toFixed(2);
                    this.payment.due = (parseFloat(this.payment.total) - parseFloat(this.payment.discount)).toFixed(2)
                    this.paid = (parseFloat(this.payment.due) - parseFloat(this.payment.paid)).toFixed(2);
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

            let change = this.payment.change = Math.max(0, (this.paid - this.payment.balance)).toFixed(2);
            let balance = this.payment.balance = Math.max(0, (this.payment.due - this.payment.paid)).toFixed(2);

            this.payment.log.push({
                type: "CASH",
                paid: this.paid,
                change, balance
            });
            this.changeDue(this.paid, change, balance);
        },
        // checkCashInStatus() {
        //     let status = true;
        //     switch (this.op.cashCtrl) {
        //         case "enable":
        //             this.station.cashDrawer.cashFlowCtrl ?
        //                 this.$socket.emit("[CASHFLOW] CHECK", { date: today(), cashDrawer: this.station.cashDrawer.name, close: false },
        //                     (data) => {
        //                         let { name, initial } = data;
        //                         initial ? this.initialCashFlow(name) : this.recordCashDrawerAction(name);
        //                     }) : Printer.init(this.config).openCashDrawer();
        //             break;
        //         case "staffBank":
        //             this.$socket.emit("[CASHFLOW] CHECK", { date: today(), cashDrawer: this.op.name, close: false });
        //             break;
        //         case "disable":
        //             this.$denyAccess()
        //             break;
        //         default:
        //             this.$denyAccess()
        //     }
        //     return status;
        // },
        // initialCashFlow() {
        //     this.$dialog({
        //         title: 'dialog.'
        //     })
        // },
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
            this.setInput("paid");
        },
        chargeCredit() {
            if (parseFloat(this.paid) === 0) return;
            if (this.paid > this.payment.due) {
                let extra = (this.paid - this.payment.due).toFixed(2);
                this.$dialog({
                    title: 'dialog.paidAmountGreaterThanDue', msg: ['dialog.extraAmountSetAsTip', extra],
                    buttons: [{ text: 'button.cancel', fn: 'reject' }, { text: 'button.setTip', fn: 'resolve' }]
                }).then(() => {
                    this.payment.tip = this.tip = extra;
                    this.payment.total = (parseFloat(this.payment.subtotal) + parseFloat(this.payment.tax) + parseFloat(this.payment.tip) + parseFloat(this.payment.gratuity)).toFixed(2);
                    this.payment.due = (parseFloat(this.payment.total) - parseFloat(this.payment.discount)).toFixed(2)
                    this.paid = (parseFloat(this.payment.due) - parseFloat(this.payment.paid)).toFixed(2);
                    let amount = (this.paid - extra).toFixed(2);
                    let tip = extra.toFixed(2);
                    this.processing({ amount, tip });
                }).catch(() => {
                    this.processing();
                })
            } else {
                this.processing();
            }
        },
        processing(trans) {
            let card;
            if (trans) {
                card = Object.assign({}, {
                    creditCard: this.creditCard,
                    amount: trans.amount,
                    tip: trans.tip
                })
            } else {
                card = Object.assign({}, {
                    creditCard: this.creditCard,
                    amount: this.paid,
                    tip: this.tip
                })
            }

            new Promise((resolve, reject) => {
                this.componentData = { card, resolve, reject };
                this.component = "CreditCard";
            }).then((data) => { this.creditAccept(data) }).catch((reason) => { this.creditReject(reason) });
        },
        chargeGift() {
            if (parseFloat(this.paid) === 0) return;
            if (this.paid > this.payment.due) this.paid = (parseFloat(this.payment.due) - parseFloat(this.payment.paid)).toFixed(2);
            if (this.giftCard.balance < this.paid) this.paid = this.giftCard.balance;

            this.payment.paid += parseFloat(this.paid);

            let change = this.payment.change = Math.max(0, (this.paid - this.payment.balance)).toFixed(2);
            let balance = this.payment.balance = Math.max(0, (this.payment.due - this.payment.paid)).toFixed(2);
            let paid = parseFloat(this.paid);

            let { _id, number, type } = this.order;
            let log = {
                balance: this.giftCard.balance - paid,
                change: -paid,
                date: today(),
                time: +new Date,
                type: 'Purchase',
                cashier: this.op.name,
                number: this.giftCard.number,
                order: { _id, number: number || this.ticket.number, type, time: +new Date }
            }

            this.$socket.emit("[GIFTCARD] ACTIVITY", log, (_id) => {
                this.payment.log.push({
                    type: "GIFT",
                    paid: this.paid,
                    change: 0,
                    balance: balance.toFixed(2),
                    _id
                })

                if (this.giftCard.balance > this.paid) {
                    this.poleDisplay("Paid Gift Card", "Thank You");
                    this.payment.settled = true;
                    this.invoicePaid(this.paid, 0, 'GIFT');
                } else {
                    this.poleDisplay("Paid Gift Card", ["Due:", balance.toFixed(2)]);
                    this.$socket.emit("[GIFTCARD] QUERY", this.giftCard.number, card => {
                        this.giftCard = card;
                        this.payRemainBalance();
                    })
                }
            })
        },
        creditAccept(trans) {
            this.payment.paid += parseFloat(trans.amount.approve);
            this.payment.balance = Math.max(0, (this.payment.due - this.payment.paid)).toFixed(2);
            this.payment.log.push({
                id: trans.unique,
                type: "CREDIT",
                paid: trans.amount.approve,
                change: "0.00",
                balance: this.payment.balance,
                number: trans.account.number
            });
            Object.assign(trans, { order: this.assignOrder() });
            if (this.payment.tip > 0) {
                trans.amount.approve = (trans.amount.approve - trans.amount.tip).toFixed(2);
            }
            this.$socket.emit("[TERM] SAVE_TRANSACTION", trans);
            Printer.printCreditCard(trans);
            if (parseFloat(this.payment.balance) === 0) {
                this.payment.settled = true;
                this.poleDisplay("PAID by Credit Card", "Thank You");
                this.invoicePaid(trans.amount.approve, 0, "CREDIT")
            } else {
                this.$q();
                this.getQuickInput(this.payment.balance);
                this.paid = this.payment.balance;
            }
        },
        creditReject(reason) {
            reason ? this.askSettleType(reason) : this.$q();
        },
        askSettleType(content) {
            this.$dialog(content).then(() => {
                new Promise((resolve, reject) => {
                    this.componentData = { resolve, reject, callback: true };
                    this.component = 'paymentMark'
                }).then(type => {
                    this.$q()
                    this.payment.balance = "0.00";
                    this.payment.log.push({
                        id: "",
                        type,
                        paid: this.paid,
                        change: "0.00",
                        balance: "0.00",
                        number: 'N/A'
                    })
                    this.invoicePaid(this.payment.due, 0, type)
                }).catch(() => { this.$q() })
            }).catch(() => { this.$q() })
        },
        swipeGiftCard() {
            new Promise((resolve, reject) => {
                this.componentData = { resolve, reject };
                this.component = "capture";
            }).then(query => {
                this.$q()
                query.result ?
                    this.giftCard = query.result :
                    this.activationRequired(query.number);
            }).catch(() => { this.$q() })
        },
        activationRequired(number) {
            this.$dialog({
                title: 'dialog.giftCardActivation',
                msg: 'dialog.giftCardActivationTip',
                buttons: [{ text: 'button.cancel', fn: 'reject' }, { text: 'button.confirm', fn: 'resolve' }]
            }).then(() => {
                this.activateGiftCard(number);
            }).catch(() => { this.$q() })
        },
        activateGiftCard(number) {
            new Promise((resolve, reject) => {
                let activation = true;
                this.componentData = { resolve, reject, number };
                this.component = "Loader";
            }).then((value) => {
                this.$q()
                let card = {
                    number,
                    date: today(),
                    time: +new Date,
                    cashier: this.op.name,
                    balance: value,
                    activation: +new Date,
                    transaction: 1
                }
                this.$socket.emit("[GIFTCARD] ACTIVATION", card, (result) => {
                    this.giftCard = result;
                    this.recordCashDrawerAction(value, 0);
                    Printer.printGiftCard('Activation', result)
                })
            }).catch(() => { this.$q() })
        },
        assignOrder() {
            return this.ticket.type === 'DINE_IN' ?
                {
                    _id: this.order._id,
                    type: this.order.hasOwnProperty("type") ? this.order.type : this.ticket.type,
                    number: this.order.hasOwnProperty("number") ? this.order.number : this.ticket.number,
                    cashier: this.order.hasOwnProperty("cashier") ? this.order.cashier : this.op.name,
                    server: this.order.hasOwnProperty("server") ? this.order.server : this.op.name,
                } : {
                    _id: this.order._id,
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
                let { subtotal, tax, tip, discount, gratuity, delivery, paid } = this.payment;
                let due = parseFloat(subtotal) + parseFloat(tax) + parseFloat(tip) + parseFloat(gratuity) + parseFloat(delivery) - parseFloat(discount);

                paid = isNumber(paid) ? parseFloat(paid) : 0;

                this.payment = Object.assign({}, this.payment, {
                    tip: parseFloat(result.tip),
                    gratuity: parseFloat(result.gratuity),
                    due, balance: due - paid
                });
                this.tip = result.tip;
                this.payment.type === 'CREDIT' && (this.paid = due)
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
                let { subtotal, tax, tip, gratuity, delivery, paid } = this.payment;
                let due = parseFloat(subtotal) + parseFloat(tax) + parseFloat(tip) + parseFloat(gratuity) + parseFloat(delivery) - parseFloat(result.discount);

                paid = isNumber(paid) ? parseFloat(paid) : 0;

                if (result.coupon) {
                    this.setOrder({ coupon: result.coupon })
                    Object.assign(this.order, { coupon: result.coupon })
                } else {
                    this.setOrder({ coupon: null })
                    Object.assign(this.order, { coupon: null })
                }

                this.payment = Object.assign({}, this.payment, {
                    discount: parseFloat(result.discount),
                    due, balance: due - paid
                });

                this.getQuickInput(due);
                this.poleDisplay(["Discount:", -result.discount.toFixed(2)], ["Total:", due.toFixed(2)]);
                this.$q();
            }).catch(() => { this.$q() });
        },
        reload() {
            if (!this.giftCard._id) return;
            let { number, balance } = this.giftCard;
            new Promise((resolve, reject) => {
                this.componentData = { resolve, reject, number, balance };
                this.component = 'loader';
            }).then((value) => {
                this.$q()

                let detail = {
                    balance: balance + value,
                    change: value,
                    date: today(),
                    time: +new Date,
                    type: 'Reload',
                    cashier: this.op.name,
                    number
                }

                this.$socket.emit("[GIFTCARD] RELOAD", detail, (card) => {
                    this.giftCard = card;
                    Printer.printGiftCard('Reload', this.giftCard)
                })
            }).catch(() => {
                this.$q()
            })
        },
        cashOut() {
            if (parseFloat(this.giftCard.balance) === 0) return;
            this.$dialog({
                type: "question", title: "dialog.cashingOutConfirm", msg: ["dialog.cashOutConfirmTip", this.giftCard.balance.toFixed(2)]
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
                this.$dialog({
                    title: ['dialog.withdraw', money.toFixed(2)], msg: "dialog.withdrawTip",
                    buttons: [{ text: 'button.confirm', fn: 'resolve' }]
                }).then(() => {
                    this.$socket.emit("[GIFTCARD] CARD_ADJUST_VALUE", { _id: this.giftCard._id, value, activity });
                    this.giftCard.balance = 0;
                    Printer.printGiftCard("cashout", this.giftCard)
                    this.$q();
                })
            }).catch(() => { this.$q() })
        },
        printBalance() {
            if (!this.giftCard._id) return;
            this.poleDisplay("Gift Card Balance:", ["", this.giftCard.balance.toFixed(2)])
            Printer.printGiftCard("Balance", this.giftCard);
        },
        // activateGiftCard(number) {
        //     new Promise((resolve, reject) => {
        //         let title = "text.initialAmount";
        //         this.componentData = { title, resolve, reject };
        //         this.component = "Inputter"
        //     }).then((initialAmount) => {
        //         this.recordCashDrawerAction(parseFloat(initialAmount), 0);
        //         let card = Preset.giftCard(number, this.op.name, initialAmount, 0);
        //         if (this.customer._id) {
        //             card = Object.assign(card, { customer: this.customer._id })
        //         }
        //         this.giftCard = card;
        //         this.$socket.emit("[GIFTCARD] CARD_ACTIVATION", card);
        //         Printer.printGiftCard("activation", card)
        //         this.$q()
        //     }).catch(() => { this.$q() })
        // },
        setQuickInput(value) {
            this.paid = value.toFixed(2);
        },
        invoicePaid(paid, change, type) {
            let order = JSON.parse(JSON.stringify(this.order));
            let customer = Object.assign({}, this.customer);
            let paidCash = 0, paidCredit = 0, paidGift = 0;
            Object.assign(this.payment, { settled: true, type });
            delete customer.extra;
            this.isNewTicket ?
                Object.assign(order, {
                    payment: this.payment,
                    customer,
                    type: this.ticket.type,
                    number: this.ticket.number,
                    station: this.station.alies,
                    cashier: this.op.name,
                    source: "POS",
                    modify: 0,
                    status: 1,
                    date: today(),
                    time: +new Date(),
                    settled: true,
                    print: true
                }) : Object.assign(order, {
                    payment: this.payment,
                    cashier: this.op.name,
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
            if (this.payInFull) {
                this.isNewTicket ?
                    this.$socket.emit("[SAVE] INVOICE", order) : this.$socket.emit("[UPDATE] INVOICE", order);

                type === 'CASH' ?
                    this.$dialog({
                        title: ["dialog.cashChange", change], msg: ["dialog.cashChangeTip", paid.toFixed(2)],
                        buttons: [{ text: 'button.noReceipt', fn: 'reject' }, { text: 'button.printReceipt', fn: 'resolve' }]
                    }).then(() => { this.invoiceSettled(order, true) }).catch(() => { this.invoiceSettled(order, false) }) :
                    this.$dialog({
                        type: "question", title: "dialog.printReceiptConfirm", msg: "dialog.printReceiptConfirmTip",
                        buttons: [{ text: 'button.noReceipt', fn: 'reject' }, { text: 'button.printReceipt', fn: 'resolve' }]
                    }).then(() => { this.invoiceSettled(order, true) }).catch(() => { this.invoiceSettled(order, false) })
            } else {
                //invoice not save here
                this.payment.settled = true;
                order.splitPayment[this.current] = this.payment;
                Object.assign(this.order, order);

                // this.isNewTicket ?
                //     this.$socket.emit("[SAVE] INVOICE", order) : this.$socket.emit("[UPDATE] INVOICE", order);

                type === 'CASH' ?
                    this.$dialog({
                        title: ["dialog.cashChange", change], msg: ["dialog.cashChangeTip", paid.toFixed(2)],
                        buttons: [{ text: 'button.noReceipt', fn: 'reject' }, { text: 'button.printReceipt', fn: 'resolve' }]
                    }).then(() => { this.printSplitReceipt() }).catch(() => { this.nextSplit() }) :
                    this.$dialog({
                        type: "question", title: "dialog.printReceiptConfirm", msg: "dialog.printReceiptConfirmTip",
                        buttons: [{ text: 'button.noReceipt', fn: 'reject' }, { text: 'button.printReceipt', fn: 'resolve' }]
                    }).then(() => { this.printSplitReceipt() }).catch(() => { this.nextSplit() });
            }
        },
        printSplitReceipt() {
            let index = this.current + 1;
            let order = JSON.parse(JSON.stringify(this.order));
            order.number = order.number + '-' + index;
            order.payment = order.splitPayment[this.current];
            order.cashier = this.op.name;
            order.customer = this.customer;
            order.content = order.content.filter(item => item.sort === index);
            this.isNewTicket ? Printer.setTarget('All').print(order, true) : Printer.setTarget('Receipt').print(order, true);
            order.content.filter(item => item.sort === this.payment.sort).forEach(item => {
                delete item.new;
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
            index === -1 ? this.saveSplitPayment() && this.exit() : this.switchInvoice(index);
        },
        saveSplitPayment() {
            let customer = Object.assign({}, this.customer);
            let payment = this.combineSplitPayment();
            let settled = this.payment.settled;
            delete customer.extra;
            switch (this.$route.name) {
                case "Menu":
                    if (this.app.mode === 'create') {
                        Object.assign(this.order, {
                            customer,
                            payment,
                            type: this.ticket.type,
                            number: this.ticket.number,
                            station: this.station.alies,
                            cashier: this.op.name,
                            source: "POS",
                            modify: 0,
                            status: 1,
                            settled,
                            time: +new Date,
                            date: today()
                        })
                        this.$socket.emit("[SAVE] INVOICE", this.order)
                    } else {
                        Object.assign(this.order, {
                            lastEdit: +new Date,
                            editor: this.op.name,
                            modify: this.order.modify + 1,
                            cashier: this.op.name,
                            payment, settled
                        })
                        this.$socket.emit("[UPDATE] INVOICE", this.order)
                    }

                    this.resetAll();
                    this.$router.push({ path: "/main" });
                    break;
                case "Table":
                    Object.assign(this.order, { cashier: this.op.name, payment, settled });
                    this.$socket.emit("[UPDATE] INVOICE", this.order);
                    this.init.resolve();
                    break;
                case "History":
                    Object.assign(this.order, { cashier: this.op.name, payment, settled });
                    this.$socket.emit("[UPDATE] INVOICE", this.order);
                    this.init.resolve();
                    break;
            }
            return true
        },
        combineSplitPayment() {
            let payment = { tip: 0, gratuity: 0, discount: 0, delivery: 0, subtotal: 0, tax: 0, total: 0, paid: 0, due: 0, log: [], paidCash: 0, paidCredit: 0, paidGift: 0, settled: true, type: 'MULTIPLE' };
            this.order.splitPayment.forEach((split) => {
                payment.tip += parseFloat(split.tip);
                payment.gratuity += parseFloat(split.gratuity);
                payment.discount += parseFloat(split.discount);
                payment.delivery += parseFloat(split.delivery);
                payment.subtotal += parseFloat(split.subtotal);
                payment.tax += parseFloat(split.tax);
                payment.total += parseFloat(split.total);
                payment.paid += parseFloat(split.paid);
                payment.due += parseFloat(split.due);
                payment.log.push(...split.log);
                !split.settled && (payment.settled = false);
                split.hasOwnProperty('paidCash') && (payment.paidCash += parseFloat(split.paidCash));
                split.hasOwnProperty('paidCredit') && (payment.paidCredit += parseFloat(split.paidCredit));
                split.hasOwnProperty('paidGift') && (payment.paidGift += parseFloat(split.paidGift));
            })
            return payment
        },
        savePayment() {
            if (this.payInFull) {
                let order = Object.assign({}, this.order, { cashier: this.op.name, payment: this.payment })
                order.settled = !!this.payment.settled;
                this.setOrder(order);
                (this.$route.name === 'History' || this.$route.name === 'Table') && this.$socket.emit("[UPDATE] INVOICE", order);
                this.exit()
            } else {
                let payment = this.combineSplitPayment();
                let order = Object.assign({}, this.order, { payment });
                order.settled = !!payment.settled;
                this.setOrder(order);
                (this.$route.name === 'History' || this.$route.name === 'Table') && this.$socket.emit("[UPDATE] INVOICE", order);
                this.init.resolve();
            }
        },
        invoiceSettled(ticket, print) {
            if (print) {
                this.isNewTicket ?
                    Printer.setTarget('All').print(ticket, true) :
                    Printer.setTarget('Receipt').print(ticket, true);

                ticket.content.forEach(item => {
                    delete item.new;
                    item.print = true;
                    item.pending = false;
                })
            }

            this.$socket.emit("[UPDATE] INVOICE", ticket);

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
                    this.resetMenu();
                    this.init.resolve();
                    break;
                case "PickupList":
                    this.init.resolve();
                    break;
                default:
                    this.init.resolve();
            }
        },
        recordCashDrawerAction(inflow, outflow) {
            let activity = {
                type: "CASHFLOW",
                inflow: parseFloat(inflow),
                outflow: parseFloat(outflow),
                time: +new Date,
                ticket: this.ticket,
                operator: this.op.name
            }
            switch (this.op.cashCtrl) {
                case "enable":
                    this.station.cashDrawer.enable ?
                        Printer.openCashDrawer() :
                        this.cashDrawerUnavailable();
                    this.$socket.emit("[CASHFLOW] ACTIVITY", { cashDrawer: this.station.cashDrawer.name, activity });
                    break;
                case "staffBank":
                    this.$socket.emit("[CASHFLOW] ACTIVITY", { cashDrawer: this.op.name, activity });
                    break;
                case "disable":
                default:
            }
        },
        cashDrawerUnavailable() {
            this.$dialog({
                title: "dialog.cashDrawerUnavailable", msg: "dialog.cashDrawerUnavailableTip",
                buttons: [{ text: 'button.confirm', fn: 'resolve' }]
            }).then(() => { this.$q() });
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
            let preset = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 60, 70, 80, 100, 120, 140, 150, 200, 300, 350, 400, 450, 500, 600, 700, 800, 900, 1000, 1100, 1500, 2000, 3000, 4000, 5000];
            let array = [];
            let round = Math.ceil(isNumber(amount) ? amount : 0);
            array.push(amount.toFixed(2));
            amount === round ? array.push((round + 1)) : array.push(round);
            let index = preset.findIndex(i => i > round);
            array.push(preset.slice(index, index + 6));
            this.quickInput = [].concat.apply([], array);
        },
        poleDisplay(line1, line2) {
            if (!this.device.poleDisplay) return;
            poleDisplay.write('\f');
            poleDisplay.write(line(line1, line2));
        },
        exit(payment) {
            this.init.resolve(payment)
        },
        ...mapActions(['setOrder', 'resetMenu', 'resetAll', 'setTableInfo', 'resetCurrentTable'])
    },
    computed: {
        isNewTicket() {
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
        ...mapGetters(['op', 'app', 'config', 'ticket', 'store', 'device', 'tables', 'station', 'customer', 'currentTable'])
    },
    watch: {
        'giftCard.number'(n) {
            n && n.replace(/[^0-9]/g, '').length === 16 && this.$socket.emit("[GIFTCARD] QUERY_CARD", n.replace(/[^0-9]/g, ''));
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

.type label {
    display: block;
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

.type input:checked+label {
    background: #66bb6a;
    color: #fafafa;
    border: 2px solid #009688;
    text-shadow: 0 2px 1px rgba(0, 0, 0, .5);
    box-shadow: 0 1px 2px rgba(0, 0, 0, .3);
}

.type input:checked+label:before {
    position: absolute;
    content: ' ';
    width: 23px;
    height: 15px;
    background: #009688;
    bottom: 0;
    right: 0;
    border-top-left-radius: 4px;
}

.type input:checked+label:after {
    position: absolute;
    content: '\f00c';
    font-family: fontAwesome;
    bottom: -17px;
    right: 3px;
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

.delay {
    animation-delay: 0.3s;
}
</style>