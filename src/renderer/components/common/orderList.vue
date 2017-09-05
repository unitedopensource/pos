<template>
    <div>
        <header v-if="layout === 'order'" class="simple">
            <span class="qty">{{$t('text.qty')}}</span>
            <span class="item">{{$t('text.item')}}</span>
            <span class="price">{{$t('text.price')}}</span>
        </header>
        <header v-else class="info">
            <div class="roundWrap">
                <span class="round">{{order.table || order.number}}</span>
            </div>
            <div class="innerWrap">
                <div v-if="order.type === 'DINE_IN'">
                    <div>
                        <i class="fa fa-user"></i>{{order.server}}</div>
                    <div>
                        <i class="fa fa-braille"></i>{{order.table}}</div>
                </div>
                <div v-else>
                    <div>
                        <i class="fa fa-clock-o"></i>{{order.time | moment('hh:mm:ss a')}}</div>
                    <div>
                        <i class="fa fa-phone"></i>{{order.customer && order.customer.phone}}</div>
                    <div>
                        <i class="fa fa-map-marker"></i>{{order.customer && order.customer.address}}</div>
                </div>
            </div>
            <span class="timePass" v-show="order.time">
                <i class="fa fa-clock-o"></i>{{order.time | fromNow}}</span>
        </header>
        <div class="order" @click.self="resetHighlight" v-if="layout === 'order'">
            <div class="inner" :style="scrollStyle" :class="{overflow}">
                <div class="list void" v-for="(list,index) in voidItems" :key="index">
                    <div class="itemOuter">
                        <span class="qty">{{list.qty}}</span>
                        <span class="itemWrap">
                            <span class="item">{{list[language]}}
                                <span class="mark">{{list.mark[0] | mark}}</span>
                            </span>
                            <span class="side">{{list.side[language]}}
                                <span class="mark">{{list.mark[1] | mark}}</span>
                            </span>
                        </span>
                        <span class="price">{{list.total}}</span>
                    </div>
                </div>
                <div class="list" v-for="(list,index) in cart" @click="setHighlight(list,$event)" :data-category="list.category" :key="index">
                    <div class="itemOuter">
                        <span class="qty">{{list.qty}}</span>
                        <span class="itemWrap">
                            <span class="item">{{list[language]}}
                                <span class="mark">{{list.mark[0] | mark}}</span>
                            </span>
                            <span class="side">{{list.side[language]}}
                                <span class="mark">{{list.mark[1] | mark}}</span>
                            </span>
                        </span>
                        <span class="price">{{list.total}}</span>
                    </div>
                    <div class="choiceSet" v-for="(set,index) in list.choiceSet" @click.stop="adjustChoiceSet(set,$event)" :key="index">
                        <span class="qty" :class="{hide:set.qty === 1}">{{set.qty}}</span>
                        <span class="item">{{set[language]}}</span>
                        <span class="price" :class="{hide:set.price == 0}">{{set.price | decimal}}</span>
                    </div>
                </div>
            </div>
        </div>
        <div class="order" v-else>
            <div class="inner" :style="scrollStyle" :class="{overflow}">
                <div class="list" v-for="(list,index) in order.content" :class="{print:!list.print,pending:list.pending}" @click="addToSpooler(list,$event)" :key="index">
                    <div class="itemOuter">
                        <span class="qty">{{list.qty}}</span>
                        <span class="itemWrap">
                            <span class="item">{{list[language]}}
                                <span class="mark">{{list.mark[0] | mark}}</span>
                            </span>
                            <span class="side">{{list.side[language]}}
                                <span class="mark">{{list.mark[1] | mark}}</span>
                            </span>
                        </span>
                        <span class="price">{{list.total}}</span>
                        <i class="fa"></i>
                    </div>
                    <div class="choiceSet" v-for="(set,index) in list.choiceSet" :key="index">
                        <span class="qty" :class="{hide:set.qty === 1}">{{set.qty}}</span>
                        <span class="item">{{set[language]}}</span>
                        <span class="price" :class="{hide:set.price == 0}">{{set.price | decimal}}</span>
                    </div>
                </div>
            </div>
        </div>
        <div class="middle">
            <div class="page">
                <i class="marker fa fa-shopping-basket" @click="openMarker" v-if="layout === 'order'"></i>
                <i class="marker fa fa-print" @click="directPrint" v-else></i>
                <i class="flip fa fa-2x fa-angle-up" @click="scroll('up')"></i>
                <i class="flip fa fa-2x fa-angle-down" @click="scroll('down')"></i>
            </div>
            <div class="settle" @click="openConfig">
                <div>
                    <span class="text">{{$t("text.subtotal")}}:</span>
                    <span class="value">{{payment.subtotal | decimal}}</span>
                </div>
                <div>
                    <span class="text">{{$t("text.tax")}}:</span>
                    <span class="value">{{payment.tax | decimal}}</span>
                </div>
                <div>
                    <span class="text">{{$t("text.deliveryFee")}}:</span>
                    <span class="value">{{payment.delivery | decimal}}</span>
                </div>
                <div>
                    <span class="text">{{$t("text.discount")}}:</span>
                    <span class="value">{{payment.discount | decimal}}</span>
                </div>
                <div>
                    <span class="text">{{$t("text.total")}}:</span>
                    <span class="value">{{payment.due | decimal}}</span>
                </div>
            </div>
        </div>
        <div class="driver btn" v-if="order.type ==='DELIVERY' && $route.name ==='History'" @click="setDriver">{{$t('button.setDriver')}}</div>
        <div :is="component" :init="componentData" @trigger="update"></div>
    </div>
