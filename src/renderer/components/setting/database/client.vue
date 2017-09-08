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
                <span class="info">{{$t('text.info')}}</span>
                <span class="action">{{$t('text.action')}}</span>
            </div>
            <article>
                <div v-for="(customer,index) in customers" class="datalist" :key="index">
                    <div class="number">
                        <span class="phone">{{customer.phone | phone}}</span>
                        <span class="name">{{customer.name}}</span>
                    </div>
                    <div class="address">
                        <span class="street">{{customer.address}}</span>
                        <span class="city">{{customer.city}}</span>
                    </div>
                    <div class="info">
                        <div>
                            <span class="text">{{$t('text.orderCount')}}</span>
                            <span class="value">{{customer.extra.orderCount}}</span>
                        </div>
                        <div>
                            <span class="text">{{$t('text.orderAmount')}}</span>
                            <span class="value">$ {{customer.extra.orderAmount | decimal}}</span>
                        </div>
                        <div>
                            <span class="text">{{$t('dashboard.lastTime')}}</span>
                            <span class="value">{{customer.extra.lastDate | fromNow}}</span>
                        </div>
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

.number {
    width: 150px;
    text-indent: 1em;
    display: flex;
    flex-direction: column;
}

.address {
    display: flex;
    flex-direction: column;
    width: 250px;
}

.city {
    color: #9E9E9E;
}

.info {
    flex: 1;
    display: flex;
    flex-direction: row;
}

.info div {
    display: flex;
    flex-direction: column;
}

.datalist i {
    padding: 10px 15px;
    cursor: pointer;
}

span.phone {
    font-weight: bold;
}

.info div {
    margin: 0 10px;
    text-align: center;
}

.action {
    width: 50px;
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
