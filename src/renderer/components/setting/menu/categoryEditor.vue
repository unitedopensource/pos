<template>
    <div class="popupMask center dark" @click.self="init.reject">
        <div class="editor">
            <header>{{$t('setting.categoryEditor')}}</header>
            <div class="inner">
                <div class="input">
                    <label>{{$t('text.primary')}}</label>
                    <input v-model="category.zhCN">
                </div>
                <div class="input">
                    <label>{{$t('text.secondary')}}</label>
                    <input v-model="category.usEN">
                </div>
                <div class="input" v-show="manual">
                    <label>{{$t('text.contain')}}</label>
                    <input v-model="contains">
                </div>
                <fieldset v-show="!manual">
                    <legend>{{$t('text.contain')}}</legend>
                    <div class="options">
                        <checkbox :label="name" v-model="contain" v-for="(name,index) in categories" :multiple="true" :key="index"></checkbox>
                    </div>
                </fieldset>
            </div>
            <footer>
                <div class="f1">
                    <checkbox label="text.manualInput" v-model="manual" @input="trigger"></checkbox>
                </div>
                <div class="btn" @click="exit" id="cancelEdit">{{$t('button.cancel')}}</div>
                <div class="btn" @click="confirm" id="confirmEdit">{{$t('button.confirm')}}</div>
            </footer>
        </div>
    </div>
</template>

<script>
import checkbox from '../common/checkbox'
import smartOption from '../common/smartOption'
export default {
    components: { checkbox, smartOption },
    props: ['init'],
    created() {
        this.$socket.emit("INQURY_CATEGORIES");
        this.category = Object.assign({}, this.init.category);
        this.contain = this.category.contain.filter(category => category);
    },
    data() {
        return {
            categories: [],
            category: null,
            contains: "",
            contain: [],
            manual: false
        }
    },
    methods: {
        exit() {
            this.init.reject();
        },
        trigger() {
            this.contains = this.contain.join(",");
        },
        confirm() {
            let contain = this.manual ? this.contains.split(",") : this.contain;
            Object.assign(this.category, { contain })
            this.category.item = [];
            this.$socket.emit("[CMS] MODIFY_CATEGORY", { category: this.category, index: this.init.index });
            this.init.resolve()
        }
    },
    sockets: {
        CATEGORIES_LIST(data) {
            this.categories = data.sort()
        }
    }
}
</script>

<style scoped>
.options {
    display: flex;
    flex-wrap: wrap;
    width: 550px;
    padding: 10px;
    justify-content: space-between;
}

.options .checkbox {
    width: 150px;
}

fieldset {
    border: 1px solid #E0E0E0;
    background: #fff;
}

legend {
    margin-left: 10px;
    padding: 0 5px;
    font-size: 20px;
}

.f1 {
    padding: 0 15px;
}
</style>