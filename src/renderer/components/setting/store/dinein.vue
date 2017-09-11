<template>
    <div>
        <section class="card">
            <header>{{$t('setting.dineIn')}}
                <span class="tip"></span>
            </header>
            <article>
                <smart-switch v-model="table.layout" label="text.enable"></smart-switch>
                <smart-switch v-model="table.guestCount" label="text.guestCount"></smart-switch>
                <smart-switch v-model="table.seatOrder" label="text.orderBySeat"></smart-switch>
                <smart-switch v-model="table.autoClean" label="text.autoClear" tip="tip.table.autoClearTable"></smart-switch>
                <smart-switch v-model="table.passwordRequire" label="text.passwordRequire" tip="tip.table.passwordRequire"></smart-switch>
            </article>
        </section>
        <!-- <section class="card">
            <header>{{$t('setting.staffBank')}}
                <span class="tip"></span>
            </header>
            <article>
                <smart-switch v-model="table.staffBank" label="text.enable"></smart-switch>
                <smart-input v-model.number="table.initialAmount" label="text.initialAmount" :disable="!table.staffBank"></smart-input>
            </article>
        </section> -->
        <section class="card">
            <header>{{$t('setting.autoCharge')}}
                <span class="tip">{{$t('setting.autoChargeTip')}}</span>
            </header>
            <article>
                <smart-switch v-model="table.autoTip" label="text.enable"></smart-switch>
                <smart-input v-model.number="table.AutoChargeAbove" label="text.autoChargeAbove" :disable="!table.autoTip"></smart-input>
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
        this.table = JSON.parse(JSON.stringify(this.store.table))
    },
    data() {
        return {
            table: {}
        }
    },
    watch: {
        table: {
            handler(n) {
                let keys = Object.keys(n);
                let isChanged = keys.some(key => {
                    return typeof n[key] === 'string' ?
                        n[key] !== this.store.table[key] :
                        JSON.stringify(n[key]) !== JSON.stringify(this.store.table[key]);
                })
                isChanged ? this.$emit("change", Object.assign({}, this.store, { table: n })) : this.$emit("unchanged");
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