<template>
    <div class="popupMask center dark" @click.self="init.reject(false)">
        <div class="editor">
            <header>{{text('TABLE_EDITOR')}}</header>
            <div class="inner">
                <div class="input">
                    <label for="primary">{{text('ZH_CN')}}</label>
                    <input v-model="section.zhCN" id="primary">
                </div>
                <div class="input">
                    <label for="secondary">{{text('US_EN')}}</label>
                    <input v-model="section.usEN" id="secondary">
                </div>
                <div class="input">
                    <label for="zone">{{text('ZONE')}}</label>
                    <input v-model="section.zone" id="zone">
                </div>
            </div>
            <footer>
                <div class="f1">
                    <span class="del" @click="init.reject(true)">{{text('DELETE')}}</span>
                </div>
                <div class="btn" @click="confirm">{{text('CONFIRM')}}</div>
            </footer>
        </div>
    </div>
</template>

<script>
export default {
    props: ['init'],
    created() {
        this.section = JSON.parse(JSON.stringify(this.init.section));
        this.section.item = [];
    },
    data() {
        return {
            section: null
        }
    },
    methods: {
        confirm() {
            console.log(this.section)
            this.init.resolve(this.section);
        }
    }
}
</script>

<style></style>
