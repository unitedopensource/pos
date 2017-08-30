<template>
    <div class="popupMask center dark" @click.self="init.reject(false)">
        <div class="editor">
            <header>{{$t('setting.sectionEditor')}}</header>
            <div class="inner">
                <div class="input">
                    <label for="primary">{{$t('text.primary')}}</label>
                    <input v-model="section.usEN" id="primary">
                </div>
                <div class="input">
                    <label for="secondary">{{$t('text.secondary')}}</label>
                    <input v-model="section.zhCN" id="secondary">
                </div>

                <div class="input">
                    <label for="zone">{{$t('text.section')}}</label>
                    <input v-model="section.zone" id="zone">
                </div>
            </div>
            <footer>
                <div class="f1">
                    <span class="del" @click="init.reject(true)">{{$t('button.delete')}}</span>
                </div>
                <div class="btn" @click="confirm">{{$t('button.confirm')}}</div>
            </footer>
        </div>
    </div>
</template>

<script>
export default {
    props: ['init'],
    created() {
        this.section = JSON.parse(JSON.stringify(this.init.section));
    },
    data() {
        return {
            section: null
        }
    },
    methods: {
        confirm() {
            this.init.resolve(this.section);
        }
    }
}
</script>

<style></style>
