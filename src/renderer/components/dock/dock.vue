<template>
    <transition name="slideDown" appear>
        <header class="dock">
            <span class="number">{{ticket.number}}</span>
            <span class="type" v-show="ticket.type" @click="changeType">{{type}}</span>
            <div class="info">
                <div class="customer" v-if="$route.name === 'Menu'" @click="editCustomer">
                    <span class="phone" v-show="customer.phone">{{customer.phone | phone}}</span>
                    <span class="address" v-show="customer.address">{{customer.address}}</span>
                    <span class="name" v-show="customer.name">{{customer.name}}</span>
                </div>
            </div>
            <div class="op" @click="openPanel" v-show="op._id">
                <i class="fa fa-user-circle"></i>
                <span>{{op.name}}</span>
            </div>
            <div class="misc">
                <div class="clock" v-show="$route.name !== 'Dashboard'">
                    <span class="time">{{time | moment('hh:mm')}}</span>
                    <span class="shift">{{time | moment('a')}}</span>
                </div>
                <div class="status" v-show="$route.name === 'Dashboard'">
                    <i class="fa fa-phone-square" :class="{na:!device.callid}"></i>
                    <i class="fa fa-credit-card" :class="{na:!device.terminal}"></i>
                    <i class="fa fa-desktop" :class="{na:!device.poleDisplay}"></i>
                    <i class="fa fa-print spooler" v-show="spooler.length > 0" @click="messageCenter(true)"></i>
                    <i class="fa fa-globe" :class="{na:!device.online}"></i>
                    <i class="fa fa-sitemap" :class="{na:!app.database}"></i>
                </div>
            </div>
            <div :is="component" :init="componentData"></div>
        </header>
    </transition>
</template>