</template>
<script>
import { mapGetters, mapActions } from 'vuex'
import dialoger from '../common/dialoger'
import itemMarker from '../menu/marker'
import driver from '../history/driver'
import Printer from '../../print'
import config from './config'
export default {
    components: { config, driver, itemMarker, dialoger },
    props: ['layout', 'group', 'display', 'sort'],
    data() {
        return {
            payment: {
                subtotal: 0,
                tax: 0,
                total: 0,
                due: 0,
                balance: 0,
                paid: 0,
                change: 0,
                gratuity: 0,
                tip: 0,
                discount: 0,
                delivery: 0,
                log: []
            },
            offset: 0,
            overflow: false,
            overflowIndex: null,
            component: null,
            componentData: null,
            pointer: null,
            spooler: [],
            lastClickTime: +new Date
        }
    },
    mounted() {
        this.$route.name === 'Menu' && this.app.mode === 'edit' && (this.payment = this.order.payment);
        this.$route.name === 'Table' && this.order.content.length > 0 && (this.payment = this.order.payment);
        this.app.mode === 'create' && this.order.content.length > 0 && this.calculator(this.order.content);
    },
    methods: {
        setHighlight(item, e) {
            if (e.currentTarget.className.indexOf('highlight') !== -1) {
                this.resetHighlight();
            } else {
                let dom = document.querySelector('.list.highlight');
                dom && dom.classList.remove('highlight');
                dom = document.querySelector('.choiceSet.target');
                dom && dom.classList.remove("target");
                this.resetChoiceSet();
                e.currentTarget.classList.add("highlight");
                this.setPointer(item);
            }
        },
        resetHighlight() {
            let dom = document.querySelector('.list.highlight');
            dom && dom.classList.remove('highlight');
            dom = document.querySelector('.choiceSet.target');
            dom && dom.classList.remove("target");
            this.resetChoiceSet();
            this.resetPointer();
        },
        openConfig() {
            if (this.component === 'config') return;
            let taxFree = this.order.taxFree || false;
            let deliveryFree = this.order.deliveryFree || false;
            let menuID = this.config.display.menuID;
            this.$p("config", { taxFree, deliveryFree, menuID });
        },
        scroll(direction) {
            if (!this.overflow || this.offset > 0) return;
            let doms = document.querySelectorAll(".order .list");
            if (!doms[this.overflowIndex]) return;
            let offset = doms[this.overflowIndex].offsetHeight;
            let currentClickTime = +new Date;
            if (direction === "up") {
                if ((currentClickTime - this.lastClickTime) < 230) {
                    this.scrollAllTheWay(direction, doms);
                    return;
                }
                this.overflowIndex--;
                this.offset += offset;
                if (this.offset > 0) {
                    setTimeout(() => {
                        this.overflowIndex++;
                        this.offset = 0;
                    }, 300)
                }
            } else {
                let height = 0;
                let inView = this.overflowIndex + 1;
                for (let i = 0; i < inView; i++) {
                    height += doms[i].offsetHeight;
                }
                this.offset = 329 - height;
                this.overflowIndex++;
                if (doms.length < (this.overflowIndex + 1)) {
                    this.overflowIndex--;
                    this.offset = 288 - height;
                    clearTimeout(this.timeout);
                    this.timeout = setTimeout(() => {
                        this.offset = 329 - height;
                    }, 300)
                }
            }
            this.lastClickTime = +new Date;
        },
        scrollAllTheWay(direction, doms) {
            if (direction === "up") {
                this.offset = 37;
                setTimeout(() => {
                    this.offset = 0;
                }, 300);
                let height = 0;
                for (let i = 0; i < doms.length; i++) {
                    height += doms[i].offsetHeight;
                    if (height > 329) {
                        this.overflowIndex = i;
                        break;
                    }
                }
            } else {
                let height = 0;
                let inView = this.overflowIndex + 1;
                for (let i = 0; i < inView; i++) {
                    height += doms[i].offsetHeight;
                }
                this.offset = 329 - height;
                this.overflowIndex++;
                if (doms.length < (this.overflowIndex + 1)) {
                    this.overflowIndex--;
                    this.offset = 288 - height;
                    clearTimeout(this.timeout);
                    this.timeout = setTimeout(() => {
                        this.offset = 329 - height;
                    }, 300)
                }
            }
        },
        openMarker() {
            if (this.isEmptyTicket) return;
            this.$p("itemMarker")
        },
        addToSpooler(item) {
            if (item.print) return;
            let i = 0;
            for (; i < this.spooler.length; i++) {
                if (this.spooler[i].unique === item.unique) {
                    item.pending = false;
                    this.spooler.splice(i, 1);
                    return;
                }
            }
            item.pending = true;
            this.spooler.push(item);
        },
        directPrint() {
            if (this.spooler.length === 0) return;
            let error = false;
            let sendItem = this.spooler.length;
            let order = JSON.parse(JSON.stringify(this.order));
            let items = order.content.map(item => {
                if (item.pending) item.print = true;
                return item;
            });
            let remain = items.filter(item => !item.print).length;
            try {
                order.content = this.spooler;
                Printer.init(this.config).setJob("receipt").print(order);
                order.content = items;
                if (remain === 0) order.print = true;
                this.$socket.emit("[UPDATE] INVOICE", order);
            } catch (e) {
                error = true;
                this.spooler = [];
                this.$dialog({
                    type: 'warning', title: 'dialog.unableSent', msg: ['dialog.errorCode', e.toString()],
                    buttons: [{ text: 'text.confirm', fn: 'resolve' }]
                }).then(() => { this.$q() })
            }
            if (!error) {
                let txt = remain > 0 ? this.$t('dialog.remainPrintItem', remain) : this.$t('dialog.noRemainItem');
                this.$dialog({
                    type: 'info', title: 'dialog.itemSent', msg: this.$t('dialog.printResult', sendItem) + ", " + txt,
                    buttons: [{ text: 'button.confirm', fn: 'resolve' }]
                }).then(() => { this.$q() })
                this.spooler.forEach(item => { item.print = true })
                this.spooler = [];
            }
        },
        adjustChoiceSet(choice, event) {
            let dom = document.querySelector('.choiceSet.target');
            dom && dom.classList.remove("target");
            event.currentTarget.classList.add("target");
            this.setChoiceSetTarget(choice);
        },
        update(config) {
            this.setOrder(config);
            this.calculator(this.cart);
        },
        setDriver() {
            this.$p("driver", { driver: this.order.driver, ticket: this.ticket.number })
        },
        calculator(items) {
            if (items.length === 0) {
                this.payment = {
                    subtotal: 0,
                    tax: 0,
                    total: 0,
                    due: 0,
                    balance: 0,
                    paid: 0,
                    change: 0,
                    gratuity: 0,
                    tip: 0,
                    discount: 0,
                    delivery: 0,
                    log: []
                };
                return;
            }
            let { type } = this.ticket;
            let total = 0;
            let subtotal = 0;
            let tax = 0;
            let delivery = 0;
            let due = 0;
            let balance = 0;
            let { tip, gratuity, discount } = this.payment;
            items.forEach(item => {
                if (item.void) return;
                let taxClass = this.tax.class[item.taxClass];
                let amount = item.single * item.qty;
                item.choiceSet.forEach(set => { amount += set.single * set.qty });
                if (!this.order.taxFree) tax += taxClass.apply[type] ? (taxClass.rate / 100 * amount) : tax;
                subtotal += amount;
            });

            delivery = (this.ticket.type === 'DELIVERY' && this.store.delivery && !this.order.deliveryFree) ? this.store.deliveryCharge : 0;
            total = subtotal + tax + delivery + parseFloat(tip) + parseFloat(gratuity);
            due = total - parseFloat(discount);
            balance = due - this.payment.paid;
            this.payment = Object.assign({}, this.payment, {
                subtotal: subtotal.toFixed(2),
                tax: tax.toFixed(2),
                total: total.toFixed(2),
                due: due.toFixed(2),
                balance:balance.toFixed(2)
            });
            this.setOrder({ payment: this.payment });
        },
        ...mapActions(['setPointer', 'resetPointer', 'resetChoiceSet', 'setChoiceSetTarget', 'setOrder'])
    },
    computed: {
        scrollStyle() {
            return { transform: `translate3d(0,${this.offset}px,0)` }
        },
        cart() {
            return this.sort ? this.order.content.filter(item => item.sort === this.sort && !item.void) : this.order.content.filter(item => !item.void)
        },
        voidItems() {
            return this.config.display.voidItem ? this.order.content.filter(item => item.void) : []
        },
        ...mapGetters(['app', 'config', 'store', 'tax', 'order', 'item', 'ticket', 'language', 'isEmptyTicket'])
    },
    filters: {
        mark(text) {
            return text.join(" ")
        }
    },
    watch: {
        'payment'() {
            this.$nextTick(() => {
                let height = 0;
                let doms = document.querySelectorAll(".order .list");
                doms.forEach(dom => {
                    height += dom.offsetHeight;
                });
                height = 329 - height;
                this.overflow = height < 0;
                this.overflowIndex = this.overflow ? this.cart.last() : null;
                this.offset = this.overflow ? height : 0;
            })
        },
        'cart': {
            handler(n) {
                this.display ? this.payment = this.order.payment : this.calculator(n);
            }, deep: true
        },
        'ticket.type'(n) {
            this.calculator(this.cart)
        }
    }
}
</script>

