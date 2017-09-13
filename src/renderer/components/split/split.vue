<template>
    <div class="popupMask center dark">
        <div class="window" v-show="!component">
            <header class="title">
                <span>{{$t('title.split')}}</span>
                <i class="fa fa-times" @click="init.reject"></i>
            </header>
            <section class="contain">
                <ticket :invoice="invoice"></ticket>
                <div class="new" @click="newSplit"></div>
                <div class="wrap">
                    <i class="fa fa-2x fa-angle-left page"></i>
                    <ticket :invoice="invoice" :split="i" :key="i" v-for="(invoice,i) in invoices"></ticket>
                    <i class="fa fa-2x fa-angle-right page"></i>
                </div>
            </section>
            <footer>
                <div class="f1">
                    <div class="btn" @click="printAll">{{$t('button.printAll')}}</div>
                    <div class="btn" @click="evenSplit">{{$t('button.evenSplit')}}</div>
                </div>
                <div class="btn" @click="init.reject">{{$t('button.cancel')}}</div>
                <div class="btn" @click="sort(1)">{{$t('button.sort')}}</div>
                <div class="btn" @click="save">{{$t('button.save')}}</div>
            </footer>
        </div>
    </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import dialoger from '../common/dialoger'
import Printer from '../../print'
import ticket from './ticket'
export default {
    props: ['init'],
    components: { ticket, dialoger },
    data() {
        return {
            componentData: null,
            component: null,
            invoices: [],
            invoice: {},
            items: [],
            split: 0
        }
    },
    created() {
        this.order.split ? this.analyze() : this.initial();
    },
    beforeCreate() {
        this.$options.components.payment = require('../payment/payment')
    },
    methods: {
        initial() {
            this.items = this.flatten(this.order.content);
            this.split = this.check(this.items);
            this.invoice = Object.assign({}, this.order, { content: this.items })
        },
        flatten(items) {
            let flattened = [];
            items.forEach(item => {
                let { qty, sort = 0, single } = item;
                while (qty > 0) {
                    let clone = Object.assign({}, item, {
                        qty: 1,
                        sort,
                        total: single.toFixed(2),
                        unique: Math.random().toString(36).substr(2, 5)
                    });
                    flattened.push(clone);
                    qty--;
                }
            });
            return flattened
        },
        check(items) {
            return [].concat.apply([], items.map(item => item.sort)).filter((v, i, s) => s.indexOf(v) === i).length
        },
        analyze() {
            let items = this.order.content.filter(item => item.sort === 0);
            this.items = this.flatten(items);
            this.split = this.order.splitInvoices.length;

            this.$socket.emit("[SPLIT] GET_INVOICE",
                this.order.splitInvoices, (invoices) => {
                    console.log(invoices)
                    this.invoices = invoices;
                })
        },
        newSplit() { },
        print() { },
        printAll() { },
        evenSplit() { },
        sort() { },
        save() { },
        exit() { }
    },
    computed: {
        ...mapGetters(['order'])
    }

}
</script>

<style scoped>
.window {
    width: 1000px;
    background: url(../../assets/image/grid.png) #fcfcfc;
}

.contain {
    min-height: 500px;
    display: flex;
    flex-direction: row-reverse;
    padding: 5px;
}

.contain .wrap {
    position: relative;
    flex: 1;
}

i.page {
    position: absolute;
    top: calc(50% - 25px);
    color: #37474F;
    text-align: center;
    border-radius: 50%;
    background: #fff;
    box-shadow: 0 3px 5px rgba(0, 0, 0, 0.4);
    height: 50px;
    width: 50px;
    line-height: 50px;
    cursor: pointer;
    z-index: 1;
    transition: all 0.1s ease;
}

i.page:active {
    background: #eee;
    transform: translateY(1px);
}

.fa-angle-left {
    left: 10px;
}

.fa-angle-right {
    right: 10px;
}

.new {
    border: 2px dashed #E0E0E0;
    width: 120px;
    height: inherit;
    background: #fff;
    position: relative;
    border-radius: 6px;
    cursor: pointer;
}

.new:before {
    font-family: fontAwesome;
    content: '\F067';
    position: absolute;
    top: calc(50% - 40px);
    left: 0;
    right: 0;
    margin: auto;
    width: 63px;
    font-size: 5em;
    color: #B0BEC5;
    text-shadow: 0 1px 3px #9E9E9E;
}
</style>