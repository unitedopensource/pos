<template>
    <div class="menu">
        <section class="category">
            <div v-for="(category,index) in menu" @click="setCategory(index,$event)" :key="index">{{category[language]}}</div>
        </section>
        <section class="items">
            <div v-for="(item,index) in page" @click="pick(item)" :class="{disable:!item.clickable}" :key="index">{{item[language]}}</div>
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
import moment from 'moment'
import Printer from '../print'
import functionGrid from './menu/function'
import orderList from './common/orderList'
import dialoger from './common/dialoger'
import payment from './payment/payment'
import itemMarker from './menu/marker'
import request from './menu/request'
import builder from './menu/builder'
import search from './menu/search'
import modify from './menu/modify'
import guests from './menu/guests'
import course from './menu/course'
import split from './menu/split'

export default {
    created() {
        this.items = [].concat.apply([], this.menu[0].item);
        this.setSides(this.fillOption([]));
        this.ticket.type === 'DINE_IN' && this.configuration.store.table.seatOrder && (this.sort = 1);
    },
    mounted() {
        document.querySelector(".category div").classList.add("active");
    },
    data() {
        return {
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
        setCategory(i, e) {
            this.items = [].concat.apply([], this.menu[i].item);
            document.querySelector(".category .active").classList.remove("active");
            e.currentTarget.classList.add("active");
            this.itemPage = 0;
            this.recordAction();
        },
        pick(item) {
            if (!item.clickable) {
                //this.$toast()
                return;
            }
            this.poleDisplay(item.usEN.slice(0, 20), ["Price:", (item.price[0]).toFixed(2)]);

            item = Object.assign({}, item);
            (item.hasOwnProperty("prices") && item.prices[this.ticket.type]) && (item.price = item.prices[this.ticket.type])
            this.configuration.store.table.seatOrder && (item.sort = this.sort);
            this.setSides(this.fillOption(item.option));
            this.addToOrder(item);
            this.recordAction();
        },
        setOption(side, index) {
            side.template ?
                this.callBuilder(side, index) :
                this.alterItemOption({ side, index });
        },
        callBuilder(side, index) {
            new Promise((resolve, reject) => {
                this.componentData = { side, resolve, reject };
                this.component = "builder";
            }).then(option => {
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
                this.$exitComponent();
            }).catch(bool => {
                bool && this.alterItemOption({ side, index, disableAutoAdd: true });
                this.$exitComponent()
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
                this.$exitComponent();
            }).catch(exit => {
                exit === "reload" ?
                    this.modify() :
                    this.$exitComponent();
            })
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
            }).catch(() => {
                this.$exitComponent();
            })
        },
        settle() {
            if (this.isEmptyOrder) return;
            this.payment.due = this.payment.hasOwnProperty('due') ?
                this.payment.due :
                this.payment.total + this.payment.tip + this.payment.gratuity - this.payment.discount;

            this.poleDisplay("TOTAL DUE:", ["", parseFloat(this.payment.due).toFixed(2)])

            new Promise((resolve, reject) => {
                this.componentData = {
                    payment: this.payment,
                    resolve, reject
                };
                this.component = "payment";
            }).then(result => {
                this.$exitComponent();
                this.payment = result.payment;
                this.setOrder({ settled: true });
                this.save(result.print, result.payment);
            }).catch(() => {
                delete this.payment.due;
                this.payment.log = [];
                this.$exitComponent();
            });
        },
        split() {
            if (this.isEmptyOrder) return;
            let order = this.combineOrderInfo({ cashier: this.op.name });
            new Promise((resolve, reject) => {
                this.componentData = { resolve, reject, order };
                this.component = "split";
            }).then(content => {
                this.$exitComponent();
                this.setOrder({
                    content,
                    split: true
                });
                this.save(false);
            }).catch(() => {
                this.$exitComponent();
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
            }).then(resolve => {
                this.alterItem(resolve);
                this.$exitComponent();
            }).catch(reject => {
                this.$exitComponent();
            })
        },
        request() {
            if (this.isEmptyOrder || this.component === "request") {
                this.$exitComponent();
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
                Printer.init(this.configuration).setJob("receipt").print(order);
                order.content = order.content.map(item => {
                    item.print = true;
                    item.pending = false;
                    return item;
                });
            }
            console.log(this.payment);

            if (order._id) {
                this.$socket.emit("ORDER_MODIFIED", order)
            } else {
                order._id = ObjectId();
                this.$socket.emit("ORDER_PLACED", order);
            }
            this.resetAll();
            this.$router.push({ path: "/main" });
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
                Printer.init(this.configuration).setJob("receipt").print(order);
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
                this.$socket.emit("DINE_IN_PLACED", {
                    table: this.currentTable,
                    order
                });
            }
            this.$socket.emit("INQUIRY_TICKET_NUMBER");
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
                order.time = String(+new Date);
                order.date = moment().subtract(4, 'hours').format("YYYY-MM-DD");
            } else {
                order.lastEdit = String(+new Date());
                order.editor = this.op.name;
                order.payment = this.payment;
                order.modify++;
            }
            Object.assign(order, extra);
            return order;
        },
        switchLanguage() {
            let language = this.application.language === "usEN" ? "zhCN" : "usEN";
            moment.locale(language === 'usEN' ? 'en' : 'zh-cn');
            this.$setLanguage(language);
            this.setApplication({ language });
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
                    console.log(this.order)
                    this.split();
                } else {
                    this.sort = ~~result.guest;
                    this.$exitComponent();
                }
            }).catch(() => {
                this.$exitComponent();
            })
        },
        recordAction() {
            this.setApplication({
                opLastAction: new Date
            });
        },
        exitComponent() {
            this.componentData = null;
            this.component = null;
        },
        exitConfirm() {
            this.isEmptyOrder ?
                this.exit() :
                this.$dialog({
                    title: 'EXIT_CFM',
                    msg: 'TIP_EXIT_CFM',
                    buttons: [{
                        text: 'CANCEL',
                        fn: 'reject'
                    }, {
                        text: 'CONFIRM',
                        fn: 'resolve'
                    }]
                }).then(() => {
                    this.exit();
                }).catch(() => {
                    this.$exitComponent();
                })
        },
        exit() {
            if (this.currentTable && this.currentTable.current.invoice.length === 0) {
                this.setTableInfo({
                    guest: 0,
                    server: "",
                    time: "",
                    status: 1,
                    current: {
                        guest: 0,
                        server: "",
                        time: "",
                        invoice: [],
                        group: "",
                        color: ""
                    }
                });
                this.$socket.emit("TABLE_MODIFIED", this.currentTable);
            }
            this.resetAll();
            this.recordAction();
            this.$router.push({ path: "/main" });
        },
        ...mapActions(['setApplication',
            'lessQty',
            'moreQty',
            'addToOrder',
            'alterItem',
            'alterItemOption',
            'setSides',
            'setChoiceSet',
            'emptyChoiceSet',
            'setTableInfo',
            'setOrder',
            'delayPrint',
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
        ...mapGetters(['configuration', 'application', 'order', 'op', 'customer', 'currentTable', 'menu', 'sides', 'item', 'ticket', 'station', 'language', 'isEmptyOrder', 'device'])
    },
    components: {
        functionGrid, itemMarker, orderList, modify, course, split, payment, request, dialoger, guests, builder,
    }
}
</script>

<style></style>