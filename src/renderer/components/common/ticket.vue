<template>
    <div class="receipt">
        <div v-html="ticket"></div>
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

</style>