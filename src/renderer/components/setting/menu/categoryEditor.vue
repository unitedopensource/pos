<template>
    <div class="popupMask center dark" @click.self="init.reject">
        <div class="editor">
            <header>{{text('EDITOR.HEADER.CATEGORY')}}</header>
            <div class="inner">
                <div class="input">
                    <label>{{text('ZH_CN')}}</label>
                    <input v-model="category.zhCN">
                </div>
                <div class="input">
                    <label>{{text('US_EN')}}</label>
                    <input v-model="category.usEN">
                </div>
                <fieldset>
                    <legend>{{text('CONTAIN')}}</legend>
                    <div class="options">
                        <checkbox :label="name" v-model="contain" v-for="(name,index) in categories" :multiple="true" :key="index"></checkbox>
                    </div>
                </fieldset>
            </div>
            <footer>
                <div class="btn" @click="exit" id="cancelEdit">{{text('CANCEL')}}</div>
                <div class="btn" @click="confirm" id="confirmEdit">{{text('CONFIRM')}}</div>
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
        this.contain = this.category.contain.filter(category=>category);
    },
    data() {
        return {
            categories: [],
            category: null,
            contain: []
        }
    },
    methods: {
        exit() {
            this.init.reject();
        },
        confirm() {
            Object.assign(this.category, {
                contain: this.contain
            })
            this.init.resolve(this.category)
        }
    },
    sockets: {
        CATEGORIES_LIST(data) {
            this.categories = data.sort();
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
    border: 1px solid #eee;
}

legend {
    margin-left: 10px;
    padding: 0 5px;
    font-size: 20px;
}
</style>