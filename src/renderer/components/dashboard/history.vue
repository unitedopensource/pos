<template>
    <div>
        <section class="inner">
            <div class="invoice" v-for="(ticket,index) in history" :key="index" @click="view(ticket)">
                <i :class="status(ticket.status)"></i>
                <span class="ticket">#{{ticket.number}}</span>
                <span class="type">{{$t('type.'+ticket.type)}}</span>
                <span class="time">{{ticket.time | moment('MM/DD/YY HH:mm')}}</span>
                <div class="f1">
                    <span class="void" v-if="ticket.status === 0">{{text(ticket.void.note)}} ({{ticket.void.by}})</span>
                </div>
                <span class="price">$ {{ticket.payment.due.toFixed(2)}}</span>
            </div>
        </section>
        <div class="popupMask center dark" @click.self="component = null" v-if="component">
            <div :is="component" :init="componentData"></div>
        </div>
    </div>
</template>

<script>
import { mapGetters } from 'vuex'
import ticket from '../common/ticket'
export default {
    components: { ticket },
    created() {
        this.$socket.emit("[INQUIRY] CUSTOMER_HISTORY", { phone: this.customer.phone, page: this.page })
    },
    data() {
        return {
            componentData: null,
            component: null,
            history: [],
            page: 0
        }
    },
    methods: {
        status(code) {
            switch (code) {
                case 0:
                    return "fa fa-times-circle-o";
                case 1:
                    return "fa fa-check-circle-o"
                default:
                    return "fa fa-question-circle-o"
            }
        },
        view(ticket) {
            let order = Printer.preview(ticket);
            this.$p('ticket', { render:order })
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
.inner {
    height: 500px;
}

.invoice {
    padding: 10px;
    display: flex;
}

.invoice:nth-child(odd) {
    background: #fff;
}

.invoice:nth-child(even) {
    background: #ECEFF1;
}

.invoice i {
    width: 25px;
    text-align: center;
}

.ticket {
    width: 40px;
}

.type {
    min-width: 50px;
}

.price {
    padding: 0 10px;
    text-align: right;
}

.f1 {
    padding: 0 15px;
}
</style>