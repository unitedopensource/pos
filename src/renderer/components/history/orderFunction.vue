<template>
    <div>
        <button class="btn" @click="exc('settle')">
            <i class="fa fa-money"></i>
            <span class="text">{{$t('button.payment')}}</span>
        </button>
        <button class="btn" @click="exc('thirdParty')">
            <i class="fa fa-google-wallet"></i>
            <span class="text">{{$t('button.thirdParty')}}</span>
        </button>
        <button class="btn" @click="exc('split')">
            <i class="fa fa-clone"></i>
            <span class="text">{{$t('button.split')}}</span>
        </button>
        <button class="btn" @click="exc('discount')">
            <i class="fa fa-tag"></i>
            <span class="text">{{$t('button.discount')}}</span>
        </button>
        <button class="btn" @click="exit">
            <i class="fa fa-times"></i>
            <span class="text">{{$t('button.exit')}}</span>
        </button>
        <button class="btn" @click="exc('driver',true)">
            <i class="fa fa-id-card-o"></i>
            <span class="text">{{$t('button.driver')}}</span>
        </button>
        <div :is="component" :init="componentData"></div>
    </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import driver from '../history/driver'
export default {
    components: { driver },
    data() {
        return {
            componentData: null,
            component: null
        }
    },
    methods: {
        exc(fn, skip) {
            if (skip) {
                this[fn]();
            } else {
                if (this.order.content.length === 0) {
                    this.invalidOrder();
                    return
                }
                if (this.order.settled) {
                    this.handleSettledOrder();
                    return
                }
                this[fn]();
            }
        },
        settle() {

        },
        thirdParty() {

        },
        split() {

        },
        discount() {

        },
        driver() {
            this.$p("driver", { driver: this.order.driver, ticket: this.ticket.number })
        },
        invalidOrder() {

        },
        handleSettledOrder() {

        },
        exit() {
            this.resetMenu();
            this.$router.push({ path: "/main" });
        },
        ...mapActions(['resetMenu'])
    },
    computed: {
        ...mapGetters(['order', 'ticket'])
    }
}
</script>

<style scoped>
div {
    padding: 4px 0px 0px 4px;
}

div button{
    margin: 3px 0;
}
</style>