<script>
import { mapGetters, mapActions } from "vuex"
import dialoger from '../common/dialoger'
import { ipcRenderer } from 'electron'
import messenger from './messenger'
import switcher from './switcher'
import Printer from '../../print'
import caller from './caller'
import panel from './panel'
import disc from './disc'
export default {
    components: { caller, switcher, dialoger, panel, disc, messenger },
    data() {
        return {
            componentData: null,
            component: null
        }
    },
    computed: {
        type() {
            let type = this.app.mode === 'create' ? 'type.' + this.ticket.type : 'type.' + this.order.type;
            return this.ticket.type === 'DINE_IN'
                ? this.$t(type, this.app.language) + (this.order.table ? ' - ' + this.order.table + (this.order.guest > 0 ? ' - ' + this.order.guest : '') : '')
                : this.$t(type, this.app.language);
        },
        ...mapGetters(['op', 'app', 'time', 'ring', 'order', 'config', 'ticket', 'device', 'history', 'station', 'spooler', 'customer', 'language', 'currentTable'])
    },
    watch: {
        ring(caller) {
            caller ? this.$socket.emit('[RING] CALLER_ID', String(caller.number)) : this.$q()
        },
        time(tick) {
            this.app.autoLock && this.$route.name !== 'Lock' && this.sessionTimeout(tick);
            this.spooler.length > 0 && tick > this.spooler[0].delay && this.printFromSpooler(0);
        }
    },
    methods: {
        openPanel() {
            this.$route.name === 'Dashboard' && this.$p('panel')
        },
        messageCenter(view) {
            this.$route.name === 'Dashboard' && this.$p('messenger', { view })
        },
        changeType() {
            this.$route.name === 'Menu' && this.$p('switcher')
        },
        sessionTimeout(current) {
            let lapse = Math.round((current - this.app.lastActivity) / 1000);
            if (lapse >= this.station.timeout) {
                this.setApp({ autoLock: false })
                this.$dialog({
                    title: 'dialog.autoLock', msg: ['dialog.autoLockTip', this.station.timeout],
                    timeout: { fn: 'resolve', duration: 10000 }, buttons: [{ text: 'button.extend', fn: 'reject' }]
                }).then(() => {
                    this.$q();
                    this.doubleCheck();
                    this.resetAll();
                    this.$router.push({ path: '/main/lock' })
                }).catch(() => {
                    this.$q();
                    this.setApp({ lastActivity: +new Date(), autoLock: true })
                })
            }
        },
        doubleCheck() {
            if (this.$route.name === 'Menu' && this.app.mode === 'create' && this.ticket.type === 'DINE_IN') {
                this.resetCurrentTable();
                this.$socket.emit("TABLE_MODIFIED", this.currentTable);
            }
            if (this.order.pending) {
                Object.assign(this.order, { pending: false })
                this.$socket.emit("[UPDATE] INVOICE", this.order)
            }
        },
        printFromSpooler(i) {
            let _id = this.spooler[i]._id;
            let items = [];
            this.spooler[i].content.forEach(item => { items.push(item.unique) });
            Printer.init(this.config).setJob("receipt").print(this.spooler[0]);
            this.removeSpooler(i);
            let index = this.history.findIndex(order => order._id === _id);
            let order = Object.assign({}, this.history[index]);
            items.forEach(unique => {
                for (let i = 0; i < order.content.length; i++) {
                    if (order.content[i].unique === unique) {
                        order.content[i].print = true;
                        order.content[i].pending = false;
                        break;
                    }
                }
            });
            let isPrint = true;
            order.content.forEach(item => {
                delete item.new;
                !item.print && (isPrint = false)
            })
            order.print = isPrint;
            this.$socket.emit("[UPDATE] INVOICE", order);
        },
        editCustomer() {
            this.$route.name === 'Menu' && this.$router.push({ name: 'Information' })
        },
        ...mapActions(['setApp',
            'resetAll',
            'setTicket',
            'setCustomer',
            'updateTable',
            'syncTables',
            'newPhoneCall',
            'removeSpooler',
            'insertOrder',
            'updateOrder',
            'setTodayOrder',
            'setAddressDistance',
            'updateRequestCategory',
            'updateRequestAction',
            'updateRequestItem',
            'removeRequestItem',
            'updateMenuCategory',
            'resortMenuCategory',
            'updateMenuItem',
            'removeMenuItem',
            'updateTableSection',
            'updateTableInfo',
            'newReservation',
            'updateReservation',
            'resetCurrentTable',
            'setReservation',
            'setLastSync'])
    },
    sockets: {
        connect() {
            this.component === 'disc' && this.$q();
            this.setApp({ database: true })
            this.$socket.emit('[INQUIRY] TICKET_NUMBER', number => { this.setTicket({ number }) })
        },
        TICKET_NUMBER(number) { this.app.mode !== 'edit' && this.setTicket({ number }) },
        UPDATE_TABLE_STATUS(data) { this.updateTable(data) },
        INSERT_ORDER(data) { this.insertOrder(data) },
        UPDATE_ORDER(data) { this.updateOrder(data) },
        SYNC_ORDERS(data) { this.setTodayOrder(data) },
        SYNC_TABLES(data) { this.syncTables(data) },
        REQUEST_CATEGORY_UPDATE(data) { this.updateRequestCategory(data) },
        REQUEST_ACTION_UPDATE(data) { this.updateRequestAction(data) },
        REQUEST_ITEM_UPDATE(data) { this.updateRequestItem(data) },
        REQUEST_ITEM_REMOVE(data) { this.removeRequestItem(data) },
        MENU_CATEGORY_UPDATE(data) { this.updateMenuCategory(data) },
        MENU_CATEGORY_RESORT(data) { this.resortMenuCategory(data) },
        MENU_ITEM_UPDATE(data) { this.updateMenuItem(data) },
        MENU_ITEM_REMOVE(data) { this.removeMenuItem(data) },
        UPDATE_TABLE_SECTION(data) { this.updateTableSection(data) },
        UPDATE_TABLE_INFO(data) { this.updateTableInfo(data) },
        NEW_RESERVATION(data) { this.newReservation(data) },
        UPDATE_RESERVATION(data) { this.updateReservation(data) },
        SYNC_RESERVATIONS(data) { this.setReservation(data) },
        GOOGLE_ADDRESS_DISTANCE(data) { this.setAddressDistance(data) },
        SHUTDOWN() { ipcRenderer.send("Shutdown") },
        CALLER_ID(customer) {
            this.newPhoneCall(customer)
            this.$p("caller", { customer })
        },
        disconnect() {
            this.setApp({ database: false })
            this.$p("disc")
        }
    }
}
</script>