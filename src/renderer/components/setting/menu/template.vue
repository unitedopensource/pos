<template>
    <div>
        <section class="card list">
            <header>{{text('TEMPLATE')}}
                <span class="tip">{{text('SETTING.TEMPLATE.TIP')}}</span>
            </header>
            <div class="header">
                <span class="name">{{text('NAME')}}</span>
                <span class="f1">{{text('CONTAIN')}}</span>
                <span class="action">{{text('ACTION')}}</span>
            </div>
            <article>
                <div v-for="(name,index) in builder" class="datalist" :key="index">
                    <span class="name">{{name.template}}</span>
                    <span class="f1">
                        <div v-for="(item,i) in name.contain" :key="i">
                            <span>{{item.name}}</span>
                            <span>({{item.contain.length}})</span>
                        </div>
                    </span>
                    <span class="action" @click="edit(name,index)">
                        <span>
                            <i class="fa fa-pencil"></i>
                            <span>{{text("EDIT")}}</span>
                        </span>
                    </span>
                </div>
                <div class="datalist add" @click="add()">
                    <i class="fa fa-3x fa-plus"></i>
                </div>
            </article>
        </section>
        <div :is="component" :init="componentData"></div>
    </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import smartSwitch from '../common/smartSwitch'
import smartInput from '../common/smartInput'
import checkbox from '../common/checkbox'
import editor from './templateEditor'
export default {
    components: { smartInput, smartSwitch, checkbox, editor },
    created() {
        this.builder = JSON.parse(JSON.stringify(this.templates))
    },
    data() {
        return {
            builder: null,
            change: false,
            component: null,
            componentData: null
        }
    },
    methods: {
        edit(template, index) {
            new Promise((resolve, reject) => {
                this.componentData = { resolve, reject, template };
                this.component = "editor";
            }).then(result => {
                this.builder.splice(index, 1, result);
                //update
                this.$exitComponent();
            }).catch(del => {
                del && this.builder.splice(index, 1) && (this.change = true);
                this.$exitComponent();
            })
        },
        add() {
            let name = "template" + (this.builder.length + 1);
            this.builder.push({
                template: name,
                contain: [{
                    name:"sample",
                    addition:0,
                    startAt:0,
                    contain:[{
                        zhCN:"",
                        usEN:"",
                        price:0
                    }]
                }]
            })
        }
    },
    watch: {
        builder: {
            handler(n) {
                // let keys = Object.keys(n);
                // this.change = keys.some(key => {
                //     return typeof n[key] === 'string' ?
                //         n[key] !== this.store.tax[key] :
                //         JSON.stringify(n[key]) !== JSON.stringify(this.store.tax[key]);
                // })
                // this.change ?
                //     this.$emit("change", Object.assign({}, this.store, { tax: n })) : this.$emit("unchange");
            }, deep: true
        }
    },
    computed: {
        ...mapGetters(['templates'])
    }
}
</script>

<style scoped>
.list .header {
    padding: 10px 0;
    background: #4D6D83;
    color: #fff;
    display: flex;
    border-bottom: 1px solid #455A64;
}

.name,
.rate {
    width: 90px;
    padding:0 15px;
}

.action {
    width: 70px;
    cursor: pointer;
}

.datalist.add {
    color: gainsboro;
    justify-content: center;
    border: 2px dashed;
    cursor: pointer;
}

.datalist.add:active {
    background: #F5F5F5;
}
</style>