<style scoped>
.overflow {
    transition: transform .22s ease;
}

header.simple {
    display: flex;
    flex-direction: row;
    height: 25px;
    line-height: 25px;
    border-bottom: 1px solid #ccc;
    background: #FAFAFA;
    color: #333;
}

header.info {
    background: #F5F5F5;
    color: #555;
    position: relative;
    height: 88px;
    display: flex;
    border-bottom: 1px solid #eee;
}

header i {
    margin-right: 2px;
}

.roundWrap {
    width: 94px;
    overflow: hidden;
}

.round {
    font-size: 3em;
    width: 100px;
    height: 236px;
    line-height: 234px;
    padding-left: 185px;
    color: #fff;
    background: #2196F3;
    display: inline-block;
    text-align: center;
    border-radius: 100%;
    text-shadow: 0 3px 3px rgba(0, 0, 0, 0.6);
    box-shadow: 1px 1px 6px 0px rgba(15, 42, 72, 0.43);
    transform: translate(-69%, -50%) translateY(46px);
}

.info .innerWrap {
    width: 191px;
    margin-top: 3px;
}

.simple .qty {
    width: 44px;
    text-align: center;
}

.simple .item {
    flex: 1;
}

.simple .price {
    width: 48px;
    text-align: center;
}

.order {
    height: 329px;
    background: hsla(0, 9%, 66%, .15);
    overflow: hidden;
}

