<template>
    <div>
        <section class="card list">
            <header>
                <span>{{$t('setting.batchRecord')}}</span>
                <span class="tip">{{$t('setting.batchRecordTip')}}</span>
                <div class="search">
                    <i class="fa fa-search"></i>
                    <input type="text" v-model="keyword" @keydown.enter="search">
                </div>
            </header>
            <div class="listHeader">

            </div>
            <article>
                <div v-for="(customer,index) in customers" class="datalist" :key="index">
 
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
            records: [],
            keyword: "",
            page: 0
        }
    },
    created() {
        this.$socket.emit("[CMS] FETCH_BATCH_RECORDS", this.page);
    },
    methods: {
        del() {

        },
        add() {

        },
        search() {
            //this.$socket.emit("[CMS]")
        },
    },
    sockets: {
        BATCH_RECORDS(list) {
            this.records.push(...list);
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

.last {
    width: 200px;
}

i{
    padding: 0 10px;
    cursor: pointer;
}
</style>
