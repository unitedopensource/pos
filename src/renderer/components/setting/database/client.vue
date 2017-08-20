<template>
    <div>
        <section class="card list">
            <header>
                <span>{{text('CUST_INFO')}}</span>
                <span class="tip">{{text('SETTING.DATABASE.CUSTOMER.TIP')}}</span>
                <div class="search">
                    <i class="fa fa-search"></i>
                    <input type="text" v-model="search">
                </div>
            </header>
            <div class="listHeader">
                <span class="number">{{text('PHONE')}}</span>
                <span class="address">{{text('ADDRESS')}}</span>
                <span class="last">{{text('LAST_ACTIVITY')}}</span>
            </div>
            <article>
                <div v-for="(customer,index) in customers" class="datalist" :key="index">
                    <span class="number">{{customer.phone | tel}}</span>
                    <span class="address">{{customer.address}}
                        <span class="city" v-show="customer.city">, {{customer.city}}</span>
                    </span>
                    <span class="last">{{customer.extra.lastDate | fromNow}}</span>
                </div>
            </article>
        </section>
        <div :is="component" :init="componentData" @del="del"></div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            componentData: null,
            component: null,
            customers: [],
            search: "",
            page: 0
        }
    },
    created() {
        this.$socket.emit("[CMS] FETCH_CUSTOMERS", this.page);
    },
    methods: {
        del() {

        },
        add() {

        },
        search() {

        }
    },
    sockets: {
        CUSTOMER_LIST(list) {
            this.customers.push(...list);
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
    width: 180px;
    text-indent: 1em;
}

.address {
    flex: 1;
}

.city {
    color: #9E9E9E;
    margin-left: 5px;
}

.last{
    width: 200px;
}
</style>
