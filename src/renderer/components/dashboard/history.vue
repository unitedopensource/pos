<template>
    <div>
        <header></header>
        <section>
            <div class="invoice" v-for="(ticket,index) in history" :key="index">
                <span>{{ticket.number}}</span>
                <span>{{ticket.type}}</span>
            </div>
        </section>
    </div>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
    created() {
        this.$socket.emit("[INQUIRY] CUSTOMER_HISTORY", { phone: this.customer.phone, page: this.page })
    },
    data() {
        return {
            history: [],
            page: 0
            
        }
    },
    computed: {
        ...mapGetters(['customer'])
    },
    sockets: {
        ENQUIRY_CUSTOMER_HISTORY(data) {
            this.history = data;
        }
    }
}
</script>

<style scoped>

</style>