.list {
    border-bottom: 1px solid #ddd;
    padding: 10px 0 8px;
    background: #fff;
    font-size: 1.05em;
    width: 100%;
    display: flex;
    min-height: 20px;
    flex-direction: column;
}

.list.void {
    color: red;
    opacity: 0.5;
}

.list.highlight {
    background: #A1887F;
    color: #fff;
    text-shadow: 0 1px 1px rgba(0, 0, 0, 0.8);
}

.highlight .choiceSet .item {
    color: #fff;
}

.list.highlight .side {
    color: #fff;
    text-shadow: 0 1px 1px rgba(0, 0, 0, 0.8);
}

.qty {
    text-align: center;
    width: 35px;
    vertical-align: top;
}

.itemOuter {
    display: flex;
}

.itemWrap {
    display: flex;
    flex: 1;
    align-items: center;
}

.itemWrap>span {
    position: relative;
    vertical-align: baseline;
}

.itemWrap .item {
    text-overflow: ellipsis;
    padding-right: 5px;
}

.side {
    color: #666;
    font-size: 16px;
    padding: 1px 0;
}

.mark {
    position: absolute;
    width: 100%;
    top: -9px;
    font-size: 10px;
    left: 0;
    height: 10px;
    line-height: 10px;
    text-align: center;
    font-weight: 700;
    color: #ff5722;
}

