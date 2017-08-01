<template>
    <div class="menu">
        <section class="category">
            <div v-for="(category,index) in menu" @click="setCategory(index,$event)" :key="index">{{category[language]}}</div>
        </section>
        <section class="items">
            <div v-for="(item,index) in page" @click="pick(item)" :class="{disable:!item.clickable,like:item.like}" :key="index">{{item[language]}}</div>
            <div @click="itemPage = 0" v-if="items.length >= 34" class="pageButton">{{text("FIRST_PAGE")}}</div>
            <div @click="itemPage = 1" v-if="items.length >= 34" class="pageButton">{{text("SECOND_PAGE")}}</div>
            <div @click="itemPage = 2" v-if="items.length >= 34" class="pageButton">{{text("THIRD_PAGE")}}</div>
        </section>
        <section class="sides">
            <div v-for="(side,index) in sides" @click="setOption(side,index)" :key="index">{{side[language]}}</div>
        </section>
        <section class="cart">
            <order-list layout="order" @open="marker" @update="setPayment" :sort="sort"></order-list>
            <function-grid :layout="ticket.type" @trigger="fn"></function-grid>
        </section>
        <div :is="component" :init="componentData" @exit="exitComponent"></div>
    </div>
</template>
 
<script>
import { mapGetters, mapActions } from 'vuex'
import functionGrid from './menu/function'
import orderList from './common/orderList'
import dialoger from './common/dialoger'
import payment from './payment/payment'
import itemMarker from './menu/marker'
import tempItem from './menu/tempItem'
import scaleItem from './menu/scale'
import builder from './menu/builder'
import request from './menu/request'
import search from './menu/search'
import modify from './menu/modify'
import guests from './menu/guests'
import course from './menu/course'
import split from './menu/split'
import Printer from '../print'
import moment from 'moment'

