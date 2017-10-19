<template>
    <div class="popupMask center dark">
        <transition-group name="payment" mode="out-in" appear>
            <div class="window" v-show="!component" :key="0">
                <header class="title">
                    <span>{{$t('title.payment')}}</span>
                    <div v-if="!payInFull && order.hasOwnProperty('splitPayment')" class="viewer">
                        <label v-for="(split,index) in order.splitPayment" :key="index">
                            <input type="radio" name="split" :id="'split_'+index" :value="index" v-model="current" @change="switchInvoice(index)">
                            <label :for="'split_'+index" class="tag">#{{index + 1}}</label>
                            <div class="preview" @click="preview(index)">
                                <i class="fa fa-wpforms"></i>
                                <span>{{$t('text.preview')}}</span>
                            </div>
                        </label>
                    </div>
                    <i class="fa fa-times" @click="init.reject(false)"></i>
                </header>
                <nav>
                    <div class="paymentTypes">
                        <div class="type">
                            <input type="radio" v-model="paymentType" name="paymentType" value="CASH" id="CASH" @change="setPaymentType('CASH')">
                            <label for="CASH">{{$t('type.CASH')}}</label>
                        </div>
                        <div class="type" v-if="!thirdPartyPayment">
                            <input type="radio" v-model="paymentType" name="paymentType" value="CREDIT" id="CREDIT" @change="setPaymentType('CREDIT')">
                            <label for="CREDIT">{{$t('type.CREDIT')}}</label>
                        </div>
                        <div class="type" v-else>
                            <input type="radio" v-model="paymentType" name="paymentType" value="THIRD" id="THIRD" @change="setPaymentType('THIRD')">
                            <label for="THIRD">{{$t('type.THIRD')}}</label>
                        </div>
                        <div class="type">
                            <input type="radio" v-model="paymentType" name="paymentType" value="GIFT" id="GIFT" @change="setPaymentType('GIFT')">
                            <label for="GIFT">{{$t('type.GIFT')}}</label>
                        </div>
                    </div>
                    <div class="balanceDue" @dblclick="roundUp">
                        <span class="for">{{$t('text.balanceDue')}}:</span>
                        <div class="inner">
                            <span class="due">
                                <span class="symbol">$</span>{{payment.remain | decimal}}</span>
                            <div class="addition" v-show="payment.discount > 0">
                                <span class="text">{{$t('text.discount')}}</span>
                                <span class="value">-{{payment.discount | decimal}}</span>
                            </div>
                            <div class="addition" v-show="payment.tip > 0">
                                <span class="text">{{$t('text.tip')}}</span>
                                <span class="value">+{{payment.tip | decimal}}</span>
                            </div>
                            <div class="addition" v-show="payment.gratuity > 0">
                                <span class="text">{{$t('text.gratuity')}}</span>
                                <span class="value">+{{payment.gratuity | decimal}}</span>
                            </div>
                        </div>
                    </div>
                    <div class="fn">
                        <button class="btn" @click="setTip">{{$t('button.setTip')}}</button>
                        <button class="btn" @click="setDiscount" :disabled="!discountable">{{$t('button.setDiscount')}}</button>
                        <button class="btn" @click="save">{{$t('button.save')}}</button>
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
                        <div @click="input('00')" class="double">00</div>
                    </section>
                    <section class="field">
                        <template v-if="paymentType === 'CASH'">
                            <div class="inputs">
                                <div class="input" @click="setAnchor($event)" data-anchor="paid" data-format="money">
                                    <span class="text">{{$t('text.paid')}}</span>
                                    <span class="value">{{paid}}</span>
                                </div>
                                <div class="input" @click="setAnchor($event)" data-anchor="tip" data-format="money">
                                    <span class="text">{{$t('text.tip')}}</span>
                                    <span class="value">{{tip}}</span>
                                </div>

                            </div>
                            <aside class="numpad">
                                <div @click="del">&#8592;</div>
                                <div @click="clear">C</div>
                                <div @click="charge">&#8626;</div>
                            </aside>
                        </template>
                        <template v-else-if="paymentType === 'CREDIT'">
                            <div class="inputs">
                                <div class="input" @click="setAnchor($event)" data-anchor="paid" data-format="money">
                                    <span class="text">{{$t('text.paid')}}</span>
                                    <span class="value">{{paid}}</span>
                                </div>
                                <div class="input" @click="setAnchor($event)" data-anchor="tip" data-format="money">
                                    <span class="text">{{$t('text.tip')}}</span>
                                    <span class="value">{{tip}}</span>
                                </div>
                                <div class="input">

                                </div>
                            </div>
                            <aside class="numpad">
                                <div @click="del">&#8592;</div>
                                <div @click="clear">C</div>
                                <div @click="charge">&#8626;</div>
                            </aside>
                        </template>
                        <template v-else-if="paymentType === 'THIRD'">
                            <div class="inputs">
                                <div class="input" @click="setAnchor($event)" data-anchor="paid" data-format="money">
                                    <span class="text">{{$t('text.paid')}}</span>
                                    <span class="value">{{paid}}</span>
                                </div>
                                <div class="input" @click="setAnchor($event)" data-anchor="tip" data-format="money">
                                    <span class="text">{{$t('text.tip')}}</span>
                                    <span class="value">{{tip}}</span>
                                </div>
                                <div class="options">
                                    <div class="type">
                                        <input type="radio" v-model="thirdPartyType" value="Visa" id="Visa">
                                        <label for="Visa">Visa</label>
                                    </div>
                                    <div class="type">
                                        <input type="radio" v-model="thirdPartyType" value="Master" id="Master">
                                        <label for="Master">Master</label>
                                    </div>
                                    <div class="type">
                                        <input type="radio" v-model="thirdPartyType" value="Discover" id="Discover">
                                        <label for="Discover">Discover</label>
                                    </div>
                                    <div class="type">
                                        <input type="radio" v-model="thirdPartyType" value="AE" id="AE">
                                        <label for="AE">AE</label>
                                    </div>
                                    <div class="type">
                                        <input type="radio" v-model="thirdPartyType" value="GrubHub" id="GrubHub">
                                        <label for="GrubHub">GrubHub</label>
                                    </div>
                                    <div class="type">
                                        <input type="radio" v-model="thirdPartyType" value="Eat 24" id="Eat">
                                        <label for="Eat">Eat 24</label>
                                    </div>
                                </div>
                            </div>
                            <aside class="numpad">
                                <div @click="del">&#8592;</div>
                                <div @click="clear">C</div>
                                <div @click="charge">&#8626;</div>
                            </aside>
                        </template>
                        <template v-else>
                            <div class="inputs">
                                <div class="input" @click="setAnchor($event)" data-anchor="paid" data-format="money">
                                    <span class="text">{{$t('text.paid')}}</span>
                                    <span class="value">{{paid}}</span>
                                </div>
                                <div class="input" @click="setAnchor($event)" data-anchor="tip" data-format="money">
                                    <span class="text">{{$t('text.tip')}}</span>
                                    <span class="value">{{tip}}</span>
                                </div>
                                <div class="input">

                                </div>
                            </div>
                            <aside class="numpad">
                                <div @click="del">&#8592;</div>
                                <div @click="clear">C</div>
                                <div @click="charge">&#8626;</div>
                            </aside>
                        </template>
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
import dialoger from '../common/dialoger'
import ticket from '../common/ticket'
import discount from './discount'
import tips from './tips'
export default {
    props: ['init'],
    components: { dialoger, tips, discount, ticket },
    computed: {
        ...mapGetters(['op', 'device', 'station'])
    },
    data() {
        return {
            releaseComponentLock: true,
            componentData: null,
            component: null,
            discountable: false,
            order: null,
            thirdPartyPayment: true,
            thirdPartyType: null,
            paymentType: 'CASH',
            payInFull: true,
            quickInput: [],
            current: 0,
            reset: true,
            paid: '0.00',
            tip: '0.00'
        }
    },
    created() {
        this.initial()
            .then(this.checkComponentUsage)
            .then(this.checkPermission)
            .then(this.checkSplit)
            .catch((err) => {
                this.initialFailed(err);
            })
    },
    mounted() {
        this.setPaymentType('CASH')
    },
    beforeDestroy() {
        this.releaseComponentLock && this.$socket.emit('[COMPONENT] UNLOCK', { component: 'payment', lock: this.order._id })
    },
    methods: {
        initial() {
            return new Promise((resolve) => {
                this.order = this.init.hasOwnProperty('order') ?
                    JSON.parse(JSON.stringify(this.init.order)) :
                    JSON.parse(JSON.stringify(this.$store.getters.order));

                this.payment = this.order.payment;
                this.thirdPartyPayment = !this.station.terminal.enable;
                resolve()
            })
        },
        checkComponentUsage() {
            return new Promise((resolve, reject) => {
                let data = {
                    component: 'payment',
                    operator: this.op.name,
                    lock: this.order._id,
                    time: +new Date,
                    exp: +new Date + 1000 * 120
                }
                this.$socket.emit('[COMPONENT] LOCK', data, lock => {
                    lock ? reject({ error: 'paymentPending', data }) : resolve();
                })
            })
        },
        checkPermission() {
            return new Promise((resolve, reject) => {
                this.discountable = this.op.modify.includes('discount');
                this.op.cashCtrl === 'disable' ? reject({ error: 'accessDenied' }) : resolve()
            })
        },
        checkSplit() {
            this.order.split ? this.askPayMode() : this.initialized();
        },
        askPayMode() {
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
        },
        paySplit() {
            this.payInFull = false;
            this.switchInvoice(this.order.splitPayment.findIndex(payment => !payment.settled));
            this.initialized();
        },
        payWhole() {
            //let paid = 0;
            //this.payment.log.forEach(log => { paid += toFixed(log.paid - log.change, 2) });
            let paid = this.payment.log.map(log => log.paid - log.change).reduce((a, b) => a + b, 2);
            this.payment.remain = Math.max(0, (this.payment.balance - toFixed(paid, 2)));
            this.initialized();
        },
        initialized() {
            this.getQuickInput(this.payment.remain);
            this.poleDisplay(["Balance Due:", ""], ["", this.payment.remain.toFixed(2)]);
        },
        initialFailed(reason) {
            let { error, data } = reason;
            switch (error) {
                case 'paymentPending':
                    let current = +new Date;
                    let exp = data.exp;
                    let duration = exp - current;

                    this.releaseComponentLock = false;

                    this.$dialog({
                        title: 'dialog.pending',
                        msg: 'dialog.pendingOrderAccessDenied',
                        timeout: { duration, fn: 'resolve' },
                        buttons: [{ text: 'button.confirm', fn: 'resolve' }]
                    }).then(() => { this.quit() })
                    break;
                case 'accessDenied':
                    this.$dialog({
                        type: 'warning',
                        title: 'dialog.accessDenied',
                        msg: 'dialog.accessDeniedTip',
                        timeout: { duration: 10000, fn: 'resolve' },
                        buttons: [{ text: 'button.confirm', fn: 'resolve' }]
                    }).then(() => { this.quit() })
                    break;
            }
        },
        setAnchor(target) {
            let dom = document.querySelector('.input.active');
            dom && dom.classList.remove('active');
            if (target instanceof Event) {
                target.currentTarget.classList.add('active');
                target.currentTarget.dataset.anchor === 'tip' ? this.getQuickTip(this.payment.remain) : this.getQuickInput(this.payment.remain)
            } else {
                document.querySelector(`[data-anchor="${target}"]`).classList.add("active");
            }

            this.reset = true;
        },
        del() {
            let { anchor, format } = document.querySelector('.input.active').dataset;
            let val = this[anchor];

            switch (format) {
                case 'money':
                    this[anchor] = (val.slice(0, -1) / 10).toFixed(2);
                    break;
                case 'number':
                    this[anchor] = val.length > 0 ? val.slice(0, -1) : val;
                    break;
            }
        },
        clear() {
            let { anchor, format } = document.querySelector('.input.active').dataset;

            switch (format) {
                case 'money':
                    this[anchor] = '0.00';
                    break;
                case 'number':
                    this[anchor] = '';
                    break;
            }
            this.reset = true;
        },
        charge() {
            switch (this.paymentType) {
                case 'CASH':
                    this.checkCashDrawer()
                        .then(this.chargeCash)
                        .then(this.tenderCash)
                        .then(this.saveTransaction)
                        .then(this.askReceipt)
                        .then(this.checkBalance)
                        .catch(this.payFailed)
                    break;
                case 'CREDIT':
                    this.checkOverPay()
                        .then(this.checkTerminal)
                        .then(this.chargeCreditCard)
                        .then(this.saveTransaction)
                        .then(this.askReceipt)
                        .then(this.checkBalance)
                        .catch(this.payFailed)
                    break;
                case 'THIRD':
                    this.checkOverPay()
                        .then(this.chargeThirdParty)
                        .then(this.saveTransaction)
                        .then(this.askReceipt)
                        .then(this.checkBalance)
                        .catch(this.payFailed)
                    break;
                case 'GIFT':
                    this.checkOverPay()
                        .then(this.swipeGiftCard)
                        .then(this.chargeGiftCard)
                        .then(this.saveTransaction)
                        .then(this.askReceipt)
                        .then(this.checkBalance)
                        .catch(this.payFailed)
                    break;
            }
        },
        payFailed(error) {
            this.$dialog(error).then(() => { this.$q() })
        },
        setPaymentType(type) {
            this.paymentType = type;

            switch (type) {
                case 'CASH':
                    this.paid = '0.00'
                    break;
                case 'CREDIT':
                case 'THIRD':
                    this.paid = this.payment.remain.toFixed(2);
                    this.tip = this.payment.tip.toFixed(2);
                    break;
                case 'GIFT':
                    this.paid = this.payment.remain.toFixed(2);
                    this.tip = this.payment.tip.toFixed(2);
                    break;
            }

            this.setAnchor('paid');
            this.getQuickInput(this.payment.remain)
        },
        checkOverPay() {
            return new Promise((resolve, reject) => {
                if (this.paid === '0.00') {
                    reject({
                        type: 'error',
                        title: 'dialog.paymentFailed',
                        msg: 'dialog.canNotPayZeroAmount',
                        buttons: [{ text: 'button.confirm', fn: 'resolve' }]
                    })
                } else if (this.paid > this.payment.remain) {
                    let extra = toFixed(this.paid - this.payment.remain, 2);
                    this.$dialog({
                        title: 'dialog.paidAmountGreaterThanDue', msg: ['dialog.extraAmountSetAsTip', extra.toFixed(2)],
                        buttons: [{ text: 'button.cancel', fn: 'reject' }, { text: 'button.setTip', fn: 'resolve' }]
                    }).then(() => {
                        this.paid = this.payment.remain.toFixed(2);
                        this.tip = extra.toFixed(2);
                        this.payment.tip = extra;

                        this.$q()
                        this.recalculatePayment()
                        resolve()
                    }).catch(() => {
                        this.$q()
                    })
                } else {
                    resolve()
                }
            })
        },
        chargeCash() {
            return new Promise((resolve) => {
                let paid = Math.min(this.paid, this.payment.remain);
                let change = Math.max(0, toFixed(this.paid - this.payment.remain, 2));

                this.payment.paid = toFixed(this.payment.paid + paid, 2);
                this.recalculatePayment();
                Printer.openCashDrawer();
                resolve({ type: 'CASH', paid, change })
            })
        },
        chargeCreditCard() { },
        chargeThirdParty() { },
        chargeGiftCard() { },
        checkCashDrawer() {
            return new Promise((resolve, reject) => {
                (this.station.cashDrawer.enable || this.op.cashCtrl === 'staffBank') ? resolve() :
                    reject({
                        title: "dialog.cashDrawerUnavailable",
                        msg: "dialog.cashDrawerUnavailableTip",
                        buttons: [{ text: 'button.confirm', fn: 'resolve' }]
                    })
            })
        },
        checkTerminal() {

        },
        tenderCash(detail) {
            return new Promise((resolve) => {
                let { paid, change } = detail;
                if (change > 0) {
                    this.$dialog({
                        title: ["dialog.cashChange", change.toFixed(2)],
                        msg: ["dialog.cashChangeTip", paid.toFixed(2)],
                        buttons: [{ text: 'button.confirm', fn: 'resolve' }]
                    }).then(() => {
                        this.$q()
                        resolve(detail)
                    })
                } else {
                    resolve(detail)
                }
            })
        },
        askReceipt() {
            return new Promise((resolve) => {
                let alwayAskReceipt = true;

                alwayAskReceipt ? this.$dialog({
                    type: "question",
                    title: "dialog.printReceiptConfirm",
                    msg: "dialog.printReceiptConfirmTip",
                    buttons: [{ text: 'button.noReceipt', fn: 'reject' }, { text: 'button.printReceipt', fn: 'resolve' }]
                }).then(() => {
                    Printer.setTarget("Receipt").print(this.order, true)
                    resolve()
                    this.$q()
                }).catch(() => {
                    resolve()
                    this.$q()
                }) : resolve()
            })
        },
        saveTransaction(detail) {
            return new Promise((resolve) => {
                let activity;
                let _id = ObjectId();
                let { type, paid, change, cardBin, transactionID } = detail;
                let cashDrawer = this.op.cashCtrl === 'staffBank' ? this.op.name : this.station.cashDrawer.name;

                switch (type) {
                    case 'CASH':
                        activity = {
                            _id,
                            type: "CASHFLOW",
                            inflow: parseFloat(paid),
                            outflow: parseFloat(change),
                            time: +new Date,
                            ticket: this.order.ticket,
                            operator: this.op.name
                        }
                        break;
                    case 'CREDIT':
                        activity = {
                            _id,
                            type: "CREDITFLOW",
                            inflow: parseFloat(paid),
                            outflow: parseFloat(change),
                            time: +new Date,
                            ticket: this.order.ticket,
                            cardBin, transactionID,
                            operator: this.op.name
                        }
                        break;
                    case 'GIFT':
                        activity = {
                            _id,
                            type: "GIFTFLOW",
                            inflow: parseFloat(paid),
                            outflow: parseFloat(change),
                            time: +new Date,
                            ticket: this.order.ticket,
                            operator: this.op.name
                        }
                        break;
                    default:
                }
                this.$socket.emit("[CASHFLOW] ACTIVITY", { cashDrawer, activity });
                //save this _id to order
                resolve()
            })
        },
        checkBalance() {
            //check split order as well
            //if pay in full && ticket is new
            //print set target order
            if (this.payment.remain > 0) {
                this.$q();
                this.setPaymentType('CASH')
                this.tip = '0.00';
            } else {

            }
        },
        switchInvoice(index) {
            this.current = index;
            this.payment = this.order.splitPayment[this.current];
            this.payment.remain = Math.max(0, toFixed(this.payment.balance - this.payment.paid, 2));
            this.paymentType = 'CASH';
            this.paid = "0.00";

            this.getQuickInput(this.payment.remain);
        },
        input(val) {
            let { anchor, format } = document.querySelector('.input.active').dataset;
            let value = this[anchor];

            switch (format) {
                case 'money':
                    value = this.reset ? val : (value * 100).toFixed(0) + val;
                    this[anchor] = (value / 100).toFixed(2);
                    break;
                case 'number':
                    value = this.reset ? val : value + val
                    this[anchor] = value;
                    break;
            }

            this.reset = false;
        },
        setTip() {
            new Promise((resolve, reject) => {
                this.componentData = { resolve, reject, payment: this.payment };
                this.component = 'tips';
            }).then((result) => {
                let { tip } = result;
                this.tip = tip.toFixed(2);
                this.payment.tip = tip;
                this.recalculatePayment();
                this.$q()
            }).catch(() => {
                this.$q()
            })
        },
        setDiscount() {
            new Promise((resolve, reject) => {
                this.componentData = { resolve, reject, payment: this.payment };
                this.component = 'discount';
            }).then((result) => {
                let { discount } = result;

            }).catch(() => {
                this.$q()
            })
        },
        save() { },
        preview(index) {
            let ticket = JSON.parse(JSON.stringify(this.order));
            ticket.payment = ticket.splitPayment[index];
            ticket.print = false;

            let { sort } = ticket.payment;

            ticket.content = ticket.content.filter(item => Array.isArray(item.sort) ? item.sort.includes(sort) : item.sort === sort);
            ticket.content.forEach(item => { item.print = false })

            this.$p('ticket', { ticket, exit: true })
        },
        roundUp() {
            let rounded = Math.ceil(this.payment.remain);

            this.payment.gratuity = toFixed(rounded - this.payment.remain, 2);
            this.paid = "0.00";

            this.recalculatePayment();
        },
        setQuickInput(val) {
            let { anchor } = document.querySelector('.input.active').dataset;
            anchor === 'tip' ? this.tip = val.toFixed(2) : this.paid = val.toFixed(2);

            this.reset = true;
        },
        getQuickInput(amount) {
            let preset = [1, 2, 3, 4, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 60, 70, 80, 100, 120, 140, 150, 200, 300, 350, 400, 450, 500, 600, 700, 800, 900, 1000, 1100, 1500, 2000, 3000, 4000, 5000];
            let array = [];
            let round = Math.ceil(isNumber(amount) ? toFixed(amount, 2) : 0);
            array.push(amount.toFixed(2));
            amount === round ? array.push((round + 1)) : array.push(round);
            let index = preset.findIndex(i => i > round);
            array.push(preset.slice(index, index + 6));
            this.quickInput = [].concat.apply([], array);
        },
        getQuickTip(amount) {
            let preset = [];
            let base = (Math.ceil(toFixed(amount, 2)) - amount).toFixed(2);
            preset.push(base);
            preset.push((parseFloat(base) + 1).toFixed(2));
            preset.push('1.00');
            preset.push('2.00');
            preset.push('3.00');
            preset.push('5.00');
            preset.push((amount * 0.15).toFixed(2))
            preset.push((amount * 0.20).toFixed(2))
            this.quickInput = preset;
        },
        recalculatePayment() {
            let { subtotal, tax, discount, paid, delivery, tip, gratuity } = this.payment;
            let total = toFixed(subtotal + tax, 2);
            let due = toFixed(total - discount, 2);
            let surcharge = toFixed(tip + gratuity, 2);
            let balance = toFixed(due + surcharge, 2);
            let remain = toFixed(balance - paid, 2);

            this.payment = Object.assign({}, this.payment, { total, due, surcharge, balance, remain });
            this.getQuickInput(remain)
        },
        poleDisplay() {
            if (!this.device.poleDisplay) return;
            poleDisplay.write('\f');
            poleDisplay.write(line(line1, line2));
        },
        quit() {
            this.init.reject()
        }
    },
    watch: {
        tip(n) {
            this.payment.tip = toFixed(n, 2);
            this.recalculatePayment();
            n === '0.00' && (this.paid = this.payment.remain.toFixed(2))
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

.viewer {
    display: inline-flex;
    margin-left: 10px;
}

.viewer input:checked+label {
    background: #3F51B5;
}

.viewer .tag {
    padding: 5px 15px;
    margin: 0 2px;
    cursor: pointer;
    transition: background 0.3s ease;
    border-radius: 4px;
    background: #51aef5;
}

.viewer label {
    position: relative;
}

.viewer input:checked~.preview {
    animation: preview 0.5s .2s ease-out forwards;
}

.preview {
    visibility: hidden;
    position: absolute;
    bottom: 40px;
    left: -10px;
    width: 75px;
    height: 70px;
    background-color: #555;
    color: #fff;
    text-align: center;
    padding: 5px 0;
    border-radius: 6px;
    z-index: 1;
    opacity: 0;
    display: flex;
    flex-direction: column;
}

.preview:after {
    content: "";
    position: absolute;
    top: 100%;
    left: 50%;
    margin-left: -5px;
    border-width: 5px;
    border-style: solid;
    border-color: #555 transparent transparent transparent;
}

.preview span {
    font-size: 16px;
}

.preview i {
    font-size: 28px;
    color: #EEEEEE;
    padding: 8px 2px;
}

.paymentTypes {
    display: flex;
    height: 60px;
}

.paymentTypes label {
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

.options {
    display: flex;
    flex-wrap: wrap;
}

.options label {
    display: flex;
    width: 103px;
    height: 50px;
    margin: 2px;
    justify-content: center;
    background: #fff;
    border: 2px solid #e0e0e0;
    position: relative;
    text-align: center;
    align-items: center;
    border-radius: 4px;
    color: #bdbdbd;
}

.options label:after {
    bottom: 0px!important;
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

.balanceDue {
    width: 219px;
    height: 42px;
    margin: 10px 0 4px;
    border-radius: 4px;
    border: 2px solid #607d8b;
    color: #3c3c3c;
    position: relative;
}

.balanceDue .for {
    position: absolute;
    top: -12px;
    background: #f5f5f5;
    font-weight: 700;
    left: 10px;
    padding: 0 5px;
}

.balanceDue .inner {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    padding: 0 10px;
}

.due {
    font-family: 'Agency FB';
    font-weight: bold;
    font-size: 36px;
}

.symbol {
    font-size: 26px;
    font-weight: normal;
    color: #009688;
    text-shadow: 0 1px 1px #ddd;
}

.addition {
    display: flex;
    flex-direction: column;
    margin-left: 10px;
    text-align: center;
    color: #FF9800;
    font-size: 20px;
    text-align: center;
}

.addition .text {
    font-size: 14px;
}

.fn {
    margin-left: 4px;
}

.fn .btn {
    height: 48px;
    margin: 6px 2px;
    width: 106px;
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

.double {
    width: 223px;
}

section.field {
    display: flex;
    width: 339px;
}

.input {
    position: relative;
    display: flex;
    flex-direction: column;
    width: 223px;
    height: 84px;
    border-radius: 2px;
    margin-bottom: 6px;
    color: #3c3c3c;
    box-shadow: var(--shadow);
}

.input.active {
    background: #5c6bc0;
    color: #fff;
    text-shadow: 0 1px 1px #444;
}

.input .text {
    padding: 7px 10px;
    font-size: 22px;
}

.input .value {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding-right: 10px;
    font-size: 22px;
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

@keyframes preview {
    from {
        opacity: 0;
        transform: translate3d(0, 10px, 0);
    }
    to {
        opacity: 1;
        visibility: visible;
        transform: translate3d(0, 0, 0)
    }
}
</style>