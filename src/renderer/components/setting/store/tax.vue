<template>
    <div>
        <section class="card">
            <header>{{$t('setting.taxCalculation')}}
                <span class="tip">{{$t('setting.taxCalculationTip')}}</span>
            </header>
            <article>
                <smart-switch v-model="tax.beforeDisc" label="text.taxBeforeDiscount"></smart-switch>
                <smart-switch v-model="tax.beforeCredit" label="text.taxBeforeCredit"></smart-switch>
            </article>
        </section>
        <section class="card list">
            <header>{{$t('taxClass')}}
                <span class="tip"></span>
            </header>
            <div class="header">
                <span class="name">{{$t('text.name')}}</span>
                <span class="rate">{{$t('text.taxRate')}}</span>
                <span class="f1">{{$t('text.apply')}}</span>
                <span class="action">{{$t('text.action')}}</span>
            </div>
            <article>
                <div v-for="(category,key,index) in tax.class" class="datalist" :key="index">
                    <span class="name">{{category.alies}}</span>
                    <span class="rate">{{category.rate}}%</span>
                    <span class="f1">
                        <checkbox v-model="category.apply.WALK_IN" label="type.WALK_IN"></checkbox>
                        <checkbox v-model="category.apply.PICK_UP" label="type.PICK_UP"></checkbox>
                        <checkbox v-model="category.apply.DELIVERY" label="type.DELIVERY"></checkbox>
                        <checkbox v-model="category.apply.DINE_IN" label="type.DINE_IN"></checkbox>
                        <checkbox v-model="category.apply.BAR" label="type.BAR"></checkbox>
                        <checkbox v-model="category.apply.BUFFET" label="type.BUFFET"></checkbox>
                        <checkbox v-model="category.apply.SALES" label="type.SALES"></checkbox>
                    </span>
                    <span class="action" @click="edit(category,key)">
                        <span>
                            <i class="fa fa-pencil"></i>
                            <span>{{$t('text.edit')}}</span>
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
import smartInput from '../common/smartInput'
import smartSwitch from '../common/smartSwitch'
import checkbox from '../common/checkbox'
import editor from './taxEditor'
export default {
    components: { smartInput, smartSwitch, checkbox, editor },
    created() {
        this.tax = JSON.parse(JSON.stringify(this.store.tax))
    },
    data() {
        return {
            tax: null,
            change: false,
            component: null,
            componentData: null
        }
    },
    methods: {
        edit(tax, key) {
            new Promise((resolve, reject) => {
                this.componentData = { resolve, reject, tax };
                this.component = "editor";
            }).then(result => {
                result.default &&
                    Object.keys(this.tax.class).forEach(key => {
                        this.tax.class[key].default = false
                    })
                this.tax.class[key] = result;
                this.$q();
            }).catch(del => {
                del && delete this.tax.class[key] && (this.change = true);
                this.$q();
            })
        },
        add() {
            let name = "tax" + ++Object.keys(this.tax.class).length;
            this.$set(this.tax.class, name, {
                alies: name,
                default: false,
                rate: 0,
                apply: {
                    WALK_IN: false,
                    PICK_UP: false,
                    DELIVERY: false,
                    DINE_IN: false,
                    BAR: false,
                    SALES:false
                }
            })
        }
    },
    watch: {
        tax: {
            handler(n) {
                let keys = Object.keys(n);
                this.change = keys.some(key => {
                    return typeof n[key] === 'string' ?
                        n[key] !== this.store.tax[key] :
                        JSON.stringify(n[key]) !== JSON.stringify(this.store.tax[key]);
                })
                this.change ?
                    this.$emit("change", Object.assign({}, this.store, { tax: n })) : this.$emit("unchange");
            }, deep: true
        }
    },
    computed: {
        ...mapGetters(['store'])
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
    width: 70px;
    text-align: center;
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

.f1 {
    display: flex;
    padding: 0 20px;
    flex-wrap: wrap;
}
</style>