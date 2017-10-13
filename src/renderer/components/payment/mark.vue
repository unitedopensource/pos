<template>
    <div class="popupMask center dark">
        <div class="window">
            <header class="title">
                <span>{{$t('title.markPaymentType')}}</span>
                <i class="fa fa-times" @click="init.reject"></i>
            </header>
            <div class="inner">
                <div v-for="(option,index) in options" :key="index">
                    <input type="radio" name="type" v-model="type" :value="option" :id="'type'+index">
                    <label class="type" :for="'type'+index">{{option}}</label>
                </div>
            </div>
            <footer>
                <div class="btn" @click="init.reject">{{$t('button.cancel')}}</div>
                <div class="btn" @click="confirm">{{$t('button.confirm')}}</div>
            </footer>
        </div>
    </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
export default {
    props: ['init'],
    data() {
        return {
            options: ['Seamless', 'GrubHub', 'Eat 24', 'Uber Eat', 'Postmates', 'Simpon', 'UnionPay', 'Visa', 'Master', 'Discover', 'AE', 'CASH'],
            type: 'CASH'
        }
    },
    methods: {
        confirm() {
            Object.assign(this.order.payment, {
                balance: '0.00',
                paid: this.order.payment.due,
                type: this.type,
                settled: true
            })
            Object.assign(this.order, { settled: true, cashier: this.op.name })
            //this.order.session && this.$socket.emit("[TABLE] RESET", { session: this.order.session })


            if (!this.init.hasOwnProperty('callback')) {
                this.order.payment.log.push({
                    id: "",
                    type: this.type,
                    paid: this.order.payment.due,
                    change: "0.00",
                    balance: "0.00",
                    tip: this.order.payment.tip,
                    number: 'N/A'
                })
            }

            this.$socket.emit('[UPDATE] INVOICE', this.order);
            this.init.resolve(this.type);
        },
        ...mapActions(['setOrder'])
    },
    computed: {
        ...mapGetters(['op', 'store', 'order'])
    }

}
</script>

<style scoped>
.inner {
    display: flex;
    flex-wrap: wrap;
    width: 540px;
    justify-content: center;
}

.inner>div {
    display: flex;
}

input {
    display: none;
}

label {
    width: 90px;
    padding: 20px 15px;
    margin: 5px;
    background: #fff;
    border: 2px solid #e0e0e0;
    position: relative;
    text-align: center;
    border-radius: 4px;
    color: #bdbdbd;
}

input:checked+label {
    background: #66bb6a;
    color: #fafafa;
    border: 2px solid #009688;
    text-shadow: 0 2px 1px rgba(0, 0, 0, .5);
    box-shadow: 0 1px 2px rgba(0, 0, 0, .3);
}

input:checked+label:before {
    position: absolute;
    content: ' ';
    width: 23px;
    height: 15px;
    background: #009688;
    bottom: 0;
    right: 0;
    border-top-left-radius: 4px;
}

input:checked+label:after {
    position: absolute;
    content: '\f00c';
    font-family: fontAwesome;
    bottom: 0;
    right: 3px;
}
</style>