<template>
    <div class="redirect">
        <smart-option label="RECEIPT_PRINTER" v-model="printer" :options="options" class="f1" @input="trigger"></smart-option>
        <smart-option label="PRINT_REDIRECT_TO" v-model="redirect" :options="options" class="f1" @input="trigger"></smart-option>
    </div>
</template>

<script>
import smartOption from './smartOption'
import smartInput from './smartInput'
export default {
    props: ['init', 'options'],
    components: { smartOption, smartInput },
    created() {
        this.printer = Object.keys(this.init)[0];
        this.redirect = this.init[this.printer];
    },
    data() {
        return {
            printer: "",
            redirect: ""
        }
    },
    methods: {
        trigger() {
            this.$emit("update", { [this.printer]: this.redirect })
        }
    }
}
</script>

<style>
.redirect {
    display: flex;
}
</style>
