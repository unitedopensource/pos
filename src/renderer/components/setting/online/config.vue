<template>
    <div>
        <section class="card">
            <header>{{text('BASIC_INFO')}}
                <span class="tip">{{text('SETTING.ONLINE.TIP')}}</span></header>
            <article>
                <smart-switch v-model="online.enable" label="ENABLE"></smart-switch>
                <smart-input v-model="online.server" label="IP" reg="^\d+\s[A-z]+\s[A-z]+"></smart-input>
                <smart-input v-model="online.port" label="PORT" reg="^[a-zA-Z0-9_. ]{5,30}$"></smart-input>
                <smart-input v-model="online.user" label="ACCOUNT" reg="^[a-zA-Z0-9_. ]{5,30}$"></smart-input>
                <smart-input v-model="online.password" label="PASSWORD" reg="^[a-zA-Z0-9_. ]{5,30}$"></smart-input>
                <smart-input v-model="online.database" label="DATABASE" reg="^[a-zA-Z0-9_. ]{5,30}$"></smart-input>
            </article>
        </section>
        <section class="card">
            <header>{{text('SECURITY')}}</header>
            <article>
                <smart-input v-model="online.privateKey" label="RSA_KEY" reg="^\d+\s[A-z]+\s[A-z]+"></smart-input>
                <smart-input v-model="online.rsaExp" label="CC_EXP" reg="^[a-zA-Z0-9_. ]{5,30}$" :disable="true"></smart-input>
            </article>
        </section>
        <section class="card">
            <header>{{text('SETTING')}}</header>
            <article>
                <smart-switch v-model="online.acceptCreditCard" label="ACCEPT_CREDIT_CARD"></smart-switch>
                <smart-switch v-model="online.acceptDelivery" label="ACCEPT_DELIVERY"></smart-switch>
                <smart-input v-model="online.deliveryFee" label="DELIVERY_FEE" :disable="!online.acceptDelivery"></smart-input>
                <smart-input v-model="online.minCashReq" label="MIN_CASH_REQ" reg="^[a-zA-Z0-9_. ]{5,30}$"></smart-input>
                <smart-input v-model="online.minCreditReq" label="MIN_CREDIT_REQ" reg="^\d+\s[A-z]+\s[A-z]+"></smart-input>
                <smart-input v-model="online.maxDeliverMile" label="MAX_DELIVERY_RANGE" reg="^[a-zA-Z0-9_. ]{5,30}$"></smart-input>
                <smart-input v-model="online.pickupDuration" label="PICKUP_DURATION" reg="^\d+\s[A-z]+\s[A-z]+"></smart-input>
                <smart-input v-model="online.deliveryDuration" label="DELIVERY_DURATION" reg="^[a-zA-Z0-9_. ]{5,30}$"></smart-input>
            </article>
        </section>
    </div>
</template>

<script>
import { mapGetters } from 'vuex'
import smartInput from '../common/smartInput'
import smartSwitch from '../common/smartSwitch'
export default {
    components: {
        smartInput,smartSwitch
    },
    created() {
        this.online = JSON.parse(JSON.stringify(this.config.online));
    },
    data() {
        return {
            online: null
        }
    },
    computed: {
        ...mapGetters(['config'])
    }
}
</script>

<style></style>