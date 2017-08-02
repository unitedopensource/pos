<template>
    <div class="menu">
        <!-- <section class="category">
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
            <order-list layout="order" @update="setPayment" :sort="sort"></order-list>
            <grids :layout="ticket.type"></grids>
        </section>
        <div :is="component" :init="componentData" @open="openComponent"></div> -->
    </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import orderList from '../common/orderList'
import dialoger from '../common/dialoger'
import Printer from '../../print'
import request from './request'
import modify from './modify'
import course from './course'
import grids from './grids'

export default {
    components: { modify, course, request, orderList, dialoger },
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
    created() {
        console.log("trigger",this.menu)
        this.menuInstance = JSON.parse(JSON.stringify(this.menu));
        this.flatten(this.menuInstance[0].item);
        this.setSides(this.fillOption([]));
        this.ticket.type === 'DINE_IN' && this.config.store.table.seatOrder && (this.sort = 1);
    },
    mounted() {
        //toggleClass(".category div", "active");
    },
    methods: {
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
        fillOption(side) {
            let length = side.length;
            let array = side.slice();
            for (let i = length; i < 11; i++) {
                array.push({ zhCN: "", usEN: "", disable: true })
            }
            return array;
        },
        poleDisplay() {
            if (this.device.poleDisplay) {
                poleDisplay.write('\f');
                poleDisplay.write(line(line1, line2));
            }
        },
        setCategory(i, e) {
            toggleClass(".category .active", "active");
            toggleClass(e.currentTarget, "active");
            this.itemPage = 0;
            this.flatten(this.menuInstance[i].item);
            this.setApp({ opLastAction: new Date });
        },
        setSides() {

        },
        pick(item) {
            if (!item.clickable) return;
            if (this.isTemporary(item)) return;
            if (this.isScalable(item)) return;
            if (this.isOpenFood(item)) return;

            item = Object.assign({}, item);
            this.poleDisplay(item.usEN.slice(0, 20), ["Price:", (item.price[0]).toFixed(2)]);
            this.store.table.seatOrder && (item.sort = this.sort);
            (item.hasOwnProperty("prices") && item.prices[this.ticket.type]) && (item.price = item.prices[this.ticket.type]);
            this.setSides(this.fillOption(item.option))
        },
        openComponent(name, args) {
            switch (name) {
                case "modify":
                    this.$p("modify", { item: JSON.parse(JSON.stringify(this.item)) });
                    break;
                case "course":
                    this.$p("course", { order: JSON.parse(JSON.stringify(this.order)) });
                    break;
                case "takeoutExit":
                    this.isEmptyTicket ?
                        this.exit() :
                        this.$dialog({ title: 'EXIT_CFM', msg: 'TIP_EXIT_CFM' }).then(() => { this.exit() }).catch(() => { this.$q() })
                    break;
                case "dineinExit":
                    this.isEmptyTicket ?
                        this.exit() :
                        this.resetExit();
                    break;
            }
        },
        resetExit() {
            if (this.currentTable && this.currentTable.current.invoice.length === 0) {
                this.resetCurrentTable();
                this.$socket.emit("TABLE_MODIFIED", this.currentTable);
            }
            this.exit();
        },
        exit() {
            this.resetAll();
            this.setApp({ opLastAction: new Date });
            this.$router.push({ path: "/main" });
        },
        ...mapActions(['setApp', 'setSides', 'resetAll', 'resetCurrentTable'])
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
        ...mapGetters(['op','menu', 'item', 'sides', 'ticket', 'course', 'customer', 'station', 'currentTable', 'isEmptyTicket'])
    }
}