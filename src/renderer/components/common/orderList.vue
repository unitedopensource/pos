<template>
    <div>
        <header v-if="layout === 'order'" class="simple">
            <span class="qty">{{$t('text.qty')}}</span>
            <span class="item">{{$t('text.item')}}</span>
            <span class="price">{{$t('text.price')}}</span>
        </header>
        <header v-else class="info">
            <div class="bar">
                <span class="number">{{order.number}}</span>
                <span class="type" v-show="order.type">{{$t('type.'+order.type)}}</span>
                <span class="table">{{order.table}}</span>
                <span class="timePass">
                    <i class="fa fa-clock-o"></i>{{order.time | fromNow}}
                </span>
            </div>
            <div class="content" v-if="order.type === 'DINE_IN'">
                <div>
                    <span class="text">{{$t('text.guest')}}</span>
                    <span class="value">{{order.guest}}</span>
                </div>
                <div>
                    <span class="text">{{$t('text.item')}}</span>
                    <span class="value">{{$t('text.handleItem',...countItems(order.content))}}</span>
                </div>
                <div>
                    <span class="text">{{$t('text.time')}}</span>
                    <span class="value">{{order.time | moment('HH:mm:ss MM/DD/YY')}}</span>
                </div>
            </div>
            <div class="content" v-else>
                <div>
                    <span class="text">{{$t('text.phone')}}</span>
                    <span class="value">{{order.customer && order.customer.phone}}</span>
                </div>
                <div>
                    <span class="text">{{$t('text.address')}}</span>
                    <span class="value">{{order.customer && order.customer.address}}</span>
                </div>
                <div>
                    <span class="text">{{$t('text.time')}}</span>
                    <span class="value">{{order.time | moment('HH:mm:ss MM/DD/YY')}}</span>
                </div>
            </div>
        </header>
        <div class="order" @click.self="resetHighlight" v-if="layout === 'order'">
            <v-touch class="inner" :style="scroll" @panup="move" @pandown="move" @panstart="panStart" @panend="panEnd" tag="ul">
                <list-item v-for="(item,index) in cart" :data-category="item.category" :key="index" :item="item"></list-item>
            </v-touch>
        </div>
        <div class="order" v-else>
            <v-touch class="inner" :style="scroll" @panup="move" @pandown="move" @panstart="panStart" @panend="panEnd" tag="ul">
                <list-item v-for="(item,index) in cart" :data-category="item.category" :key="index" :item="item" :class="{print:!item.print,pending:item.pending}" @click.native="addToSpooler(item)"></list-item>
            </v-touch>
        </div>
        <div class="middle">
            <div class="page">
                <i class="marker fa fa-shopping-basket" @click="openMarker" v-if="layout === 'order'"></i>
                <i class="marker fa fa-print" @click="directPrint" v-else></i>
                <i class="flip fa fa-2x fa-angle-up"></i>
                <i class="flip fa fa-2x fa-angle-down"></i>
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
        <div :is="component" :init="componentData" @trigger="update"></div>
    </div>
