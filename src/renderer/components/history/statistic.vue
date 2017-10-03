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
                        <th>{{$t('stats.ticket')}}</th>
                        <th class="option">
                            <span v-if="!typeFilter">{{$t('stats.type')}}</span>
                            <span v-else>{{$t('type.'+typeFilter)}}</span>
                            <ul>
                                <li v-for="(type,index) in types" :key="index" @click="changeType(type)">{{$t('type.'+type)}}</li>
                            </ul>
                        </th>
                        <th>{{$t('stats.cashier')}}</th>
                        <th>{{$t('stats.placeTime')}}</th>
                        <th class="option">
                            {{$t('stats.paymentType')}}
                            <ul>
                                <li v-for="(settle,index) in settles" :key="index" @click="changeSettle(settle)">{{settle}}</li>
                            </ul>
                        </th>
                        <th>{{$t('stats.subtotal')}}</th>
                        <th>{{$t('stats.tax')}}</th>
                        <th>{{$t('stats.discount')}}</th>
                        <th>{{$t('stats.tip')}}</th>
                        <th>{{$t('stats.total')}}</th>
                    </tr>
                    <tr v-for="(invoice,index) in invoices" :key="index" :class="{voided:invoice.status === 0}">
                        <td>{{invoice.number}}</td>
                        <td>{{$t('type.'+invoice.type)}}</td>
                        <td>{{invoice.cashier}}</td>
                        <td>{{invoice.time | moment('HH:mm:ss')}}</td>
                        <td>{{invoice.payment.type}}</td>
                        <td>{{invoice.payment.subtotal}}</td>
                        <td>{{invoice.payment.tax}}</td>
                        <td>{{invoice.payment.discount}}</td>
                        <td>{{invoice.payment.tip}}</td>
                        <td>{{invoice.payment.total}}</td>
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
                        <td>$ {{summary.tip | decimal}}</td>
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
            let count = 0, subtotal = 0, tax = 0, discount = 0, tip = 0, total = 0;
            this.invoices.forEach(invoice => {
                if (invoice.status === 1) {
                    count++;
                    let p = invoice.payment;
                    subtotal += parseFloat(p.subtotal)
                    tax += parseFloat(p.tax)
                    discount += parseFloat(p.discount)
                    tip += parseFloat(p.tip)
                    total += parseFloat(p.subtotal) + parseFloat(p.tax) - parseFloat(p.discount)
                }
            })

            return { count, subtotal, tax, discount, tip, total }
        },
        ...mapGetters(['history'])
    },
    created() {
        this.types = [...new Set(this.history.map(invoice => invoice.type))].reverse()
        this.settles = [...new Set(this.history.map(invoice => invoice.payment.type))].reverse()
        this.invoices = this.history.map(invoice => invoice)

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
            invoices: []
        }
    },
    methods: {
        changeType(type) {
            this.typeFilter = type;
            this.invoices = this.history.filter(invoice => {
                let match1 = type === 'all' ? true : invoice.type === this.typeFilter;
                let match2 = this.settleFilter === 'all' ? true : invoice.payment.type === this.settleFilter;

                if (this.settleFilter) return match1 && match2;
                if (this.typeFilter) return match1;

                return true;
            })
        },
        changeSettle(type) {
            this.settleFilter = type;
            this.invoices = this.history.filter(invoice => {
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