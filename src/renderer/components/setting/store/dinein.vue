<template>
    <div>
        <section class="card">
            <header>{{text('DINE_IN')}}
                <span class="tip"></span>
            </header>
            <article>
                <smart-switch v-model="table.layout" label="ENABLE"></smart-switch>
                <smart-switch v-model="table.guestCount" label="GUEST_COUNT"></smart-switch>
                <smart-switch v-model="table.seatOrder" label="SEAT_ORDER"></smart-switch>
                <smart-switch v-model="table.autoClean" label="AUTO_CLEAN_TABLE"></smart-switch>
            </article>
        </section>
        <section class="card">
            <header>{{text('STUFF_BANK')}}
                <span class="tip"></span>
            </header>
            <article>
                <smart-switch v-model="table.stuffBank" label="ENABLE"></smart-switch>
                <smart-input v-model.number="table.initialAmount" label="INIT_AMOUNT"></smart-input>
            </article>
        </section>
        <section class="card">
            <header>{{text('AUTO_CHARGE')}}
                <span class="SETTING.AUTOCHARGE.TIP"></span>
            </header>
            <article>
                <smart-switch v-model="table.autoTip" label="ENABLE"></smart-switch>
                <smart-input v-model.number="table.AutoChargeAbove" label="INIT_AMOUNT"></smart-input>
            </article>
        </section>
    </div>
</template>

<script>
import { mapGetters } from 'vuex'
import smartInput from '../common/smartInput'
import smartSwitch from '../common/smartSwitch'
export default {
    components: { smartSwitch, smartInput },
    created() {
        this.table = Object.assign({}, this.store.table)
    },
    data() {
        return {
            table: null
        }
    },
    watch: {
        table: {
            handler(n) {
                let keys = Object.keys(n);
                this.change = keys.some(key => {
                    return typeof n[key] === 'string' ?
                        n[key] !== this.store.table[key] :
                        JSON.stringify(n[key]) !== JSON.stringify(this.store.table[key]);
                })
                this.change ? this.$emit("change", Object.assign({}, this.store, { table: n })) : this.$emit("unchange");
            }, deep: true
        }
    },
    computed: {
        ...mapGetters(['store'])
    }
}
</script>

<style>

</style>