</template>
<script>
import { mapGetters, mapActions } from 'vuex'
import dialoger from '../common/dialoger'
import itemMarker from '../menu/marker'
import listItem from './listItem'
import config from './config'
export default {
    components: { config, itemMarker, dialoger, listItem },
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
            lastDelta: 0,
            offset: 0,
            component: null,
            componentData: null,
            spooler: []
        }
    },
    mounted() {
        this.$route.name === 'Menu' && this.app.mode === 'edit' && (this.payment = this.order.payment);
        this.$route.name === 'Table' && this.order.content.length > 0 && (this.payment = this.order.payment);
        this.app.mode === 'create' && this.order.content.length > 0 && this.calculator(this.order.content);
    },
    methods: {
        resetHighlight() {
            let dom = document.querySelector('li.item.active');
            dom && dom.classList.remove('active');
            dom = document.querySelector('.sub.target');
            dom && dom.classList.remove("target");
            this.resetChoiceSet();
            this.resetPointer();
        },
        openConfig() {
            if (this.component === 'config') return;
            if (this.$route.name !== 'Menu') return;
            let taxFree = this.order.taxFree || false;
            let deliveryFree = this.order.deliveryFree || false;
            let menuID = this.config.display.menuID;
            this.$p("config", { taxFree, deliveryFree, menuID });
        },
        openMarker() {
            if (this.isEmptyTicket) return;
            this.$p("itemMarker")
        },
        addToSpooler(item) {
            if (item.print) return;
            for (let i = 0; i < this.spooler.length; i++) {
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
            order.content = this.spooler;
            order.delay = +new Date;
            Printer.setTarget('Order').print(order)
            this.spooler.forEach(item => { item.print = true })
            if (remain === 0) {
                Object.assign(this.order, {
                    print: true
                })
            } else {
                let txt = remain > 0 ? this.$t('dialog.remainPrintItem', remain) : this.$t('dialog.noRemainItem');
                this.$dialog({
                    type: 'info', title: 'dialog.itemSent', msg: ['dialog.printResult', sendItem, txt],
                    buttons: [{ text: 'button.confirm', fn: 'resolve' }]
                }).then(() => { this.$q() })
            }
            this.spooler = [];
            this.$socket.emit("[UPDATE] INVOICE", this.order)
        },
        move(e) {
            this.offset = this.lastDelta + e.deltaY;
        },
        panStart() {
            let dom = document.querySelector('.order .scrollable');
            dom && dom.classList.remove('scrollable')
        },
        panEnd() {
            let dom = document.querySelector('.order .inner');
            dom && dom.classList.add('scrollable')

            let { top, bottom, height } = dom.getBoundingClientRect();
            let offset = this.$route.name === 'Menu' ? 55 : 179;
            top -= offset;
            bottom -= offset;
            if (top > 0) {
                this.offset = 0
            } else if (height < 350) {
                this.offset = 0
            } else if (height > 350 && bottom < 335) {
                this.offset = - (height - 329)
            }
            this.lastDelta = this.offset;
        },
        update(config) {
            this.setOrder(config);
            this.calculator(this.cart);
        },
        countItems(content) {
            let count = 0;
            let undone = 0;
            content.forEach(item => {
                count += item.qty;
                !item.print && undone++;
            })
            return [count, undone]
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
            this.$nextTick(() => {
                let { type } = this.ticket;
                let total = 0;
                let subtotal = 0;
                let tax = 0;
                let delivery = 0;
                let due = 0;
                let balance = 0;
                let { tip, gratuity, discount } = this.payment;
                let coupon = this.order.coupon;
                items.forEach(item => {
                    if (item.void) return;
                    let taxClass = this.tax.class[item.taxClass];
                    let amount = item.single * item.qty;
                    item.choiceSet.forEach(set => { amount += set.single * set.qty });
                    if (!this.order.taxFree) tax += taxClass.apply[type] ? (taxClass.rate / 100 * amount) : tax;
                    subtotal += amount;
                });

                delivery = (this.ticket.type === 'DELIVERY' && this.store.delivery && !this.order.deliveryFree) ? this.store.deliveryCharge : 0;
                total = toFixed(subtotal + tax + delivery + parseFloat(tip) + parseFloat(gratuity), 2);

                if (coupon) {
                    /**
                     * Tax apply Before Discount (For Example: 10% Tax Rate, 20% Discount)
                     * 
                     * Subtotal: 10.00
                     * Tax:       1.00  
                     * Discount:  2.00
                     * Total:     9.00
                     * ------------------------------------------------------------------
                     */
                    if (coupon.discount.includes("%")) {
                        discount = toFixed((coupon.discount.replace(/\D+/, "") / 100) * (subtotal), 2);
                    } else {
                        discount = subtotal - (coupon.discount.replace(/\D+/, ''))
                    }
                }
                due = Math.max(0, total - parseFloat(discount));
                balance = due - this.payment.paid;
                this.payment = Object.assign({}, this.payment, {
                    subtotal: subtotal.toFixed(2),
                    tax: toFixed(tax, 2),
                    total: total.toFixed(2),
                    due: due.toFixed(2),
                    discount: discount.toFixed(2),
                    balance: balance.toFixed(2)
                });
                this.setOrder({ payment: this.payment });
            })
        },
        ...mapActions(['setPointer', 'resetPointer', 'resetChoiceSet', 'setChoiceSetTarget', 'setOrder'])
    },
    computed: {
        scroll() {
            return { transform: `translate3d(0,${this.offset}px,0)` }
        },
        cart() {
            return this.sort ? this.order.content.filter(item => item.sort === this.sort && !item.void) : this.order.content.filter(item => !item.void)
        },
        // voidItems() {
        //     return this.config.display.voidItem ? this.order.content.filter(item => item.void) : []
        // },
        ...mapGetters(['app', 'config', 'store', 'tax', 'order', 'item', 'ticket', 'language', 'isEmptyTicket'])
    },
    watch: {
        cart: {
            handler(n) {
                this.display ? this.payment = this.order.payment : this.calculator(n);
            }, deep: true
        },
        payment() {
            this.$nextTick(() => {
                let dom = document.querySelector('.order .inner');
                let { height } = dom.getBoundingClientRect();
                height > 329 && dom.classList.add("scrollable");
                let target = document.querySelector('.item.active');

                if (target) {
                    // let top = target.getBoundingClientRect().top;
                    // this.offset = top;
                } else {
                    this.offset = height > 329 ? 329 - height : 0;
                }
            })
        },
        'ticket.type'(n) {
            this.calculator(this.cart)
        },
        order: {
            handler(n) {
                n.content.length > 0 && (this.payment = n.payment)
            }, deep: true
        }
    }
}
</script>

