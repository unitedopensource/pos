<template>
    <div class="wrap">
        <header>
            <div>
                <h3>{{$t('text.pickUpList')}}</h3>
                <h5>{{$t('text.remainTicket',invoices.length)}}</h5>
            </div>
        </header>
        <section class="content">
            <ul class="list">
                <li v-for="(invoice,index) in invoices" :key="index" @click="display(invoice)">
                    <div class="ticket">
                        <span class="number">{{invoice.number}}</span>
                        <span class="time">{{invoice.time | moment('HH:mm')}}</span>
                    </div>
                    <div class="info">
                        <span>{{invoice.customer.phone | phone}}</span>
                        <span>{{invoice.customer.name}}</span>
                    </div>
                    <span class="amount">$ {{invoice.payment.due}}</span>
                </li>
            </ul>
            <aside>
                <order-list layout="display" :display="true"></order-list>
                <div class="function">
                    <button class="btn" @click="edit">
                        <i class="fa fa-list-alt"></i>
                        <span class="text">{{$t("button.edit")}}</span>
                    </button>
                    <div class="btn" @click="settle">
                        <i class="fa fa-print"></i>
                        <span class="text">{{$t("button.payment")}}</span>
                    </div>
                    <div class="btn" @click="print">
                        <i class="fa fa-print"></i>
                        <span class="text">{{$t("button.print")}}</span>
                    </div>
                    <div class="btn" @click="split">
                        <i class="fa fa-clone"></i>
                        <span class="text">{{$t("button.split")}}</span>
                    </div>
                    <div class="btn" @click="exit">
                        <i class="fa fa-times"></i>
                        <span class="text">{{$t("button.exit")}}</span>
                    </div>
                    <div class="btn" @click="voidTicket">
                        <i class="fa fa-ban"></i>
                        <span class="text">{{$t("button.void")}}</span>
                    </div>
                </div>
            </aside>
        </section>
        <div :is="component" :init="componentData"></div>
    </div>
</template>

<script>
import orderList from './common/orderList'
import payment from './payment/payment'
import Printer from '../print'
import split from './menu/split'
import reason from './history/reason'
import dialoger from './common/dialoger'
import { mapGetters, mapActions } from 'vuex'
export default {
    components: { orderList, payment, split, reason, dialoger },
    data() {
        return {
            componentData: null,
            component: null,
            page: 0
        }
    },
    methods: {
        display(ticket) {
            this.setOrder(JSON.parse(JSON.stringify(ticket)))
        },
        edit() {
            this.setTicket({ type: this.order.type, number: this.order.number });
            this.setApp({ mode: 'edit' });
            this.setCustomer(this.order.customer);
            this.$router.push({ path: '/main/menu' });
        },
        settle() {
            this.$p("payment")
        },
        print() {
            let order = JSON.parse(JSON.stringify(this.order))
            Printer.init(this.config).setJob("receipt").print(order);
            order.content.forEach(item => {
                delete item.new;
                item.print = true;
                item.pending = false;
            })
            this.$socket.emit("[UPDATE] INVOICE", order);
        },
        split() {
            this.$p("split")
        },
        voidTicket() {
            this.$dialog({
                type: "warning",
                title: ['dialog.voidOrderConfirm', this.order.number, this.$t('type.' + this.order.type)],
                msg: 'dialog.voidOrderConfirmTip',
                buttons: [{ text: 'button.cancel', fn: 'reject' }, { text: 'button.delete', fn: 'resolve' }]
            }).then(confirm => { this.$p("reason") }).catch(() => { this.$q() })
        },
        exit() {
            this.resetMenu();
            this.$router.push({ path: '/main' })
        },
        ...mapActions(['setApp', 'setTicket', 'setOrder', 'setCustomer', 'resetMenu'])

    },
    filters: {
        phone(number) {
            return number.replace(/^\D?(\d{3})\D?\D?(\d{3})\D?(\d{4})/, "($1) $2-$3")
        }
    },
    computed: {
        invoices() {
            return this.history.filter(ticket => ticket.status === 1 && !ticket.settled && (ticket.type === 'WALK_IN' || ticket.type === 'PICK_UP'))
        },
        ...mapGetters(['config', 'order', 'history'])
    }
}
</script>

<style scoped>
.wrap {
    display: flex;
    flex-direction: column;
    height: 738px;
    margin-top: 30px;
    width: 100%;
    background: url(../assets/image/grid.png) #ebeff1;
}

header {
    height: 70px;
    background: #234c75;
    color: #fff;
}
header div{
    margin:14px;
}
.content {
    display: flex;
    flex: 1;
}

ul {
    flex: 1;
    display: flex;
    flex-direction: column;
}

.function {
    width: 282px;
}

li {
    display: flex;
    width: 370px;
    background: #fff;
    margin: 2px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
}

li>* {
    display: flex;
    flex-direction: column;
    padding: 5px 10px;
}

.ticket {
    width: 60px;
    align-items: center;
    background: #009688;
    color: #fff;
}

ul.list .info {
    flex: 1;
    justify-content: center;
    font-size: 20px;
}

span.number {
    font-size: 32px;
    font-family: 'Agency FB';
    font-weight: bold;
}

.amount {
    justify-content: center;
}
</style>