export default {
    components: { functionGrid, itemMarker, orderList, modify, course, split, payment, request, dialoger, guests, builder, tempItem, scaleItem },
    created() {
        this.menuInstance = JSON.parse(JSON.stringify(this.menu));
        this.flatten(this.menuInstance[0].item);
        this.setSides(this.fillOption([]));
        this.ticket.type === 'DINE_IN' && this.config.store.table.seatOrder && (this.sort = 1);
    },
    mounted() {
        document.querySelector(".category div").classList.add("active");
    },
    data() {
        return {
            menuInstance: null,
            componentData: null,
            component: null,
            payment: null,
            itemPage: 0,
            items: [],
            sort: 0
        }
    },
    methods: {
        fn(name, params) {
            this[name](params);
        },
        flatten(items) {
            console.time("clone");
            items = [].concat.apply([], items);
            if (this.customer._id && this.customer.extra.favorite) {
                let favorite = this.customer.extra.favorite;
                items.forEach(item => {
                    item.like = favorite.includes(item._id);
                });
            }
            console.timeEnd("clone");
            this.items = items;
        },
        setCategory(i, e) {
            this.flatten(this.menuInstance[i].item);
            document.querySelector(".category .active").classList.remove("active");
            e.currentTarget.classList.add("active");
            this.itemPage = 0;
            this.setApp({ opLastAction: new Date });
        },
        pick(item) {
            if (!item.clickable) return;
            if (this.isTempItem(item)) return;
            if (this.isScalable(item)) return;
            if (this.isOpenFood(item)) return;
            item = Object.assign({}, item);
            this.poleDisplay(item.usEN.slice(0, 20), ["Price:", (item.price[0]).toFixed(2)]);
            (item.hasOwnProperty("prices") && item.prices[this.ticket.type]) && (item.price = item.prices[this.ticket.type])
            this.config.store.table.seatOrder && (item.sort = this.sort);
            this.setSides(this.fillOption(item.option));
            this.addToOrder(item);
            this.setApp({ opLastAction: new Date });
        },
        isOpenFood(item) {
            if (isNumber(item.price[0])) return false;

            let modified = new Promise((resolve, reject) => {
                this.componentData = {
                    name: item[this.language],
                    qty: 1,
                    single: 0,
                    total: "0.00",
                    discount: "0.00",
                    total: "0.00",
                    resolve, reject
                };
                this.component = "modify";
            }).then(resolve => {
                delete resolve.resolve;
                delete resolve.reject;
                item = Object.assign({}, item, {
                    single: resolve.single,
                    total: resolve.total,
                    price: [resolve.single],
                    prices: {}
                });
                this.pick(item);
                this.$q();
            }).catch(() => { this.$q() })
            return true
        },
        isTempItem(item) {
            if (!item.temporary) return false;
            this.$p("tempItem", { item });
            return true;
        },
        isScalable(item) {
            if (!item.hasOwnProperty('unitPrice')) return false;
            this.$p("scaleItem", { item });
            return true
        },
        setOption(side, index) {
            side.template ?
                this.callTemplate(side, index) :
                this.alterItemOption({ side, index });
        },
        callTemplate(side, index) {
            new Promise((resolve, reject) => {
                this.componentData = { side, resolve, reject };
                this.component = "builder";
            }).then((option) => {
                this.emptyChoiceSet();
                this.alterItemOption({ side, index, disableAutoAdd: true });
                for (let key in option) {
                    let items = option[key];
                    items.forEach(item => {
                        let content = {
                            qty: 1,
                            zhCN: item.zhCN,
                            usEN: item.usEN,
                            single: parseFloat(item.price),
                            price: item.price
                        }
                        this.setChoiceSet(content);
                    })
                }
                this.$q();
            }).catch((bool) => {
                bool && this.alterItemOption({ side, index, disableAutoAdd: true });
                this.$q();
            });
        },
        fillOption(side) {
            let length = side.length;
            let array = side.slice();
            for (let i = length; i < 11; i++) {
                array.push({ zhCN: "", usEN: "", disable: true })
            }
            return array;
        },
        less() {
            this.lessQty(this.component === 'request')
        },
        modify() {
            if (this.isEmptyOrder) return;
            if (!this.approval(this.op.modify, "price")) { this.$denyAccess(); return };
            let qty = this.item.qty;
            let single = this.item.single.toFixed(2);
            let total = (single * qty).toFixed(2);
            let discount = (this.item.discount && this.item.discount.toFixed(2)) || "0.00";
            let name = this.item[this.language];
            let modified = new Promise((resolve, reject) => {
                this.componentData = {
                    name, single, qty, discount, total, resolve, reject
                };
                this.component = "modify";
            }).then(resolve => {
                delete resolve.resolve;
                delete resolve.reject;
                let item = Object.assign(this.item, resolve);
                this.alterItem(item);
                this.$q();
            }).catch(() => { this.$q() })
        },
        course() {
            if (this.isEmptyOrder) return;
            let list = this.order.content;
            new Promise((resolve, reject) => {
                this.componentData = { list, resolve, reject };
                this.component = "course";
            }).then(resolve => {
                let _id = ObjectId();
                let order;
                switch (this.ticket.type) {
                    case "WALK_IN":
                    case "PICK_UP":
                    case "TAKE_OUT":
                    case "DELIVERY":
                        order = this.combineOrderInfo({
                            cashier: this.op.name,
                            payment: this.payment,
                            print: false
                        });
                        order.course = true;
                        order.content.forEach(item => {
                            item.pending = true
                        });
                        if (order._id) {
                            this.$socket.emit("ORDER_MODIFIED", order)
                        } else {
                            order._id = _id;
                            this.$socket.emit("ORDER_PLACED", order);
                        }
                        this.resetAll();
                        this.$router.push({ path: "/main" });
                        break;
                    case "DINE_IN":
                    case "BAR":
                    case "HIBACHI":
                        order = this.combineOrderInfo({
                            server: this.op.name,
                            table: this.currentTable.name,
                            tableID: this.currentTable._id,
                            guest: this.currentTable.current.guest,
                            payment: this.payment,
                            print
                        });
                        order.course = true;
                        order.content.forEach(item => {
                            item.pending = true
                        });
                        if (order._id) {
                            this.$socket.emit("ORDER_MODIFIED", order)
                        } else {
                            order._id = _id;
                            this.$socket.emit("DINE_IN_PLACED", {
                                table: this.currentTable,
                                order
                            });
                        }
                        this.$router.push({ name: "Table" })
                        break;
                }

                resolve.map(schedule => {
                    order = JSON.parse(JSON.stringify(order));
                    order.course = schedule.name;
                    order.delay = Number(schedule.delay);
                    order.content = schedule.contain;
                    return order;
                }).forEach(schedule => {
                    this.delayPrint(schedule);
                })
            }).catch(() => { this.$q() })
        },
        settle() {
            if (this.isEmptyOrder) return;
            let payment = JSON.parse(JSON.stringify(this.payment));
            new Promise((resolve, reject) => {
                this.componentData = { payment, resolve, reject };
                this.component = "payment";
            }).then((result) => {
                this.$q();
                this.payment = result.payment;
                this.setOrder({ settled: true });
                this.save(result.print, result.payment);
            }).catch(() => {
                this.$q();
            });
        },
        split() {
            if (this.isEmptyOrder) return;
            let order = this.combineOrderInfo({ cashier: this.op.name });
            new Promise((resolve, reject) => {
                this.componentData = { resolve, reject, order };
                this.component = "split";
            }).then((content) => {
                this.$q();
                this.setOrder({ content, split: true });
                this.save(false);
            }).catch(() => {
                this.$q();
            })
        },
        search() {

        },
        poleDisplay(line1, line2) {
            if (!this.device.poleDisplay) return;
            poleDisplay.write('\f');
            poleDisplay.write(line(line1, line2));
        },
        marker() {
            if (this.isEmptyOrder) return;
            let item = JSON.parse(JSON.stringify(this.item));
            new Promise((resolve, reject) => {
                this.componentData = { item, resolve, reject };
                this.component = 'itemMarker';
            }).then((resolve) => {
                this.alterItem(resolve);
                this.$q();
            }).catch((reject) => { this.$q() })
        },
        request() {
            if (this.isEmptyOrder || this.component === "request") {
                this.$q()
            } else {
                this.componentData = null;
                this.component = "request";
            }
        },
        save(print, payment) {
            if (this.isEmptyOrder) return;
            let order = this.combineOrderInfo({
                cashier: this.op.name,
                payment: payment || this.payment,
                print
            });
            if (print) {
                Printer.init(this.config).setJob("receipt").print(order);
                order.content = order.content.map(item => {
                    item.print = true;
                    item.pending = false;
                    return item;
                });
            }
            if (order._id) {
                this.$socket.emit("ORDER_MODIFIED", order)
            } else {
                order._id = ObjectId();
                this.$socket.emit("ORDER_PLACED", order);
            }
            if (this.ticket.type !== 'BUFFET') {
                this.resetAll();
                this.$router.push({ path: "/main" });
            } else {
                this.resetSection();
            }
        },
        done(print) {
            if (this.isEmptyOrder) return;
            let order = this.combineOrderInfo({
                server: this.op.name,
                table: this.order.table || this.currentTable.name,
                tableID: this.order.tableID || this.currentTable._id,
                guest: isNumber(this.order.guest) ? this.order.guest : this.currentTable.current.guest,
                payment: this.payment,
                print
            });
            if (print) {
                Printer.init(this.config).setJob("receipt").print(order);
                order.content = order.content.map(item => {
                    item.print = true;
                    item.pending = false;
                    return item;
                });
            }

            if (order._id) {
                this.$socket.emit("ORDER_MODIFIED", order)
            } else {
                order._id = ObjectId();
                this.$socket.emit("DINE_IN_PLACED", { table: this.currentTable, order });
            }
            this.$socket.emit("INQUIRY_TICKET_NUMBER");
            this.setOrder(order);
            this.$router.push({ name: "Table" });
        },
        setPayment(payment) {
            this.payment = payment;
        },
        combineOrderInfo(extra) {
            let order = Object.assign({}, this.order);
            let customer = Object.assign({}, this.customer);
            if (!order._id) {
                delete customer.extra;
                order.customer = customer;
                order.type = this.ticket.type;
                order.number = this.ticket.number;
                order.station = this.station.alies;
                order.source = "POS";
                order.modify = 0;
                order.status = 1;
                order.time = +new Date;
                order.date = moment().subtract(4, 'hours').format("YYYY-MM-DD");
            } else {
                order.lastEdit = +new Date;
                order.editor = this.op.name;
                order.payment = this.payment;
                order.modify++;
            }
            Object.assign(order, extra);
            return order;
        },
        switchLanguage() {
            let language = this.app.language === "usEN" ? "zhCN" : "usEN";
            moment.locale(language === 'usEN' ? 'en' : 'zh-cn');
            this.$setLanguage(language);
            this.setApp({ language });
        },
        switchGuest() {
            let guest = this.currentTable.current.guest;
            let current = this.sort;
            if (guest <= 1) return;
            new Promise((resolve, reject) => {
                this.componentData = { current, guest, resolve, reject };
                this.component = "guests";
            }).then(result => {
                if (result.hasOwnProperty('component')) {
                    this.split();
                } else {
                    this.sort = ~~result.guest;
                    this.$q();
                }
            }).catch(() => { this.$q() })
        },
        exitComponent() {
            this.componentData = null;
            this.component = null;
        },
        exitConfirm() {
            this.isEmptyOrder ? this.exit() : this.$dialog({ title: 'EXIT_CFM', msg: 'TIP_EXIT_CFM' }).then(() => { this.exit() }).catch(() => { this.$q() })
        },
        exit() {
            let type = this.ticket.type;
            if (this.currentTable && this.currentTable.current.invoice.length === 0) {
                console.log(this.app)
                this.resetCurrentTable();
                this.$socket.emit("TABLE_MODIFIED", this.currentTable);
            }
            this.resetAll();
            this.setApp({ opLastAction: new Date });
            this.$router.push({ path: "/main" });
        },
        resetSection() {
            this.$q();
            this.resetMenu();
            this.flatten(this.menuInstance[0].item);
            this.setSides(this.fillOption([]));
            document.querySelector(".category .active").classList.remove("active");
            document.querySelector(".category div").classList.add("active");
            this.setApp({ opLastAction: new Date });
        },
        ...mapActions(['setApp',
            'lessQty',
            'moreQty',
            'setOrder',
            'setSides',
            'resetMenu',
            'alterItem',
            'addToOrder',
            'delayPrint',
            'setChoiceSet',
            'setTableInfo',
            'emptyChoiceSet',
            'resetCurrentTable',
            'alterItemOption',
            'resetAll'])
    },
    computed: {
        page() {
            if (this.items.length > 33) {
                let min = this.itemPage * 30;
                let max = min + 30;
                return this.items.slice(min, max);
            }
            return this.items
        },
        ...mapGetters(['op', 'app', 'config', 'order', 'menu', 'sides', 'item', 'ticket', 'customer', 'currentTable', 'station', 'language', 'isEmptyOrder', 'device'])
    }
}
</script>

<style></style>