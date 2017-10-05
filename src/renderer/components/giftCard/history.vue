<template>
    <div class="history">
        <nav class="filter">

        </nav>
        <div class="inner">
            <table>
                <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Cashier</th>
                    <th>Balance</th>
                    <th>Change</th>
                    <th>Content</th>
                </tr>
                <tr v-for="(record,index) in records" :key="index">
                    <td>{{record.date}}</td>
                    <td>{{$t('type.'+record.type)}}</td>
                    <td>{{record.cashier}}</td>
                    <td>{{record.balance | decimal}}</td>
                    <td v-if="record.change > 0" class="positive">
                        <i class="fa fa-plus"></i>{{record.change}}</td>
                    <td v-else class="negative">
                        <i class="fa fa-minus"></i>{{record.change}}</td>
                    <td>{{record.order}}</td>
                </tr>
            </table>
        </div>
        <div class="popupMask center dark" @click.self="component = null" v-if="component">
            <div :is="component" :init="componentData"></div>
        </div>
    </div>
</template>

<script>
import ticket from '../common/ticket'
export default {
    props: ['int'],
    components: { ticket },
    data() {
        return {
            componentData: null,
            component: null,
            records: []
        }
    },
    methods: {
        viewReceipt(invoice) {
            this.$socket.emit("[VIEW] INVOICE", invoice._id, ticket => {
                this.$p('ticket', { ticket })
            })
        }
    }
}
</script>

<style scoped>

</style>