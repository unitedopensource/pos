<template>
    <div class="popupMask center dark">
        <div class="window" v-show="!component">
            <header class="title">
                <span>{{$t('menu.split')}}</span>
                <i class="fa fa-times" @click="cancel"></i>
            </header>
            <section>
                <split-list :invoice="items" @queue="setQueue" v-show="remain !==0"></split-list>
                <div class="wrap">
                    <div class="inner">
                        <i class="fa fa-2x fa-angle-left page" @click="page = page===(split-1) ? page : page+1" v-show="split > 2"></i>
                        <div class="extend" :style="offset">
                            <split-list :invoice="items" :done="lock" v-for="i in split" :split="i" :key="i" @queue="setQueue" @click.native="trigger(i)" @print="printInvoice" @pay="settle"></split-list>
                        </div>
                        <i class="fa fa-2x fa-angle-right page" @click="page = page===0 ? 0 : page-1" v-show="split > 2"></i>
                    </div>
                    <div class="spliter" @click="newSplit"></div>
                </div>
            </section>
            <footer>
                <div class="f1">
                    <div class="btn confirm" @click="settleInvoice($event)">{{$t('button.payment')}}</div>
                    <div class="btn" @click="printAllInvoices">{{$t('button.printAll')}}</div>
                    <div class="btn" @click="splitEvenly">{{$t('button.evenSplit')}}</div>
                </div>
                <div class="btn" @click="init.reject">{{$t('button.cancel')}}</div>
                <div class="btn" @click="sort(1)">{{$t('button.sort')}}</div>
                <div class="btn" @click="save">{{$t('button.save')}}</div>
            </footer>
        </div>
        <div :is="component" :init="componentData"></div>
    </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import dialoger from '../common/dialoger'