<style scoped>
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
}

.number {
    font-family: 'Agency FB';
    width: 30px;
    text-align: center;
    font-weight: bold;
    text-shadow: 0 1px 1px #333;
    font-size: 22px;
}

header i {
    margin-right: 2px;
}

.bar {
    height: 26px;
    background: #03A9F4;
    display: flex;
    align-items: center;
    color: #fff;
    position: relative;
    padding: 0 5px;
    box-shadow: inset 0px -1px 3px -1px rgb(17, 116, 160);
}

.table {
    padding: 0 10px;
}

.simple .qty {
    width: 40px;
    text-align: center;
}

.simple .item {
    flex: 1;
}

.simple .price {
    width: 45px;
    text-align: center;
}

.order {
    height: 329px;
    width: 285px;
    background: hsla(0, 9%, 66%, .15);
    overflow: hidden;
}

.scrollable {
    transition: transform 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
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
    white-space: nowrap;
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
    padding-right: 5px;
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

.timePass {
    position: absolute;
    bottom: 0px;
    right: 0px;
    padding: 3px 10px;
    color: #009688;
    background: #f5f5f5;
    text-align: center;
    font-size: 12px;
    border-top-left-radius: 6px;
}

.print .itemWrap {
    width: 200px;
}

.list.print.pending {
    background: #ECEFF1;
}

.list i {
    display: none;
    padding-right: 25px;
}

.showCategory .item {
    position: relative;
}

.showCategory .item:before {
    content: attr(data-category);
    position: absolute;
    top: 0px;
    right: 0px;
    font-size: 9px;
    font-family: 'Microsoft YaHei';
    background: #009688;
    color: #fff;
    padding: 0 5px;
    -webkit-font-smoothing: antialiased;
    font-weight: lighter;
}

.driver {
    width: 275px;
    margin: 5px;
    height: 40px;
    font-size: initial;
}

.content>div {
    display: flex;
}

.content .text {
    min-width: 65px;
    text-align: right;
    padding-right: 10px;
    color: #607D8B;
}

.content {
    padding: 3px;
}

.content .value {
    color: #676767;
}
</style>