<template>
    <div class="popupMask center dark">
        <div class="window" v-show="!component">
            <header class="title">
                <span>{{$t('title.payment')}}</span>
                <nav>
                    <label v-for="(split,index) in order.splitPayment" :key="index">
                        <input type="radio" name="split" :id="'split'+index" :value="index" v-model="current" @change="switchInvoice">
                        <label :for="'split'+index" class="tag">#{{index + 1}}</label>
                    </label>
                </nav>
                <i class="fa fa-times" @click="init.reject"></i>
            </header>
            <section class="head">
                <div class="type">
                    <div>
                        <input type="radio" v-model="payment.type" name="paymentType" value="CASH" id="CASH" @change="setPaymentType('CASH')">
                        <label for="CASH">{{$t('type.CASH')}}</label>
                    </div>
                    <div>
                        <input type="radio" v-model="payment.type" name="paymentType" value="CREDIT" id="CREDIT" @change="setPaymentType('CREDIT')">
                        <label for="CREDIT">{{$t('type.CREDIT')}}</label>
                    </div>
                    <div>
                        <input type="radio" v-model="payment.type" name="paymentType" value="GIFT" id="GIFT" @change="setPaymentType('GIFT')">
                        <label for="GIFT">{{$t('type.GIFT')}}</label>
                    </div>
                </div>
                <div class="display">
                    <div class="field">
                        <span class="text">{{$t('text.balanceDue')}}</span>
                        <div class="wrap">
                            <div class="due">{{payment.balance | decimal}}</div>
                            <div class="value">
                                <span class="text">{{$t('text.discount')}}</span>
                                <span class="value">-{{payment.discount | decimal}}</span>
                            </div>
                            <div class="value">
                                <span class="text">{{$t('text.tip')}}</span>
                                <span class="value">+{{payment.tip | decimal}}</span>
                            </div>
                            <div class="value">
                                <span class="text">{{$t('text.gratuity')}}</span>
                                <span class="value">+{{payment.gratuity | decimal}}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="buttons">
                    <button class="btn" @click="setTip">{{$t('button.setTip')}}</button>
                    <button class="btn" @click="setDiscount">{{$t('button.setDiscount')}}</button>
                    <button class="btn" @click="savePayment">{{$t('button.save')}}</button>
                </div>
            </section>
            <section class="body">
                <div class="numpad">
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
                </div>
                <div class="form">
                    <div class="wrap" v-if="payment.type === 'CASH'">
                        <div class="data">
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
                                <span class="people">${{(payment.balance / evenPay) | decimal}}</span>
                            </span>
                            <span class="value">{{evenPay}}</span>
                        </div>
                    </div>
                    <div class="wrap" v-else-if="payment.type ==='CREDIT'">

                    </div>
                    <div class="wrap" v-else>

                    </div>
                </div>
                <div class="quickInput">
                    <div class="numKey" v-for="(number,index) in quickInput" @click="setQuickInput(number)" :key="index">{{number}}</div>
                </div>
            </section>
        </div>
        <div :is="component" :init="componentData"></div>
    </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import dialoger from '../common/dialoger'
