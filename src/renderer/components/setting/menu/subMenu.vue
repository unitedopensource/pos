<template>
    <div class="layout">
        <div class="groups">
            <div class="wrap">
                <div class="group" v-for="(group,index) in groups" :key="index" @click="getItems(group)">
                    <span>{{group}}</span>
                    <i class="fa fa-angle-right"></i>
                </div>
                <div class="add">
                    <i class="fa fa-plus"></i>
                    <span>{{$t('button.new')}}</span>
                </div>
            </div>
        </div>
        <div class="items">
            <div v-for="(item,index) in items" :key="index" :class="{disable:!item.clickable}" @contextmenu="edit(item)">
                {{item[language]}}
            </div>
        </div>
    </div>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
    computed: {
        ...mapGetters(['submenu', 'language'])
    },
    data() {
        return {
            groups: [],
            items: []
        }
    },
    created() {
        this.groups = Object.keys(this.submenu)
    },
    methods: {
        getItems(group) {
            let items = JSON.parse(JSON.stringify(this.submenu[group]));
            let length = items.length;

            length < 33 && Array(33 - length).fill().forEach(_ => { items.push({ zhCN: "", usEN: "", clickable: false, group: null }) });

            this.items = items;
        },
        edit(item){
            console.log(item)
        }
    }
}
</script>

<style scoped>
.layout {
    display: flex;
}

.groups {
    display: inline-flex;
    flex-direction: column;
    width: 200px;
    height: 100%;
    border-right: 1px solid #eee;
    background: #F5F5F5;
}

.groups header {
    text-align: center;
    padding: 10px 0;
    border-bottom: 1px solid #eee;
}

.group {
    padding: 15px 10px;
    border-bottom: 1px solid #ECEFF1;
    cursor: pointer;
    display: flex;
    background: #fff;
}

.group span {
    flex: 1;
}

.add {
    padding: 15px;
    text-align: center;
    background: #607D8B;
    color: #fff;
    cursor: pointer;
    text-shadow: 0 1px 1px #333;
}

.items {
    flex: 1;
    max-width: 414px;
}
</style>