.list .price {
    min-width: 45px;
    text-align: right;
    padding-right: 10px;
    vertical-align: top;
    font-size: initial;
}

.middle {
    display: flex;
    margin-top: 1px;
}

.page {
    width: 127px;
    padding-left: 3px;
}

.page i {
    background: linear-gradient(#fefefe, #cfd0d3);
    box-shadow: 0 1px 3px rgba(0, 0, 0, .7);
    text-shadow: 0 1px 1px #fff;
}

.page i:active {
    background: linear-gradient(#E2E3E4, #AAADB4);
    color: #333;
}

i.marker {
    width: 108px;
    text-align: center;
    padding: 10px 8px;
    margin-bottom: 3px;
}

i.flip {
    padding: 20px;
    width: 20px;
}

.settle {
    width: 155px;
}

.settle div {
    border-bottom: 1px solid #eee;
    background: #fff;
    padding: 1px;
    display: flex;
}

.settle .text {
    width: 70px;
}

.settle .value {
    flex: 1;
    padding-right: 10px;
    overflow: hidden;
    vertical-align: text-top;
    text-overflow: ellipsis;
}

.settle .text,
.settle .value {
    text-align: right;
}

.settle div:last-child {
    font-weight: 700;
    font-size: larger;
    padding: 2.5px 0;
}

.choiceSet {
    display: flex;
    font-size: 16px;
}

.choiceSet .item {
    margin-left: 5px;
    color: #555;
    border-bottom: 1px dashed #ccc;
    vertical-align: top;
    flex: 1;
}

.choiceSet:last-child .item {
    border-bottom: none;
}

.choiceSet.target {
    background: #9E9E9E;
    border-radius: 8px;
    text-shadow: 0 1px 1px rgba(0, 0, 0, 0.8);
}

.choiceSet.target .qty,
.choiceSet.target .item,
.choiceSet.target .price {
    color: #fff;
    visibility: visible;
}

.hide {
    visibility: hidden;
}

.timePass {
    position: absolute;
    bottom: -1px;
    right: 0px;
    padding: 0 10px;
    height: 22px;
    color: #009688;
    background: #fff;
    text-align: center;
    line-height: 22px;
    font-size: 14px;
    border: 1px solid #ddd;
    border-bottom: 1px solid #fff;
    border-right: none;
    border-top-left-radius: 8px;
}

.print .itemWrap {
    width: 200px;
}

.list.print .price {
    display: none;
}

.list.print i {
    color: #555;
    display: inline-block;
}

.print i::before {
    content: '\F02F'
}

.print.pending i::before {
    content: '\F017';
    color: #FF9800;
}

.list.print.pending {
    background: #ECEFF1;
}

.list i {
    display: none;
    padding-right: 25px;
}

.order.showCategory .list {
    position: relative;
}

.showCategory .list:before {
    content: attr(data-category);
    position: absolute;
    top: 0px;
    right: 10px;
    font-size: 9px;
    font-family: 'Microsoft YaHei';
    background: #009688;
    color: #fff;
    padding: 0 2px;
    -webkit-font-smoothing: antialiased;
    font-weight: lighter;
}

.driver {
    width: 275px;
    margin: 5px;
    height: 40px;
    font-size: initial;
}
</style>