export default {
    props: ['init'],
    components: { dialoger },
    computed: {
        due() {
            let change = this.paid - this.payment.due;
            let balance = this.payment.settled ? this.payment.balance : this.payment.due - this.paid;

            return {
                change: Math.max(0, change).toFixed(2),
                balance: Math.max(0, balance).toFixed(2)
            }
        },
        ...mapGetters(['op', 'device'])
    },
    data() {
        return {
            releaseComponentLock: true,
            componentData: null,
            component: null,
            quickInput: [],
            payment: null,
            order: null,
            ref: null,
            paid: '0.00',
            resetField: true,
            creditCard: {
                number: '',
                data: '',
                code: ''
            },
            giftCard: {
                number: '',
                balance: '0.00'
            },
            evenPay: 1,
            current: 0,
            payInFull: true
        }
    },
    created() {
        this.order = JSON.parse(JSON.stringify(this.$store.getters.order));
        this.payment = Object.assign(this.order.payment, { type: 'CASH' });

        this.init.hasOwnProperty("index") ? this.paySplit(this.init.index) :
            this.order.split ? this.askPayMode() : this.initial();

        this.checkComponentUsage()
    },
    mounted() {

    },
    beforeDestroy() {
        this.releaseComponentLock && this.$socket.emit('[COMPONENT] UNLOCK', {
            component: 'payment', lock: this.order._id
        })
    },
    methods: {
        initial() {
            this.payment.balance = Math.max(0, (this.payment.due - this.payment.paid));
            this.getQuickInput(this.payment.balance);
            this.poleDisplay(['TOTAL DUE', ''], ["", this.payment.due.toFixed(2)]);
        },
        askPayMode() {
            this.$dialog({
                type: 'question', title: 'dialog.splitPayment', msg: 'dialog.splitPaymentTip',
                buttons: [{ text: 'button.paidInFull', fn: 'reject' }, { text: 'button.splitPay', fn: 'resolve' }]
            }).then(() => {
                this.paySplit();
                this.$q();
            }).catch(() => {
                this.initial();
                this.$q()
            })
        },
        checkComponentUsage() {
            let data = {
                component: 'payment',
                operator: this.op.name,
                lock: this.order._id,
                time: +new Date,
                exp: +new Date + 1000 * 120
            }
            this.$socket.emit('[COMPONENT] LOCK', data, settling => { settling && this.paymentPending() })
        },
        paymentPending() {
            this.$dialog({
                title: 'dialog.pending', msg: 'dialog.pendingOrderAccessDenied', timeout: { duration: 30000, fn: 'resolve' },
                buttons: [{ text: 'button.confirm', fn: 'resolve' }]
            }).then(() => {
                this.releaseComponentLock = false;
                this.init.reject()
            })
        },
        paySplit(index) {
            this.payInFull = false;
            index = isNumber(index) ? index : this.order.splitPayment.findIndex(payment => !payment.settled)
            this.switchInvoice(index);
        },
        switchInvoice(index) {
            if (isNumber(index)) this.current = index;
            this.payment = this.order.splitPayment(this.current);
            this.payment = Object.assign({}, this.payment, { type: 'CASH' });
            this.payment.balance = Math.max(0, (this.payment.due - this.payment.paid));
            this.paid = '0.00';
            this.getQuickInput(this.payment.balance)
        },
        input() { },
        setInput() { },
        setPaymentType() { },
        setTip() { },
        setDiscount() { },
        savePayment() {
            if (this.payInFull) {


            } else {
                this.saveSplitPayment()
            }
        },
        saveSplitPayment() {

        },
        getQuickInput(amount) {
            let preset = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 60, 70, 80, 100, 120, 140, 150, 200, 300, 350, 400, 450, 500, 600, 700, 800, 900, 1000, 1100, 1500, 2000, 3000, 4000, 5000];
            let array = [];
            let round = Math.ceil(isNumber(amount) ? amount : 0)
            array.push(amount.toFixed(2));
            amount === round ? array.push((round + 1)) : array.push(round);
            let index = preset.findIndex(i => i > round);
            array.push(preset.slice(index, index + 6));
            this.quickInput = [].concat.apply([], array)
        },
        poleDisplay(line1, line2) {
            if (!this.device.poleDisplay) return;
            poleDisplay.write('\f');
            poleDisplay.write(line(line1, line2));
        },
        ...mapActions(['setOrder', 'resetMenu', 'resetAll'])
    }

}
</script>

<style scoped>
.window {
    width: 965px;
}

section.head,
section.head .type,
section.body,
.display .field,
.quickInput,
.numpad {
    display: flex;
}

section.head .type>div {
    display: inline-flex;
    align-items: center;
}

section.head .type label {
    width: 104px;
    margin: 4px;
    background: #fff;
    border: 2px solid #c0c0c0;
    position: relative;
    text-align: center;
    border-radius: 4px;
    padding: 11px 0;
    color: #bdbdbd;
}

.type input[type='radio']:checked+label {
    background: #66bb6a;
    color: #fafafa;
    border: 2px solid #009688;
    text-shadow: 0 2px 1px rgba(0, 0, 0, .5);
    box-shadow: 0 1px 2px rgba(0, 0, 0, .3);
}

.type input[type='radio']:checked+label:before {
    position: absolute;
    content: " ";
    width: 23px;
    height: 15px;
    background: #009688;
    bottom: 0;
    right: 0;
    border-top-left-radius: 4px;
}

.type input[type='radio']:checked+label:after {
    position: absolute;
    content: "\F00C";
    font-family: fontAwesome;
    bottom: 0px;
    right: 2px;
}
</style>