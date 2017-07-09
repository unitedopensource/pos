<template>
    <div class="split" :class="'ticket_'+split">
        <header v-if="split">#{{split}}</header>
        <div class="inner" :class="{paid}">
            <div v-for="(item,index) in instance" :key="index" @click.stop="pick(item.unique)" :data-key="item.unique">
                <span class="itemWrap">
                    <span class="item">{{item[language]}}
                        <span class="mark">{{item.mark[0] | mark}}</span>
                    </span>
                    <span class="side">{{item.side[language]}}
                        <span class="mark">{{item.mark[1] | mark}}</span>
                    </span>
                </span>
                <span>{{item.total}}</span>
            </div>
            <div class="space" v-if="instance.length > 7"></div>
        </div>
        <div class="summary">
            <div class="total">
                <span class="text">{{text('TOTAL')}}:</span>
                <span>${{payment.total | decimal}}
                    <span class="tax">({{payment.tax | decimal}})</span>
                </span>
            </div>
            <div class="apply">
                <checkbox v-model="isTax" label="TAX"></checkbox>
                <checkbox v-model="isChargeDelivery" label="DELIVERY_FEE"></checkbox>
            </div>
        </div>
        <div class="done" v-show="done">
            <div class="btn print" @click="print">{{text('PRINT')}}</div>
            <div class="btn pay" @click="pay" v-show="!paid">{{text('PAYMENT')}}</div>
        </div>
    </div>
</template>

<script>
import { mapGetters } from 'vuex'
import checkbox from '../setting/common/checkbox'
export default {
    components: { checkbox },
    props: ['order', 'split', 'done'],
    data() {
        return {
            queue: [],
            paid: false,
            isTax: true,
            isDiscount: true,
            isChargeDelivery: true
        }
    },
    created() {
        this.$bus.on("SPLIT_ORDER", this.reset);
        this.$bus.on("SPLIT_PAID", this.check);
        this.isChargeDelivery = this.ticket.type === 'DELIVERY';
    },
    methods: {
        pick(key) {
            let i = this.queue.indexOf(key);
            i === -1 ? this.queue.push(key) : this.queue.splice(i, 1);
        },
        reset() {
            this.queue = [];
        },
        check(split) {
            this.split === split && (this.paid = true);
        },
        print() {
            this.$emit("print", this.split);
            document.querySelector(".btn.print").classList.add("active")
        },
        pay() {
            if (this.paid) return;
            let due = this.payment.total + this.payment.tip + this.payment.gratuity - this.payment.discount;
            this.$emit("pay", {
                split: this.split,
                payment: Object.assign({}, this.payment, { due })
            })
            document.querySelector(".btn.pay").classList.add("active")
        }
    },
    computed: {
        instance() {
            return this.split ?
                this.order.filter(item => (typeof item.sort === "object" ? item.sort.includes(this.split) : item.sort === this.split)) :
                this.order.filter(item => item.sort === 0);
        },
        payment() {
            let tip = 0, gratuity = 0, discount = 0, delivery = 0, subtotal = 0, tax = 0, total = 0, log = [];
            this.instance.forEach(item => {
                let price = parseFloat(item.single) * item.qty;
                let choiceLength = item.choiceSet.length;
                subtotal += price;

                for (let x = 0; x < choiceLength; x++) {
                    subtotal += item.choiceSet[x].price;
                }
                if (this.isTax) {
                    let taxClass = this.tax.class[item.taxClass];
                    tax += taxClass.apply[this.ticket.type] ? (taxClass.rate / 100 * (item.qty * item.single)) : tax;
                }
                delivery = (this.ticket.type === 'DELIVERY' && this.isChargeDelivery &&
                    this.store.delivery && !this.order.deliveryFree) ?
                    this.store.deliveryCharge : 0;
            })

            total = subtotal + tax + delivery;
            tax = tax;
            return { tip, gratuity, discount, delivery, subtotal, total, tax, log }
        },
        ...mapGetters(['tax', 'ticket', 'store', 'language'])
    },
    watch: {
        queue(n) {
            let doms = document.querySelectorAll(`.ticket_${this.split} .active`);
            doms.forEach(dom => {
                dom && dom.classList.remove("active");
            });
            doms = document.querySelectorAll(`.ticket_${this.split} [data-key]`);
            doms.forEach(dom => {
                this.queue.includes(dom.dataset.key) && dom && dom.classList.add("active");
            });
            this.$emit("queue", { origin: this.split, items: n })
        }
    },
    filters: {
        mark(text) {
            return text.join(" ")
        }
    },
    beforeDestroy() {
        this.$bus.off("SPLIT_ORDER", this.reset);
        this.$bus.off("SPLIT_PAID", this.check);
    }
}
</script>

<style scoped>
.split {
    min-width: 240px;
    min-height: 400px;
    margin: 5px;
    background: #fafafa;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
    display: flex;
    flex-direction: column;
    position: relative;
}

.inner {
    background: #fff;
    flex: 1;
    max-height: 506px;
    overflow: hidden;
    position: relative;
}

.inner>div {
    display: flex;
    padding: 10px;
    border-bottom: 1px solid #ddd;
}

.inner .space {
    padding: 9px 0;
    border: 2px dashed #eee;
    text-align: center;
    display: block;
}

.space::before {
    content: '\f067';
    font-family: fontAwesome;
    color: lightgray;
}


header {
    text-align: center;
    background: #607D8B;
    color: #fff;
}

.split .qty {
    width: 30px;
    text-align: center;
}

.split .itemWrap {
    flex: 1;
}

.split .active {
    background: #A1887F;
    color: #fff;
    text-shadow: 0 1px 1px rgba(0, 0, 0, 0.8);
}

.summary {
    display: flex;
    align-items: center;
    border-top: 1px solid #eee;
}

.total {
    flex: 2;
    display: flex;
    justify-content: center;
}

.text {
    font-weight: bold;
}

.tax {
    font-size: 12px;
    color: gray;
}

.checkbox {
    height: 20px;
    padding: 2px 0;
}

.done {
    position: absolute;
    top: 18px;
    width: 100%;
    height: calc(100% - 66px);
    background: rgba(0, 0, 0, 0.4);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}

.done .btn {
    padding: 0px 10px;
    margin: 10px;
}

.btn.active {
    background: linear-gradient(#ddd, #f5f5f5);
    color: #666;
}

.paid::after {
    content: ' ';
    position: absolute;
    bottom: 0;
    right: 0;
    width: 100px;
    height: 100px;
    background: url(../../assets/image/paid.png) no-repeat;
    background-size: cover;
}
</style>