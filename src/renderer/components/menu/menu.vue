<template>
    <div class="menu">
        <section class="category">
            <div v-for="(category,index) in menu" @click="setCategory(index,$event)" :key="index">{{category[language]}}</div>
        </section>
        <section class="items" v-if="config.display.menuID">
            <div v-for="(item,index) in page" @click="pick(item)" :class="{disable:!item.clickable,like:item.like}" :key="index" :data-menuID="item.menuID">{{item[language]}}</div>
            <div @click="itemPage = 0" v-if="items.length >= 34" class="pageButton">{{$t("button.firstPage")}}</div>
            <div @click="itemPage = 1" v-if="items.length >= 34" class="pageButton">{{$t("button.secondPage")}}</div>
            <div @click="itemPage = 2" v-if="items.length >= 34" class="pageButton">{{$t("button.thirdPage")}}</div>
        </section>
        <section class="items" v-else>
            <div v-for="(item,index) in page" @click="pick(item)" :class="{disable:!item.clickable,like:item.like}" :key="index">{{item[language]}}</div>
            <div @click="itemPage = 0" v-if="items.length >= 34" class="pageButton">{{$t("button.firstPage")}}</div>
            <div @click="itemPage = 1" v-if="items.length >= 34" class="pageButton">{{$t("button.secondPage")}}</div>
            <div @click="itemPage = 2" v-if="items.length >= 34" class="pageButton">{{$t("button.thirdPage")}}</div>
        </section>
        <section class="sides">
            <div v-for="(side,index) in sides" @click="setOption(side,index)" :key="index">{{side[language]}}</div>
        </section>
        <section class="cart">
            <order-list layout="order" :sort="sort"></order-list>
            <grids :layout="ticket.type" @open="openComponent"></grids>
        </section>
        <div :is="component" :init="componentData" @execute="fn"></div>
    </div>
</template> 

