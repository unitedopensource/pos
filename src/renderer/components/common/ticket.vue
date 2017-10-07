<template>
    <div class="receipt" @click="fn">
        <div v-html="ticket"></div>
    </div>
</template>

<script>
export default {
    props: ['init'],
    created() {
        this.ticket = Printer.preview(this.init.ticket);
    },
    data() {
        return {
            ticket: null
        }
    },
    methods:{
        fn(){
            this.init.exit && this.init.resolve()
        }
    }
}
</script>

<style scoped>
.receipt {
    background: #fff;
    width: 280px;
    padding: 35px 20px 5px;
    box-shadow: 0 1px 8px rgba(0, 0, 0, 0.5);
}
</style>