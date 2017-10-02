<template>
    <div class="popupMask center dark" @click.self="init.reject">
        <div class="window" v-show="!component">
            <header class="title">
                <span>{{$t('title.selectTask')}}</span>
                <i class="fa fa-times" @click="init.reject"></i>
            </header>
            <div class="inner">
                <div v-if="!card">
                    <input type="radio" name="task" v-model="task" value="activation" id="activation">
                    <label for="activation">
                        <i class="fa fa-credit-card"></i>{{$t('card.activation')}}</label>
                </div>
                <div v-else>
                    <input type="radio" name="task" v-model="task" value="print" id="print">
                    <label for="print">
                        <i class="fa fa-print"></i>{{$t('card.printBalance')}}</label>
                </div>
                <div>
                    <input type="radio" name="task" v-model="task" value="reload" id="reload">
                    <label for="reload">
                        <i class="fa fa-money"></i>{{$t('card.reload')}}
                        <span class="text" v-if="card">{{card.number | card}}</span>
                    </label>
                </div>
                <div>
                    <input type="radio" name="task" v-model="task" value="view" id="history">
                    <label for="history">
                        <i class="fa fa-list-ol"></i>{{$t('card.history')}}
                        <span class="text" v-if="card">{{$t('text.records',card.transaction)}}</span>
                    </label>
                </div>
                <div>
                    <input type="radio" name="task" v-model="task" value="redemption" id="redemption">
                    <label for="redemption">
                        <i class="fa fa-usd"></i>{{$t('card.redemption')}}
                        <span class="text" v-if="card">$ {{card.balance.toFixed(2)}}</span>
                    </label>
                </div>
            </div>
            <footer>
                <div class="btn" @click="confirm">{{$t('button.confirm')}}</div>
            </footer>
        </div>
        <div :is="component" :init="componentData"></div>
    </div>
</template>

<script>
import loader from './loader'
import capture from './capture'
import dialoger from '../common/dialoger'
import { mapGetters } from 'vuex'
export default {
    props: ['init'],
    components: { capture, dialoger, loader },
    data() {
        return {
            componentData: null,
            component: null,
            task: 'activation',
            card: null,
        }
    },
    filters: {
        card(number) {
            return number.replace(/^\D?(\d{4})\D?\D?(\d{4})\D?(\d{4})\D?(\d{4})/, "$1 $2 $3 $4")
        }
    },
    methods: {
        confirm() {
            this.card ?
                this.doTask() :
                new Promise((resolve, reject) => {
                    this.componentData = { resolve, reject };
                    this.component = 'capture'
                }).then((data) => {
                    this.$q()
                    let { number, result } = data;
                    this.doTask(result, number)
                }).catch(() => { this.$q() })
        },
        doTask(card, number) {
            card = card || this.card;
            switch (this.task) {
                case "activation":
                    if (!card) {
                        this.$dialog({
                            title: 'dialog.giftCardActivation',
                            msg: 'dialog.giftCardActivationTip',
                            buttons: [{ text: 'button.cancel', fn: 'reject' }, { text: 'button.confirm', fn: 'resolve' }]
                        }).then(() => {
                            this.activateGiftCard(number);
                        }).catch(() => { this.$q() })
                    } else {
                        this.$dialog({
                            title: 'dialog.giftCardRegistered',
                            msg: 'dialog.giftCardRegisteredInfo',
                            buttons: [{ text: 'button.confirm', fn: 'resolve' }]
                        }).then(() => {
                            this.card = card;
                            this.task = 'print';
                            this.$q()
                        })
                    }
                    break;
                case "reload":
                    let { number, balance } = card;
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
                            this.card = card;
                            Printer.printGiftCard('Reload', this.card)
                        })
                    }).catch(() => {
                        this.$q()
                    })
                    break;
                case "view":
                    break;
                case "redemption":
                    this.withdrawn();
                    break;
                case "print":
                    Printer.printGiftCard('Balance', this.card);
                    break;
            }
        },
        activateGiftCard(number) {
            new Promise((resolve, reject) => {
                let activation = true;
                this.componentData = { resolve, reject, number };
                this.component = "loader";
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
                    this.card = result;
                    this.task = 'print';
                    this.recordCashDrawerAction(value, 0);
                    Printer.printGiftCard('Activation', result)
                })
            }).catch(() => { this.$q() })
        },
        recordCashDrawerAction(inflow, outflow) {
            let activity = {
                type: "CASHFLOW",
                inflow: parseFloat(inflow),
                outflow: parseFloat(outflow),
                time: +new Date,
                ticket: {},
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
        withdrawn() {
            this.$dialog({
                title: 'dialog.cashingOutConfirm', msg: ['dialog.cashingOutConfirmTip', this.card.balance.toFixed(2)]
            }).then(() => {
                this.$q()
            }).catch(() => { this.$q() })
        }
    },
    computed: {
        ...mapGetters(['op', 'station'])
    }
}
</script>

<style scoped>
label {
    background: #fff;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.5);
    display: flex;
    height: 25px;
    width: 250px;
    padding: 15px;
    align-items: center;
    margin: 5px;
    cursor: pointer;
    position: relative;
}

input:checked+label {
    background: url('../../assets/image/mis.png') #009688;
    color: #fff;
    text-shadow: 0 1px 1px #333;
}

input:checked+label:after {
    position: absolute;
    bottom: 5px;
    right: 7px;
    content: '\f058';
    font-family: fontAwesome;
    color: #fff;
}

label .fa {
    margin-right: 10px;
    width: 20px;
}

span.text {
    padding: 0 10px;
    color: #FF9800;
    display: inline-block;
    flex: 1;
    text-align: right;
}
</style>