import splitList from './splitList'
import Printer from '../../print'
export default {
    props: ['init'],
    components: { splitList, dialoger },
    data() {
        return {
            page: 0,
            split: 0,
            items: [],
            lock: false,
            origin: null,
            component: null,
            componentData: null,
            transferItems: [],
            splitPayment: {}
        }
    },
    created() {
        this.initial();
    },
    beforeCreate() {
        this.$options.components.payment = require('../payment/payment');
    },
    methods: {
        initial() {
            this.items = this.flatten(this.order.content);
            this.split = this.check(this.items);
        },
        flatten(items) {
            let flattened = [];
            items.forEach(item => {
                let { qty, sort = 0, single } = item;
                while (qty > 0) {
                    let clone = Object.assign({}, item, {
                        qty: 1,
                        sort,
                        total: single.toFixed(2),
                        unique: Math.random().toString(36).substr(2, 5)
                    });
                    flattened.push(clone);
                    qty--;
                }
            });
            return flattened
        },
        check(items) {
            return [].concat.apply([], items.map(item => item.sort)).filter((v, i, s) => s.indexOf(v) === i).length
        },
        newSplit() {
            this.transferItems.length ? this.transfer(++this.split) : this.split++;
        },
        trigger(i) {
            this.transferItems.length && this.transfer(i);
        },
        setQueue(transfer) {
            if (transfer.items.length !== 0) {
                this.origin = transfer.origin;
                this.transferItems = transfer.items;
            }
        },
        sort(index) {
            let unique = [].concat.apply([], this.items.map(item => item.sort)).filter((v, i, s) => s.indexOf(v) === i);
            let max = Math.max(...unique);
            if (!unique.includes(index)) {
                let origin = unique[index - 1];
                this.items.forEach(item => {
                    item.sort = item.sort === origin ? index : item.sort
                })
            }
            ++index <= max ? this.sort(index) : (this.split = [].concat.apply([], this.items.map(item => item.sort)).filter((v, i, s) => s.indexOf(v) === i).length)
        },
        splitEvenly() {
            this.split > 1 && this.transfer([], true)
        },
        transfer(index, even) {
            let doms = document.querySelectorAll(".split .active");
            doms.forEach(dom => { dom && dom.classList.remove("active") });

            if (even) {
                for (let i = 1; i < this.split + 1; i++) {
                    index.push(i)
                }
            }
            this.items.forEach(item => {
                if (this.transferItems.includes(item.unique)) {
                    item.sort = index;
                    if (even) {
                        if (item.total.includes("/")) return;
                        item.single = parseFloat((item.single / index.length).toFixed(2));
                        item.total = item.total + "/" + index.length;
                    } else if (item.total.includes("/")) {
                        let split = item.total.split("/")[1];
                        item.single = parseFloat((item.single * split).toFixed(2));
                        item.total = item.single.toFixed(2);
                    }
                }
            });
            this.transferItems = [];
            this.$bus.emit("SPLIT_ORDER");
        },
        printInvoice(index, skip) {
            skip ? this.print(index) :
                this.$dialog({
                    type: "question", title: "dialog.printReceiptConfirm", msg: "dialog.printReceiptConfirmTip",
                    buttons: [{ text: 'button.noReceipt', fn: 'reject' }, { text: 'button.printReceipt', fn: 'resolve' }]
                }).then(() => {
                    this.$q();
                    this.print(index);
                    this.checkSettle();
                }).catch(() => { this.$q(); this.checkSettle() })
        },
        printAllInvoices() {
            this.sort(1);
            for (let i = 1; i < this.split + 1; i++) {
                this.printInvoice(i, true);
            }
            this.quit();
        },
        print(index) {
            let content = this.items.filter(item => Array.isArray(item.sort) ? item.sort.includes(index) : item.sort === index)
            let order = JSON.parse(JSON.stringify(this.order));
            let customer = this.customer;
            Object.assign(order, {
                content, customer,
                number: this.items.number ? this.items.number : `${this.ticket.number}-${index}`,
                type: this.items.type ? this.items.type : this.ticket.type,
                payment: this.splitPayment[index] || this.$children[index].payment,
                time: +new Date
            });
            Printer.init(this.config).setJob("receipt").print(order);
            this.items.forEach(item => {
                Array.isArray(item.sort) ?
                    item.sort.includes(index) && (item.print = true) :
                    item.sort === index && (item.print = true);
                delete item.new;
            })
        },
        save() {
            this.sort(1);
            this.combineInvoiceInfo();
            this.exit();
        },
        settle(ticket) {
            let { split, payment } = ticket;
            new Promise((resolve, reject) => {
                this.componentData = { payment, index: split - 1, resolve, reject };
                this.component = "payment";
            }).then((result) => {
                this.$q();
                this.splitPayment[split] = result;
                this.$bus.emit("SPLIT_PAID", split);
            }).catch(() => {
                this.$q()
            })
        },
        checkSettle() {
            let settle = 0;
            Object.keys(this.splitPayment).forEach(split => {
                this.splitPayment[split].settled && settle++
            });
            if (settle === this.split) {
                this.setOrder({ settled: true });
                this.quit();
            }
        },
        gatherPayment() {
            let splitPayment = []
            this.$children.forEach(invoice => {
                splitPayment.push(invoice.payment)
            });
            splitPayment.splice(0, 1);
            let payment = {};
            splitPayment.filter(ticket => typeof ticket === 'object').forEach(pay => {
                Object.keys(pay).forEach(key => {
                    if (payment.hasOwnProperty(key)) {
                        isNumber(payment[key]) ?
                            payment[key] = parseFloat(payment[key]) + parseFloat(pay[key]) :
                            payment[key].push(...pay[key]);
                    } else {
                        payment[key] = pay[key]
                    }
                })
            })
            delete payment.sort;
            this.setOrder({ splitPayment, payment });
        },
        combineInvoiceInfo() {
            let customer = Object.assign({}, this.customer);
            delete customer.extra;
            if (this.app.mode === 'create' && this.$route.name === 'Menu') {
                this.setOrder({
                    customer,
                    content: this.items,
                    type: this.ticket.type,
                    number: this.ticket.number,
                    station: this.station.alies,
                    source: "POS",
                    modify: 0,
                    status: 1,
                    time: +new Date,
                    date: today(),
                    split: true
                })
            } else {
                this.setOrder({
                    content: this.items,
                    lastEdit: +new Date,
                    editor: this.op.name,
                    modify: this.order.modify + 1,
                    split: true
                })
            }
            this.gatherPayment();
        },
        settleInvoice(e) {
            this.sort(1);
            this.lock ?
                e.currentTarget.classList.remove("active") :
                e.currentTarget.classList.add("active");
            this.lock = !this.lock;
        },
        cancel() {
            this.init.reject()
        },
        exit() {
            this.$route.name !== 'Menu' && this.$socket.emit("[UPDATE] INVOICE", this.order);
            this.init.resolve();
        },
        quit() {
            this.combineInvoiceInfo();
            if (this.$route.name !== 'Menu') {
                this.$socket.emit("[UPDATE] INVOICE", this.order);
                this.init.resolve();
            } else if (this.$route.name === 'Menu' && this.app.mode === 'create') {
                this.$socket.emit("[SAVE] INVOICE", this.order);
                this.resetAll();
                this.$router.push({ path: '/main' });
            } else {
                this.$socket.emit("[UPDATE] INVOICE", this.order);
                this.resetAll();
                this.$router.push({ path: '/main' });
            }
        },
        ...mapActions(['setOrder', 'resetAll'])
    },
    computed: {
        offset() {
            let width = this.split * 250;
            let offset = this.page * 250;
            return { transform: `translate3d(${offset}px,0,0)` }
        },
        remain() {
            return this.items.filter(item => item.sort === 0).length
        },
        ...mapGetters(['op', 'app', 'config', 'order', 'ticket', 'customer', 'station'])
    }
}
</script>