<script>
import { mapGetters, mapActions } from 'vuex'
import orderList from '../common/orderList'
import dialoger from '../common/dialoger'
import payment from '../payment/payment'
import Printer from '../../print'
import tempItem from './tempItem'
import request from './request'
import scaleItem from './scale'
import builder from './builder'
import guests from './guests'
import modify from './modify'
import course from './course'
import timer from './timer'
import grids from './grids'
import split from './split'
export default {
    components: { modify, course, request, orderList, dialoger, grids, payment, scaleItem, split, builder, tempItem, timer, guests },
    data() {
        return {
            menuInstance: null,
            componentData: null,
            component: null,
            itemPage: 0,
            items: [],
            sort: 0
        }
    },
    created() {
        this.initial();
    },
    mounted() {
        toggleClass(".category div", "active");
        this.app.mode === 'edit' && this.resetPointer();
    },
    methods: {
        initial() {
            this.menuInstance = JSON.parse(JSON.stringify(this.menu));
            this.flatten(this.menuInstance[0].item);
            this.setSides(this.fillOption([]));
            this.$socket.emit('[INQUIRY] TICKET_NUMBER', number => { this.app.mode === 'create' && this.setTicket({ number }) });
            this.app.mode === 'create' && this.ticket.type === 'DINE_IN' && this.configDineIn();
            this.app.mode === 'create' && this.setOrder({
                _id: ObjectId(),
                server: this.op.name,
                station: this.station.alies,
                type: this.ticket.type
            });
        },
        flatten(items) {
            console.time("clone");
            items = [].concat.apply([], items);

            if (this.config.hasOwnProperty('display') && this.config.display.favorite &&
                this.customer._id && this.customer.hasOwnProperty('extra') && this.customer.extra.favorite) {
                let favorite = this.customer.extra.favorite;
                items.forEach(item => { item.like = favorite.includes(item._id) });
            }
            console.timeEnd("clone");
            this.items = items;
        },
        fillOption(side) {
            let length = side.length;
            let array = side.slice();
            for (let i = length; i < 11; i++) {
                array.push({ zhCN: "", usEN: "", disable: true })
            }
            return array;
        },
        configDineIn() {
            this.store.table.seatOrder && (this.sort = 1);
            this.setOrder({
                table: this.currentTable.name,
                tableID: this.currentTable._id,
                guest: this.currentTable.guest,
                session: this.currentTable.session,
                type: this.ticket.type
            })
        },
        poleDisplay(line1, line2) {
            if (this.device.poleDisplay) {
                poleDisplay.write('\f');
                poleDisplay.write(line(line1, line2));
            }
        },
        setCategory(i, e) {
            toggleClass(".category .active", "active");
            e.currentTarget.classList.add("active");
            this.itemPage = 0;
            this.flatten(this.menuInstance[i].item);
        },
        pick(item) {
            if (!item.clickable) return;
            if (this.isTemporary(item)) return;
            if (this.isScalable(item)) return;
            if (this.isOpenFood(item)) return;

            item = JSON.parse(JSON.stringify(item));
            this.app.mode === 'edit' && (item.new = true);
            this.poleDisplay(item.usEN.slice(0, 20), ["Price:", (item.price[0]).toFixed(2)]);
            this.store.table.seatOrder && (item.sort = this.sort);
            (item.hasOwnProperty("prices") && item.prices[this.ticket.type]) && (item.price = item.prices[this.ticket.type]);
            this.setSides(this.fillOption(item.option));
            this.addToOrder(item);
        },
        isTemporary(item) {
            if (!item.temporary) return false;
            this.$p("tempItem", { item });
            return true
        },
        isScalable(item) {
            if (!item.hasOwnProperty('unitPrice')) return false;
            this.$p("scaleItem", { item });
            return true
        },
        isOpenFood(item) {
            if (isNumber(item.price[0])) return false;
            this.$p("modify", { item, openFood: true });
            return true
        },
        setOption(side, index) {
            side.template ? this.callTemplate(side, index) : this.alterItemOption({ side, index });
        },
        callTemplate(side, index) {
            this.$p("builder", { side, index });
        },
        openComponent(name, args) {
            switch (name) {
                case "modify":
                    this.$p("modify", { item: this.item });
                    break;
                case "course":
                    this.$p("course", { order: this.order });
                    break;
                case "timer":
                    this.$p("timer", { order: this.order });
                    break;
                case "search":
                    break;
                case "request":
                    this.component === 'request' ? this.$q() : this.component = "request";
                    break;
                case "settle":
                    this.$p("payment");
                    break;
                case "split":
                    this.$p("split", { order: this.order });
                    break;
                case "guest":
                    this.switchGuest()
                    break;
                case "dineinExit":
                    this.isEmptyTicket ? this.resetTableExit() : this.$dialog({ title: 'dialog.exitConfirm', msg: 'dialog.exitConfirmTip' }).then(() => { this.resetTableExit() }).catch(() => { this.$q() });
                    break;
                case "exit":
                    this.isEmptyTicket ? this.exit() : this.$dialog({ title: 'dialog.exitConfirm', msg: 'dialog.exitConfirmTip' }).then(() => { this.exit() }).catch(() => { this.$q() })
                    break;
            }
        },
        fn(name) {
            this[name]();
        },
        resetSection() {
            this.resetMenu();
            this.flatten(this.menuInstance[0].item);
            this.setSides(this.fillOption([]));
            toggleClass(".category .active", "active");
            toggleClass(".category div", "active");
        },
        resetTableExit() {
            this.app.mode === 'create' && this.$socket.emit("[TABLE] RESET", { _id: this.currentTable._id });
            this.exit();
        },
        switchGuest() {
            let guest = this.order.guest || 1
            new Promise((resolve, reject) => {
                this.componentData = { resolve, reject, guest }
                this.component = "guests"
            }).then((callback) => {
                this.$q()
                console.log(callback)

            }).catch(() => { this.$q() })
        },
        exit() {
            this.resetAll();
            this.setApp({ mode: "create" });
            this.$router.push({ path: "/main" });
        },
        ...mapActions(['setApp', 'setOrder', 'setTicket', 'setSides', 'addToOrder', 'resetPointer', 'resetMenu', 'resetAll', 'alterItemOption', 'resetCurrentTable'])
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
        ...mapGetters(['op', 'app', 'config', 'menu', 'item', 'device', 'sides', 'store', 'ticket', 'order', 'course', 'customer', 'language', 'station', 'currentTable', 'isEmptyTicket'])
    }
}
</script>