<template>
    <div>
        <section class="card">
            <header>{{text('BASIC_INFO')}}</header>
            <article>
                <smart-input v-model="store.name" label="NAME" reg="^[a-zA-Z0-9_. ]{5,30}$" :disable="true"></smart-input>
                <smart-input v-model="store.address" label="ADDRESS" reg="^\d+\s[A-z]+\s[A-z]+"></smart-input>
                <smart-input v-model="store.city" label="CITY" reg="^[a-zA-Z0-9_. ]{5,30}$"></smart-input>
                <smart-input v-model="store.state" label="STATE" reg="^[a-zA-Z0-9_. ]{5,30}$"></smart-input>
                <smart-input v-model="store.zipCode" label="ZIP_CODE" reg="^[a-zA-Z0-9_. ]{5,30}$"></smart-input>
                <smart-input v-model="store.contact" label="CONTACT" reg="^[a-zA-Z0-9_. ]{5,30}$"></smart-input>
                <smart-input v-model="store.type" label="STORE_TYPE" reg="^[a-zA-Z0-9_. ]{5,30}$"></smart-input>
            </article>
        </section>
        <section class="card">
            <header>{{text('DELIVERY')}}
                <span class="tip"></span>
            </header>
            <article>
                <smart-switch v-model="store.delivery" label="DELIVERY"></smart-switch>
                <smart-input v-model.number="store.deliveryCharge" label="DELIVERY_FEE" :disable="!store.delivery"></smart-input>
                <smart-switch v-model="store.dynamicCharge" label="DYN_CHRG"></smart-switch>
                <smart-input v-model="store.perMileCost" label="MILE_COST" :disable="!store.dynamicCharge"></smart-input>
            </article>
        </section>
        <section class="card">
            <header>{{text('GOOGLE_MATRIX')}}
                <span class="tip">{{text('TIP_CALC_DISTANCE')}}</span>
            </header>
            <article>
                <smart-switch v-model="store.calcDistance" label="ENABLE"></smart-switch>
                <smart-input v-model="store.mapAPI" label="API_KEY" :disable="!store.calcDistance"></smart-input>
            </article>
        </section>
        <section class="card">
            <header>{{text('EMPLOYEE')}}
                <span class="tip"></span>
            </header>
            <article>
                <smart-switch v-model="store.timeCard" label="TIMECARD"></smart-switch>
                <smart-switch v-model="store.timeCardReport" label="CLOCK_OUT_REPORT"></smart-switch>
            </article>
        </section>
        <section class="card">
            <header>{{text('E_MAIL')}}
                <span class="tip">{{text('TIP_FOR_SMS_ALERT')}}</span>
            </header>
            <article>
                <smart-input v-model="store.email" reg="^[a-zA-Z0-9.-_]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$" label="ACCOUNT"></smart-input>
                <smart-input v-model="store.emailPassword" label="PASSWORD"></smart-input>
            </article>
        </section>
        <section class="card">
            <header>{{text('TIME_ZONE')}}
                <span class="tip"></span>
            </header>
            <article>
                <smart-option v-model="store.timeZone" :options="timezones" label="AREA"></smart-option>
            </article>
        </section>
    </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import smartInput from '../common/smartInput'
import smartSwitch from '../common/smartSwitch'
import smartOption from '../common/smartOption'
export default {
    components: { smartInput, smartSwitch, smartOption },
    created() {
        this.store = Object.assign({}, this.config.store)
    },
    data() {
        return {
            store: null,
            change: false,
            timezones: ['America/New_York', 'America/Chicago', 'America/Denver', 'America/Phoenix', 'America/Los_Angeles', 'America/Anchorage', 'America/Adak', 'Pacific/Honolulu']
        }
    },
    computed: {
        ...mapGetters(['config'])
    },
    watch: {
        store: {
            handler(n) {
                let keys = Object.keys(n);
                this.change = keys.some(key => {
                    return typeof n[key] === 'string' ?
                        n[key] !== this.config.store[key] :
                        JSON.stringify(n[key]) !== JSON.stringify(this.config.store[key]);
                })
                this.change ? this.$emit("change", n) : this.$emit("unchange");
            }, deep: true
        }
    }
}
</script>

<style></style>