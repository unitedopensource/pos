<template>
    <div class="popupMask center dark">
        <div class="editor">
            <header class="title">
                <span>{{$t('setting.newPrinter')}}</span>
            </header>
            <div class="inner">
                <div class="input">
                    <label>{{$t('text.name')}}</label>
                    <input type="type" v-model="printer" @keydown.enter="confirm" ref="name">
                </div>
                <div class="default">
                    <checkbox label="text.labelPrinter" v-model="label"></checkbox>
                </div>
            </div>
            <footer>
                <div class="f1">
                    <!-- <checkbox v-model="all" label="text.autoAdd"></checkbox> -->
                </div>
                <div class="btn" @click="init.reject">{{$t('button.cancel')}}</div>
                <div class="btn" @click="confirm">{{$t('button.confirm')}}</div>
            </footer>
        </div>
    </div>
</template>

<script>
import checkbox from '../common/checkbox'
export default {
    props: ['init'],
    components: { checkbox },
    data() {
        return {
            all: true,
            printer: "",
            label: false
        }
    },
    mounted(){
        this.$refs.name.focus()
    },
    methods: {
        confirm() {
            if(!this.printer) return;
            this.init.resolve({
                name: this.printer,
                label: this.label,
                add: this.all
            })
        }
    }
}
</script>

<style></style>