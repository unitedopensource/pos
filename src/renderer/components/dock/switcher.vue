<template>
    <div class="popupMask center dark" @click.self="init.reject">
        <ul v-show="!component">
            <li v-show="type !== 'WALK_IN'" @click="change('WALK_IN')">
                <i class="fa fa-user"></i>
                <span>{{$t('type.WALK_IN')}}</span>
            </li>
            <li v-show="type !== 'PICK_UP'" @click="change('PICK_UP')">
                <i class="fa fa-phone"></i>
                <span>{{$t('type.PICK_UP')}}</span>
            </li>
            <li v-show="type !== 'DELIVERY'" @click="change('DELIVERY')">
                <i class="fa fa-car"></i>
                <span>{{$t('type.DELIVERY')}}</span>
            </li>
            <li v-show="type !=='DINE_IN'" @click="change('DINE_IN')">
                <i class="fa fa-cutlery"></i>
                <span>{{$t('type.DINE_IN')}}</span>
            </li>
        </ul>
        <div :is="component" :init="componentData"></div>
    </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import dialoger from '../common/dialoger'
export default {
    props: ['init'],
    components: { dialoger },
    data() {
        return {
            componentData: null,
            component: null,
            type: null
        }
    },
    created() {
        this.type = this.app.mode === 'create' ? this.ticket.type : this.order.type;

    },
    computed: {
        ...mapGetters(['app', 'ticket', 'order'])
    },
    methods: {
        change(type) {
            this.$dialog({
                type: 'question', title: 'dialog.orderTypeSwitchConfirm',
                msg: ['dialog.orderTypeSwitchTip', this.$t('type.' + this.ticket.type), this.$t('type.' + type)]
            }).then(() => {
                this.switchType(type)
                this.init.resolve()
            }).catch(() => {
                this.$q()
            })
        },
        switchType(type) {
            if (this.ticket.type === 'DINE_IN') {
                this.resetCurrentTable()
                this.$socket.emit("TABLE_MODIFIED", this.currentTable)
                this.resetTable()
            }
            this.setTicket({ type });
            this.applyPrice(type);
            switch (type) {
                case "PICK_UP":
                case "DELIVERY":
                    this.$router.push({ name: 'Information' })
                    break;
                case "DINE_IN":
                    this.$router.push({ name: 'Table' })
                    break;
            }
            this.init.resolve()
        },
        applyPrice(type) {
            let content = this.order.content.map(item => {
                if (item.hasOwnProperty('prices') && item.prices[type])
                    item.price = item.prices[type] || item.prices.DEFAULT;
                return item;
            })
            this.setOrder({ content })
        },
        ...mapActions(['setOrder', 'setTicket', 'resetTable', 'resetCurrentTable'])
    }
}
</script>

<style scoped>
ul {
    position: absolute;
    top: 0;
    left: 40px;
    padding: 5px 5px 0;
    color: #263238;
    background: rgba(255, 255, 255, 0.8);
    box-shadow: -2px 4px 12px rgba(0, 0, 0, 0.4);
    font-weight: initial;
}

li {
    background: #fff;
    padding: 18px 10px 18px 15px;
    color: #555;
    width: 170px;
    text-shadow: none;
    margin-bottom: 5px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.5);
    border-bottom: 1px solid #ddd;
}

li i{
    width: 25px;
    text-align: center;
}
</style>