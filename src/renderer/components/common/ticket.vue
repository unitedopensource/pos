<template>
    <div class="popupMask center dark" @click.self="init.reject">
        <div class="receipt">
            <div v-html="ticket"></div>
        </div>
    </div>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
    props: ['init'],
    computed: {
        ...mapGetters(['store', 'order'])
    },
    created() {
        this.ticket = JSON.parse(JSON.stringify(this.init.order)) || JSON.parse(JSON.stringify(this.order));
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