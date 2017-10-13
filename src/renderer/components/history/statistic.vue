<template>
    <div class="popupMask center dark" @click.self="init.reject">
        <div class="window">
            <header class="title">
                <span>{{$t('title.stats')}}</span>
                <i class="fa fa-times" @click="init.reject"></i>
            </header>
            <div class="inner">
                <table>
                    <tr>
                        <th>#</th>
                        <th class="option">
                            <span v-if="!typeFilter">{{$t('thead.type')}}</span>
                            <span v-else>{{$t('type.'+typeFilter)}}</span>
                            <ul>
                                <li v-for="(type,index) in types" :key="index" @click="changeType(type)">{{$t('type.'+type)}}</li>
                            </ul>
                        </th>
                        <th>{{$t('thead.cashier')}}</th>
                        <th>{{$t('thead.placeTime')}}</th>
                        <th class="option">
                            {{$t('thead.paymentType')}}
                            <ul>
                                <li v-for="(settle,index) in settles" :key="index" @click="changeSettle(settle)">{{settle}}</li>
                            </ul>
                        </th>
                        <th>{{$t('thead.subtotal')}}</th>
                        <th>{{$t('thead.tax')}}</th>
                        <th>{{$t('thead.discount')}}</th>
                        <th>{{$t('thead.tip')}}</th>
                        <th>{{$t('thead.gratuity')}}</th>
                        <th>{{$t('thead.total')}}</th>
                    </tr>
                    <tr v-for="(ticket,index) in tickets" :key="index" :class="{voided:ticket.status === 0}">
                        <td>{{ticket.number}}</td>
                        <td>{{$t('type.'+ticket.type)}}</td>
                        <td>{{ticket.cashier}}</td>
                        <td>{{ticket.time | moment('HH:mm:ss')}}</td>
                        <td>{{ticket.payment.type}}</td>
                        <td>{{ticket.payment.subtotal | decimal}}</td>
                        <td>{{ticket.payment.tax | decimal}}</td>
                        <td>{{ticket.payment.discount | decimal}}</td>
                        <td>{{ticket.payment.tip | decimal}}</td>
                        <td>{{ticket.payment.gratuity | decimal}}</td>
                        <td>{{ticket.payment.total | decimal}}</td>
                    </tr>
                    <tr>
                        <td>{{summary.count}}</td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td>$ {{summary.subtotal | decimal}}</td>
                        <td>$ {{summary.tax | decimal}}</td>
                        <td>$ {{summary.discount | decimal}}</td>
                        <td>($ {{summary.tip | decimal}})</td>
                        <td>($ {{summary.gratuity | decimal}})</td>
                        <td>$ {{summary.total | decimal}}</td>
                    </tr>
                </table>
            </div>
        </div>
    </div>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
    props: ['init'],
    computed: {
        summary() {
            let c = (a, b) => a + b;

            let tickets = this.tickets.filter(invoice => invoice.status === 1).map(invoice => invoice.payment);
            let count = tickets.length;
            let subtotal = tickets.map(i => parseFloat(i.subtotal)).reduce(c, 0);
            let tax = tickets.map(i => parseFloat(i.tax)).reduce(c, 0);
            let discount = tickets.map(i => parseFloat(i.discount)).reduce(c, 0);
            let tip = tickets.map(i => parseFloat(i.tip)).reduce(c, 0);
            let gratuity = tickets.map(i => parseFloat(i.gratuity)).reduce(c, 0);
            let total = subtotal + tax - discount;

            return { count, subtotal, tax, discount, tip, gratuity, total }
        },
        ...mapGetters(['history'])
    },
    created() {
        let temp = this.init.hasOwnProperty('history') ? this.init.history : this.history;
        this.invoices = [];

        temp.forEach(i => {
            if (i.hasOwnProperty('splitPayment')) {
                i.splitPayment.forEach(split => {
                    this.invoices.push({
                        number: i.number,
                        status: i.status,
                        type: i.type,
                        cashier: i.cashier,
                        time: i.time,
                        payment: split
                    })
                })
            } else {
                this.invoices.push({
                    number: i.number,
                    status: i.status,
                    type: i.type,
                    cashier: i.cashier,
                    time: i.time,
                    payment: i.payment
                })
            }
        });

        this.types = [...new Set(this.invoices.map(invoice => invoice.type))].reverse()
        this.settles = [...new Set(this.invoices.map(invoice => invoice.payment.type))].reverse()
        this.tickets = this.invoices;

        this.types.splice(0, 0, "all")

        let index = -1;
        this.settles.some((type, i) => {
            if (typeof type === 'undefined') {
                index = i;
                return true;
            }
        })
        index === -1 ? this.settles.splice(0, 0, "all") : this.settles.splice(index, 1, "all")
    },
    data() {
        return {
            types: [],
            typeFilter: null,
            settles: [],
            settleFilter: null,
            invoices: [],
            tickets: []
        }
    },
    methods: {
        changeType(type) {
            this.typeFilter = type;
            this.tickets = this.invoices.filter(invoice => {
                let match1 = type === 'all' ? true : invoice.type === this.typeFilter;
                let match2 = this.settleFilter === 'all' ? true : invoice.payment.type === this.settleFilter;

                if (this.settleFilter) return match1 && match2;
                if (this.typeFilter) return match1;

                return true;
            })
        },
        changeSettle(type) {
            this.settleFilter = type;
            this.tickets = this.invoices.filter(invoice => {
                let match1 = this.settleFilter === 'all' ? true : invoice.payment.type === this.settleFilter;
                let match2 = this.typeFilter === 'all' ? true : invoice.type === this.typeFilter;

                if (this.typeFilter) return match1 && match2;
                if (this.settleFilter) return match1;

                return true;
            })
        }
    }
}
</script>

<style scoped>
.window {
    width: 850px;
}

.inner {
    height: 650px;
    overflow: auto;
}

section.filters {
    display: flex;
    height: 50px;
    align-items: center;
    padding: 0 5px;
}

.filters .filter {
    display: flex;
    flex-direction: column;
    width: 150px;
    padding: 6px 10px;
}

table {
    box-shadow: 0 4px 6px -2px rgba(0, 0, 0, 0.5);
    border-spacing: 0;
    table-layout: auto;
    width: 99%;
    margin: 5px auto;
}

tr:first-child th:first-child {
    border-top-left-radius: 6px;
}

tr:first-child th:last-child {
    border-top-right-radius: 6px;
}

th.option {
    cursor: pointer;
    position: relative;
}

th.option:after {
    content: '\f0d7';
    position: absolute;
    font-family: fontawesome;
    right: 0px;
}

th {
    padding: 10px 5px;
    background: #434c5b;
    color: #fff;
    text-shadow: 0 1px 1px #333;
    font-weight: normal;
}

td {
    padding: 10px 5px;
    text-align: center;
}

tr.voided {
    background: #FBE9E7;
    color: #FF5722;
}

tr:nth-child(odd) {
    background: #eee;
}

tr:last-child {
    background: #E0E0E0;
    font-weight: bold;
    color: #333;
}

.option ul {
    position: absolute;
    background: #434c5b;
    padding: 5px 5px 10px 5px;
    width: 80px;
    border-radius: 4px;
    display: none;
}

.option li {
    padding-top: 10px;
    text-transform: capitalize;
}

th.option:hover ul {
    display: block;
}
</style>