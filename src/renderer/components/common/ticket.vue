<template>
    <div class="receipt">
        <div v-html="ticket"></div>
    </div>
</template>

<script>
export default {
    props: ['init'],
    created() {
        this.ticket = this.init.render
    },
    data() {
        return {
            ticket: null
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