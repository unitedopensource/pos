<template>
    <div class="popupMask center dark" @click.self="init.reject">
        <div class="window">
            <header class="title">
                <span>{{$t('title.stats')}}</span>
                <i class="fa fa-times" @click="init.reject"></i>
            </header>
            <div class="inner">
                <section class="filters">
                    <div class="filter">
                        <label>{{$t('stats.orderType')}}</label>
                        <select v-model="typeFilter" @change="changeType">
                            <option v-for="(type,index) in types" :key="index" :value="type">{{$t('type.'+type)}}</option>
                        </select>
                    </div>
                    <div class="filter">
                        <label>{{$t('stats.paymentType')}}</label>
                        <select v-model="settleFilter" @change="changeSettle">
                            <option v-for="(settle,index) in settles" :key="index">{{settle}}</option>
                        </select>
                    </div>
                    <div>
                        <button class="btn" @click="reset">{{$t('button.reset')}}</button>
                    </div>
                </section>
                <table>
                    <tr>
                        <th>Ticket</th>
                        <th>Type</th>
                        <th>Cashier</th>
                        <th>Place Time</th>
                        <th>Items</th>
                        <th>Subtotal</th>
                        <th>Tax</th>
                        <th>Discount</th>
                        <th>Tip</th>
                        <th>Total</th>
                    </tr>
                    <tr v-for="(invoice,index) in invoices" :key="index" :class="{voided:invoice.status === 0}">
                        <td>{{invoice.number}}</td>
                        <td>{{$t('type.'+invoice.type)}}</td>
                        <td>{{invoice.cashier}}</td>
                        <td>{{invoice.time | moment('HH:mm:ss')}}</td>
                        <td>{{countItem(invoice.content)}}</td>
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
        this.types = [...new Set(this.history.map(invoice => invoice.type))];
        this.settles = [...new Set(this.history.map(invoice => invoice.payment.type))]
        this.invoices = this.history.map(invoice => invoice);
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
        reset() {
            this.typeFilter = null;
            this.settleFilter = null;
        },
        changeType() {
            this.invoices = this.history.filter(invoice => {
                let match1 = invoice.type === this.typeFilter;
                let match2 = invoice.payment.type === this.settleFilter;

                if (this.settleFilter) return match1 && match2;
                if (this.typeFilter) return match1;

                return true;
            });
        },
        changeSettle() {
            this.invoices = this.history.filter(invoice => {
                let match1 = invoice.payment.type === this.settleFilter;
                let match2 = invoice.type === this.typeFilter;

                if (this.typeFilter) return match1 && match2;
                if (this.settleFilter) return match1;

                return true;
            });
        },
        countItem(list) {
            let count = 0;
            list.forEach(item => {
                count += item.qty
            })
            return count;
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
    border-collapse: collapse;
    table-layout: auto;
    width: 99%;
    margin: auto;
    border: 1px solid #607D8B;
}

th {
    padding: 10px 6px;
    background: #607D8B;
    color: #fff;
    text-shadow: 0 1px 1px #333;
}

td {
    padding: 10px 6px;
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
    color: #263238;
}

.btn {
    height: 30px;
}
</style>