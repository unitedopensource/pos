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
                            <div class="addition" v-show="payment.tip !== 0">
                                <span class="text">{{$t('text.tip')}}</span>
                                <span class="value">+{{payment.tip | decimal}}</span>
                            </div>
                            <div class="addition" v-show="payment.gratuity !== 0">
                                <span class="text">{{$t('text.gratuity')}}</span>
                                <span class="value">+{{payment.gratuity | decimal}}</span>
                            </div>
                        </div>
                    </div>
                    <div class="extra">
                        <div class="btn" @click="setTips">{{$t('button.setTip')}}</div>
                        <div class="btn" @click="setDiscount">{{$t('button.setDiscount')}}</div>
                        <div class="btn" @click="savePayment">{{$t('button.save')}}</div>
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
import CreditCard from './creditCard'
import Printer from '../../print'
import Discount from './discount'
import ThirdParty from './mark'
import Tips from './tips'
export default {
    props: ['init'],
    components: { Dialoger, Discount, CreditCard, GiftCard, Tips, ThirdParty },
    data() {
        return {
            releaseComponentLock: true,
            componentData: null,
            component: null,
            quickInput: [],
            payment: null,
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
    computed: {
        ...mapGetters([])
    },
    created() {
        this.initialData();
        this.checkComponentUsage();
        this.setPaymentType('CASH');
    },
    beforeDestroy() {
        this.releaseComponentLock && this.$socket.emit('[COMPONENT] UNLOCK', { component: 'payment', lock: this.order._id })
    },
    methods: {
        initialData() {
            this.order = JSON.parse(JSON.stringify(this.$store.getters.order));
            this.payment = Object.assign(this.order.payment, { type: 'CASH' });
            this.payment.balance = Math.max(0, (this.payment.due - this.payment.paid));
            this.getQuickInput(this.payment.balance);
        },
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
                        this.order.split ? this.askPayMode() : this.display();
                }
            })
        },
        setPaymentType(type) {
            this.payment.type = type;
            switch (type) {
                case 'CASH':
                    this.paid = '0.00';
                    this.tip = '0.00';
                    this.reset = true;
                    break;
                case 'CREDIT':
                    this.paid = (this.payment.due - this.payment.paid).toFixed(2)
                    this.tip = this.payment.tip;
                    this.reset = true;
                    break;
                case 'GIFT':
                    new Promise((resolve, reject) => {
                        this.componentData = { resolve, reject, payment: this.payment }
                        this.component = 'GiftCard'
                    }).then(() => { this.init.resolve() }).catch(() => {
                        this.setPaymentType('CASH')
                        this.$q()
                    })
                    break;
            }
        },
        setInput() {
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
        clearGift() {
            this.giftCard.number = "";
            this.giftCard.balance = "0.00";
        },
        clearCredit() {
            switch (this.anchor) {
                case "number":
                case "date":
                    this.creditCard[this.anchor] = "";
                    break;
                case "tip":
                    this.payment.tip = this.tip = '0.00'
                    break;
                default:
                    this.paid = "0.00"
            }
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
                let extra = this.paid - this.payment.due;
                this.$dialog({
                    title: 'dialog.paidAmountGreaterThanDue', msg: ['dialog.extraAmountSetAsTip', extra],
                    buttons: [{ text: 'button.cancel', fn: 'reject' }, { text: 'button.setTip', fn: 'resolve' }]
                }).then(() => {
                    this.paid = (parseFloat(this.payment.due) - parseFloat(this.payment.paid)).toFixed(2);
                    this.payment.tip = this.tip = extra.toFixed(2)
                    this.processing();
                }).catch(() => {
                    this.processing();
                })
            } else {
                this.processing();
            }
        },
        processing() {
            let card = Object.assign({}, {
                creditCard: this.creditCard,
                amount: this.paid,
                tip: this.tip
            });

            new Promise((resolve, reject) => {
                this.componentData = { card, resolve, reject };
                this.component = "CreditCard";
            }).then((data) => { this.creditAccept(data) }).catch((reason) => { this.creditReject(reason) });
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
            this.$socket.emit("[TERM] SAVE_TRANSACTION", trans);
            Printer.init(this.config).setJob("creditCard").print(trans);
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
        poleDisplay(line1, line2) {
            if (!this.device.poleDisplay) return;
            poleDisplay.write('\f');
            poleDisplay.write(line(line1, line2));
        },
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