<style scoped>
.window {
    width: 1000px;
    background: url(../../assets/image/grid.png) #fcfcfc;
}

.title {
    padding: 15px;
}

.title i {
    padding: 15px 20px;
}

section {
    display: flex;
    flex-direction: row-reverse;
    min-height: 410px;
}

.wrap {
    display: flex;
    flex: 1;
    justify-content: flex-start;
    overflow: auto;
}

i.page {
    position: absolute;
    top: 180px;
    color: #37474F;
    text-align: center;
    border-radius: 50%;
    background: #fff;
    box-shadow: 0 3px 5px rgba(0, 0, 0, 0.4);
    height: 50px;
    width: 50px;
    line-height: 50px;
    cursor: pointer;
    z-index: 1;
    transition: all 0.1s ease;
}

i.page:active {
    background: #eee;
    transform: translateY(1px);
}

.fa-angle-left {
    left: 10px;
}

.fa-angle-right {
    right: 10px;
}

.inner {
    flex: 1;
    overflow: hidden;
    display: flex;
    justify-content: flex-end;
    position: relative;
}

.extend {
    display: flex;
    justify-content: flex-start;
    flex-wrap: nowrap;
    transition: transform 0.22s ease;
}

.spliter {
    width: 150px;
    height: inherit;
    background: #fff;
    border: 2px dashed #ddd;
    border-radius: 4px;
    margin: 5px;
    position: relative;
}

.spliter:before {
    font-family: fontAwesome;
    content: '\F067';
    position: absolute;
    top: calc(50% - 40px);
    left: 0;
    right: 0;
    margin: auto;
    width: 63px;
    display: block;
    font-size: 5em;
    color: gray;
}

.btn {
    margin: 5px;
    flex: 1;
    max-width: 100px;
}

.confirm.active {
    background: linear-gradient(#ddd, #f5f5f5);
    color: #666;
}
</style>