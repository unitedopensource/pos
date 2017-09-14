<template>
    <div>
        <section class="card list">
            <header>
                <span>{{$t('setting.customer')}}</span>
                <span class="tip">{{$t('setting.customerTip')}}</span>
                <div class="search">
                    <i class="fa fa-search"></i>
                    <input type="text" v-model="keyword" @keydown.enter="search">
                </div>
            </header>
            <div class="listHeader">
                <span class="number">{{$t('text.phone')}}</span>
                <span class="address">{{$t('text.address')}}</span>
                <div class="info">
                    <span class="name">{{$t('text.name')}}</span>
                    <span class="count">{{$t('text.count')}}</span>
                    <span class="total">{{$t('text.total')}}</span>
                    <span class="time">{{$t('text.lastDate')}}</span>
                </div>
            </div>
            <article>
                <div v-for="(customer,index) in customers" class="datalist" :key="index">
                    <span class="number">{{customer.phone | phone}}</span>
                    <div class="address">
                        <span class="street">{{customer.address}}
                            <span class="city">{{customer.city}}</span>
                        </span>
                    </div>
                    <div class="info">
                        <span class="name">{{customer.name}}</span>
                        <span class="count">{{customer.extra.orderCount}}</span>
                        <span class="total">$ {{customer.extra.orderAmount | decimal}}</span>
                        <span class="time">{{customer.extra.lastDate | fromNow}}</span>
                    </div>
                    <i class="fa fa-times" @click="removeClient(customer)"></i>
                </div>
                <div class="more" @click="more" v-show="!disable">
                    <i class="fa fa-2x fa-chevron-down"></i>
                </div>
            </article>
        </section>
        <div :is="component" :init="componentData"></div>
    </div>
</template>

<script>
import dialoger from '../../common/dialoger'
export default {
    components: { dialoger },
    data() {
        return {
            componentData: null,
            component: null,
            customers: [],
            disable: false,
            keyword: "",
            page: 0
        }
    },
    created() {
        this.$socket.emit("[CMS] FETCH_CUSTOMERS", this.page);
    },
    methods: {
        search() {
            //this.$socket.emit("[CMS]")
        },
        removeClient(customer) {
            this.$dialog({
                title: 'dialog.removeClient',
                msg: ['dialog.removeClientTip', customer.phone]
            }).then(() => {
                this.$socket.emit("[CMS] DELETE_CUSTOMER", customer._id);
                let index = this.customers.findIndex(client => client._id === customer._id);
                index !== 1 && this.customers.splice(index, 1);
                this.$q();
            }).catch(() => { this.$q() })
        },
        more() {
            this.$socket.emit("[CMS] FETCH_CUSTOMERS", ++this.page);
        }
    },
    sockets: {
        CUSTOMER_LIST(list) {
            list.length > 0 ?
                this.customers.push(...list) :
                this.disable = true;
        }
    }
}
</script>

<style scoped>
.search {
    background: #fff;
    border-radius: 15px;
    padding: 1px 20px 5px;
    position: absolute;
    right: 0;
    top: -5px;
    box-shadow: 0 1px 5px -1px rgba(0, 0, 0, 0.6);
}

.search input {
    border: none;
    outline: none;
    width: 100px;
}

.datalist {
    padding: 10px 0;
}

.number {
    width: 120px;
    padding: 0 5px 0 15px;
}

.address {
    min-width: 270px;
    padding: 0 10px;
}

.city {
    margin-left: 5px;
    color: #9E9E9E;
}

.name {
    min-width: 150px;
    padding: 0 10px;
}

.info {
    display: flex;
}

.count {
    min-width: 60px;
    text-align: center;
}

.total {
    min-width: 60px;
    padding: 0 10px;
}

.time{
    width: 120px;
}

.more {
    color: gainsboro;
    justify-content: center;
    border: 2px dashed;
    cursor: pointer;
    display: flex;
}

.more:active {
    background: #F5F5F5;
}
</style>
