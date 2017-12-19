<template>
    <div class="popupMask dark center" @click.self="init.reject">
        <div class="editor">
            <header>
                <h5></h5>
                <h3>{{$t('title.discount')}}</h3>
            </header>
            <div class="banner"></div>
            <div class="display">
                <input type="text" v-model="discount" placeholder="0.00">
                <span class="unit" v-if="unit === '%'" @click="unit = '$'">%</span>
                <span class="unit" v-else @click="unit = '%'">$</span>
            </div>
            <num-pad v-model="discount" @enter="confirm" :type="unit === '%' ? 'number':'decimal'"></num-pad>
        </div>
    </div>
</template>

<script>
import numPad from "../common/numpad"
export default {
    props: ["init"],
    components: { numPad },
    data() {
        return {
            unit: "%",
            discount: "0.00",
            reset: true
        }
    },
    methods: {
        confirm() {
            let discount = this.discount.toFloat();
            let { payment } = this.init;
            if (this.unit === '%')
                discount = toFixed(payment.subtotal * this.discount / 100, 2);
            this.init.resolve(discount);
        }
    }
}
</script>