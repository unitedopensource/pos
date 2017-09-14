<template>
    <div>
        <button class="btn" @click="settle" :disabled="disable">
            <i class="fa fa-money"></i>
            <span class="text">{{$t('button.payment')}}</span>
        </button>
        <button class="btn" @click="thirdParty" :disabled="disable">
            <i class="fa fa-google-wallet"></i>
            <span class="text">{{$t('button.thirdParty')}}</span>
        </button>
        <button class="btn" @click="split" :disabled="disable">
            <i class="fa fa-clone"></i>
            <span class="text">{{$t('button.split')}}</span>
        </button>
        <button class="btn" @click="discount" :disabled="disable">
            <i class="fa fa-tag"></i>
            <span class="text">{{$t('button.discount')}}</span>
        </button>
        <button class="btn" @click="exit">
            <i class="fa fa-times"></i>
            <span class="text">{{$t('button.exit')}}</span>
        </button>
        <button class="btn" @click="driver" :disabled="order.type !== 'DELIVERY'">
            <i class="fa fa-id-card-o"></i>
            <span class="text">{{$t('button.driver')}}</span>
        </button>
        <div :is="component" :init="componentData"></div>
    </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import paymentMark from '../payment/mark'
import dialoger from '../common/dialoger'
import payment from '../payment/payment'
import driver from '../history/driver'
import split from '../menu/split'
export default {
    props: ['date'],
    components: { driver, dialoger, payment, paymentMark, split },
    data() {
        return {
            componentData: null,
            component: null,
            today: today()
        }
    },
    methods: {
        settle() {
            this.$p('payment')
        },
        thirdParty() {
            this.$p('paymentMark')
        },
        split() {
            this.$p('split')
        },
        discount() {

        },
        driver() {
            this.$p("driver", { driver: this.order.driver, ticket: this.ticket.number })
        },
        invalidOrder() {

        },
        exit() {
            this.resetMenu();
            this.$router.push({ path: "/main" });
        },
        ...mapActions(['resetMenu'])
    },
    computed: {
        disable() {
            return this.order.settled || this.today !== this.date || this.order.status === 0
        },
        ...mapGetters(['order', 'ticket'])
    }
}
</script>

<style scoped>
div {
    padding: 4px 0px 0px 4px;
}

div button {
    margin: 3px 0;
}
</style>