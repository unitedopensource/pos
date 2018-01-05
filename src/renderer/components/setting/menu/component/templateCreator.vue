<template>
    <div class="popupMask setting center dark" @click.self="init.reject">
        <div class="editor">
            <header>
                <h5>{{$t('title.create')}}</h5>
                <h3>{{$t('title.template')}}</h3>
            </header>
            <div class="wrap">
                <inputer title="text.alias" v-model="init.template.name" :autoFocus="true"></inputer>
                <inputer title="text.note" v-model="init.template.note"></inputer>
                <selector title="text.copy" v-model="source" :opts="templates"></selector>
            </div>
            <footer>
                <button class="btn" @click="confirm">{{$t('button.confirm')}}</button>
            </footer>
        </div>
    </div>
</template>

<script>
import inputer from "../../common/inputer";
import selector from "../../common/selector";

export default {
    props: ["init"],
    components: { inputer, selector },
    data() {
        return {
            templates: this.$store.getters.templates.map(t => ({
                label: t.name,
                tooltip: t.note,
                plainText: true,
                value: t.name
            })),
            source: ""
        }
    },
    created() {
        this.templates.unshift({
            label: this.$t('text.noUse'),
            tooltip: "",
            plainText: true,
            value: ""
        })
    },
    methods: {
        confirm() {


            this.init.resolve(this.init.template)
        }
    }
};
</script>