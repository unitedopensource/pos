<template>
    <div class="popupMask center dark" @click.self="init.reject(false)">
        <div class="editor">
            <header>{{text('EDITOR.HEADER.TEMPLATE')}}</header>
            <div class="inner">
                <div class="input">
                    <label>{{text('NAME')}}</label>
                    <input v-model="template.template">
                </div>
                <smart-option v-model="edit" label="GROUP" :options="options" class="option"></smart-option>
                <div class="wrap">
                    <nav>
                        <div class="input">
                            <label>{{text('NAME')}}</label>
                            <input v-model="group.name">
                            <label>{{text('EDITOR.TEMPLATE.MAX')}}</label>
                            <input v-model.number="group.max">
                        </div>
                        <div class="input">
                            <label>{{text('EDITOR.TEMPLATE.ADDITION')}}</label>
                            <input v-model.number="group.addition">
                            <label>{{text('EDITOR.TEMPLATE.STARTAT')}}</label>
                            <input v-model.number="group.startAt">
                        </div>
                    </nav>
                </div>
                <fieldset>
                    <legend>{{text('CONTAIN')}}</legend>
                </fieldset>
            </div>
            <footer>
                <div class="f1">
                    <span class="del" @click="del">{{text('DELETE')}}</span>
                </div>
                <div class="btn" @click="init.reject(false)">{{text('CANCEL')}}</div>
                <div class="btn" @click="confirm">{{text('CONFIRM')}}</div>
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
        console.log(this.init.template);
        this.template = Object.assign({}, this.init.template);
        this.options = this.template.contain.map(each => each.name);
        this.edit = this.options[0] || "";
    },
    data() {
        return {
            template: null,
            options: null,
            group: {
                name: "",
                max: 0,
                addition: 0,
                startAt: 0
            },
            edit: null
        }
    },
    methods: {
        del() {
            this.init.reject(true);
        },
        confirm() {
            this.init.resolve(this.template)
        }
    },
    watch: {
        edit(n) {
            let index = this.template.contain.findIndex(group => group.name === n);
            this.group = this.template.contain[index];
        }
    }
}
</script>

<style scoped>
.option{
    display: inline-flex;
    justify-content: center;
    align-items: center;
    width: 300px;
}
fieldset{
    border:1px solid #ddd;
}
</style>