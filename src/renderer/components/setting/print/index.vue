<template>
    <div class="printer">
        <section class="setting">
            <smart-option label="PRINTER" v-model="device" :options="devices"></smart-option>
            <smart-option label="PRESET" v-model="preset" :options="presets"></smart-option>
            <div class="wrap">
                <div class="config" v-if="profile">
                    <fieldset class="section">
                        <legend>{{text('SETTING.PRINT.PRINT')}}</legend>
                        <div class="selection">
                            <checkbox v-model="profile.print.WALK_IN" label="WALK_IN"></checkbox>
                            <checkbox v-model="profile.print.PICK_UP" label="PICK_UP"></checkbox>
                            <checkbox v-model="profile.print.DELIVERY" label="DELIVERY"></checkbox>
                            <checkbox v-model="profile.print.DINE_IN" label="DINE_IN"></checkbox>
                            <checkbox v-model="profile.print.BAR" label="BAR"></checkbox>
                            <checkbox v-model="profile.print.PRE_PAYMENT" label="PRE_PAYMENT"></checkbox>
                            <checkbox v-model="profile.print.PAYMENT" label="PAYMENT"></checkbox>
                            <checkbox v-model="profile.print.REPORT" label="REPORT"></checkbox>
                        </div>
                    </fieldset>
                    <fieldset class="section">
                        <legend>{{text('SETTING.PRINT.DOUBLE')}}</legend>
                        <div class="selection">
                            <checkbox v-model="profile.double.WALK_IN" label="WALK_IN"></checkbox>
                            <checkbox v-model="profile.double.PICK_UP" label="PICK_UP"></checkbox>
                            <checkbox v-model="profile.double.DELIVERY" label="DELIVERY"></checkbox>
                            <checkbox v-model="profile.double.DINE_IN" label="DINE_IN"></checkbox>
                            <checkbox v-model="profile.double.BAR" label="BAR"></checkbox>
                        </div>
                    </fieldset>
                    <fieldset class="section">
                        <legend>{{text('SETTING.PRINT.CONTROL')}}</legend>
                        <div class="selection">
                            <checkbox v-model="profile.control.printPrimary" label="PRINT_PRIMARY"></checkbox>
                            <smart-option v-model="profile.control.primaryFont" label="FONT" :options="fonts"></smart-option>
                            <smart-range v-model="profile.control.primaryFontSize" label="FONT_SIZE" min="10" max="40" step="1"></smart-range>
                            <checkbox v-model="profile.control.printSecondary" label="PRINT_SECONDARY"></checkbox>
                            <smart-option v-model="profile.control.secondaryFont" label="FONT" :options="fonts"></smart-option>
                            <smart-range v-model="profile.control.secondaryFontSize" label="FONT_SIZE" min="10" max="40" step="1"></smart-range>
                            <checkbox v-model="profile.control.sortItem" label="SORT_ITEM"></checkbox>
                            <checkbox v-model="profile.control.duplicate" label="PRINT_DUPLICATE"></checkbox>
                            <checkbox v-model="profile.control.printStore" label="PRINT_STORE"></checkbox>
                            <checkbox v-model="profile.control.printType" label="PRINT_ORDER_TYPE"></checkbox>
                            <checkbox v-model="profile.control.printCustomer" label="PRINT_CUST_INFO"></checkbox>
                            <checkbox v-model="profile.control.printActionTime" label="PRINT_PRINTTIME"></checkbox>
                            <checkbox v-model="profile.control.enlargeDetail" label="PRINT_ENLARGE_CUST_INFO"></checkbox>
                            <checkbox v-model="profile.control.printPrice" label="PRINT_PRICE"></checkbox>
                            <checkbox v-model="profile.control.printPayment" label="PRINT_PAYMENT"></checkbox>
                            <checkbox v-model="profile.control.printSuggestion" label="PRINT_TIP_SUGG"></checkbox>
                            <checkbox v-model="profile.control.printCoupon" label="PRINT_COUPON"></checkbox>
                            <checkbox v-model="profile.control.buzzer" label="BUZZER"></checkbox>
                        </div>
                    </fieldset>
                </div>
            </div>
            <footer>
                <div class="btn" @click="back">{{text('BACK')}}</div>
                <div class="btn">{{text('CREATE')}}</div>
                <div class="btn">{{text('DELETE')}}</div>
            </footer>
        </section>
        <section class="preview">
            <div class="receipt">
                <header>
    
                </header>
                <div></div>
                <footer></footer>
            </div>
        </section>
    </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import smartOption from '../common/smartOption'
import smartRange from '../common/smartRange'
import checkbox from '../common/checkbox'
export default {
    components: { smartOption, smartRange, checkbox },
    created() {
        this.printers = Object.assign({}, this.configuration.printer);
        this.devices = Object.keys(this.printers) || [];
    },
    data() {
        return {
            printers: null,
            devices: [],
            device: null,
            profile: undefined,
            presets: ["cashier", "kitchen", "bar", "payment", "runner"],
            preset: "",
            fonts: ["Agency FB", "Noto Sans SC Light", "Tensentype RuiHeiJ-W2", "Trebuchet MS", "Yuanti SC", "QingYuan"]
        }
    },
    methods: {
        back() {
            this.$router.push({ name: 'Setting.index' })
        }
    },
    watch: {
        device(profile) {
            this.profile = this.printers[profile];
        }
    },
    computed: {
        ...mapGetters(['configuration', 'store'])
    }
}
</script>

<style scoped>
.printer {
    display: flex;
    height: 100%;
}

.section .selection {
    display: flex;
    flex-wrap: wrap;
    width: 300px;
}

.input {
    justify-content: center;
    align-items: center;
    margin: 7px;
    background: #fff;
    box-shadow: 0 1px 1px rgba(0, 0, 0, 0.5);
}

.input label {
    width: 75px;
}

fieldset {
    border: 1px solid #ccc;
    background: #fff;
    border-radius: 2px;
    margin: 5px;
    padding: 5px 0;
}

legend {
    margin-left: 10px;
}

section.setting {
    background: rgba(238, 238, 238, 0.57);
    width: 312px;
}

.selection .input {
    width: 285px;
}

.range {
    width: 300px;
    font-size: 13px;
    border-bottom: 1px dashed #ccc;
    padding-bottom: 5px;
    margin-bottom: 5px;
}

.range label {
    width: 100px;
}

.input label {
    width: 100px;
}

.wrap {
    height: 578px;
}

.preview {
    flex: 1;
    background: #525659;
    box-shadow: inset 5px 0 35px -8px rgba(0, 0, 0, .62);
    display: flex;
    justify-content: center;
    align-items: center;
}

.receipt {
    background: #fff;
    width: 350px;
    height: 600px;
    box-shadow: -5px 0 30px rgba(0, 0, 0, .62);
}

footer {
    display: flex;
}

.btn {
    margin: 0 5px;
    flex: 1;
}
</style>