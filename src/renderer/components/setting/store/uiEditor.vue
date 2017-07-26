<template>
    <div class="popupMask center dark" @click.self="init.reject(false)">
        <div class="editor">
            <header>{{text('EDITOR.HEADER.UI')}}</header>
            <div class="inner">
                <div class="input">
                    <label>{{text('TITLE')}}</label>
                    <input v-model.trim="ui.head">
                </div>
                <div class="input">
                    <label>{{text('SUBTITLE')}}</label>
                    <input v-model.trim="ui.subhead">
                </div>
                <div class="input">
                    <label>{{text('ROUTE')}}</label>
                    <select v-model="ui.route">
                        <option :value="route" v-for="route in routes">{{route}}</option>
                    </select>
                </div>
                <div class="input">
                    <label>{{text('ICON')}}</label>
                    <select v-model="ui.icon">
                        <option :value="icon" v-for="icon in icons">{{icon}}</option>
                    </select>
                </div>
                <div class="default">
                    <checkbox label="ENABLE" v-model="ui.enable"></checkbox>
                </div>
            </div>
            <footer>
                <div class="btn" @click="init.reject(false)">{{text('CANCEL')}}</div>
                <div class="btn" @click="confirm">{{text('CONFIRM')}}</div>
            </footer>
        </div>
    </div>
</template>

<script>
import checkbox from '../common/checkbox'
export default {
    components: { checkbox },
    props: ['init'],
    created() {
        this.ui = Object.assign({}, this.init.ui);
    },
    data() {
        return {
            ui: null,
            icons: ['fa-user', 'fa-phone', 'fa-car', 'fa-cutlery', 'fa-list', 'fa-inbox', 'fa-cog', 'fa-lock'],
            routes: ['sale', 'order', 'pickup', 'delivery', 'table', 'buffet', 'history', 'setting', 'cashDrawer', 'lock']
        }
    },
    methods: {
        confirm() {
            this.init.resolve(this.ui)
        }
    }
}
</script>

<style scoped>
.default {
    border-top: 1px dashed #ccc;
    margin-top: 25px;
    padding-top: 15px;
    text-align: center;
}
</style>