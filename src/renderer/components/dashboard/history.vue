<template>
    <div>
        <header></header>
        <section class="inner">
            <div class="invoice" v-for="(ticket,index) in history" :key="index">
                <i :class="status(ticket.status)"></i>
                <span>{{ticket.number}}</span>
                <span>{{text(ticket.type)}}</span>
                
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
    methods:{
        status(code){
            switch(code){
                case 0:
                    return "fa fa-times-circle-o";
                case 1:
                    return "fa fa-check-circle-o"
                default:
                    return "fa fa-question-circle-o"
            }
        }
    },
    computed: {
        ...mapGetters(['customer'])
    },
    sockets: {
        ENQUIRY_CUSTOMER_HISTORY(data) {
            console.log(data);
            this.history = data;
        }
    }
}
</script>

<style scoped>
.inner{
    height: 500px;
}
</style>