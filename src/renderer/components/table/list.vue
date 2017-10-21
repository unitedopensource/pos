<template>
    <div class="popupMask center dark" @click.self="init.reject">
        <div class="window">
            <header class="title">
                <span>{{$t('title.orderList')}}</span>
                <i class="fa fa-times" @click="init.reject"></i>
            </header>
            <div class="innner">
                <table>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>{{$t('thead.table')}}</th>
                            <th>{{$t('thead.server')}}</th>
                            <th>{{$t('thead.placeTime')}}</th>
                            <th>{{$t('thead.lapse')}}</th>
                            <th>{{$t('thead.total')}}</th>
                            <th>{{$t('thead.todo')}}</th>
                            <th>{{$t('thead.action')}}</th>
                            <th>{{$t('thead.view')}}</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(invoice,index) in invoices" :key="index">
                            <td>{{invoice.number}}</td>
                            <td>{{invoice.table}}</td>
                            <td>{{invoice.server}}</td>
                            <td>{{invoice.time | moment('HH:mm')}}</td>
                            <td>{{invoice.time | fromNow}}</td>
                            <td>$ {{invoice.payment.due | decimal}}</td>
                            <td>{{todo(invoice.content)}} / {{invoice.content.length}}</td>
                            <td>
                                <span class="paid" @click="settle(invoice)">{{$t('button.payment')}}</span>
                            </td>
                            <td>
                                <i class="fa fa-file-text-o" @click="view(invoice)"></i>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
        <div class="popupMask center dark" v-show="component">
            <div :is="component" :init="componentData"></div>
        </div>
    </div>
</template>

<script>
import { mapGetters } from 'vuex'
import ticket from '../common/ticket'
import payment from '../payment/index'
export default {
    props: ['init'],
    components: { ticket, payment },
    data() {
        return {
            invoices: [],
            componentData: null,
            component: null
        }
    },
    computed: {
        ...mapGetters(['op', 'history'])
    },
    created() {
        let approval = this.approval(this.op.view, "invoices");

        this.invoices = approval ?
            this.history.filter(invoice => invoice.type === 'DINE_IN' && invoice.status === 1 && !invoice.settled).sort((a, b) => a.time > b.time) :
            this.history.filter(invoice => invoice.type === 'DINE_IN' && invoice.server === this.op.name && invoice.status === 1 && !invoice.settled).sort((a, b) => a.time > b.time);
    },
    methods: {
        view(ticket) {
            this.$p('ticket', { ticket, exit: true })
        },
        todo(content) {
            return content.filter(item => item.print).map(item => item.qty).reduce((a, b) => a + b, 0)
        },
        settle(order) {
            this.$p('payment', { order })
        }
    },
    watch: {
        history(invoices) {
            this.invoices = invoices.filter(invoice => invoice.type === 'DINE_IN' && invoice.status === 1 && !invoice.settled)
                .sort((a, b) => a.time > b.time)
        }
    }
}
</script>

<style scoped>
.innner {
    height: 670px;
}

table {
    width: 825px;
    border-spacing: 0;
    table-layout: auto;
}

tbody tr {
    background: #fff;
}

th {
    padding: 7px 5px;
    text-align: center;
}

tbody tr:nth-child(even) {
    background: #f5f5f5;
    border-bottom: 1px solid #f1f1f1;
}

td {
    padding: 10px 5px;
    text-align: center;
}

.paid {
    padding: 5px 15px;
    background: #2196F3;
    color: #fff;
    border-radius: 4px;
    text-shadow: 0 1px 1px #333;
    cursor: pointer;
}
</style>