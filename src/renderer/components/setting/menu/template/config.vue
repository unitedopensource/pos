<template>
    <div>
        <header class="nav">
            <div class="back" @click="save">
                <i class="fa fa-chevron-left"></i>
            </div>
            <div class="title">
                <h5>{{$t('title.template')}}</h5>
                <h3>{{template.name}}</h3>
            </div>
            <nav>
                <span @click="remove">{{$t('button.remove')}}</span>
            </nav>
        </header>
        <text-input title="text.note" v-model="template.note"></text-input>
        <toggle title="text.insert" tooltip="tip.insertTemplateItem" v-model="template.insert"></toggle>
        <toggle title="text.autoJump" tooltip="tip.autoJumpNext" v-model="template.jumpNext"></toggle>
        <external title="text.contain"></external>
    </div>
</template>

<script>
import toggle from "../../common/toggle";
import external from "../../common/external";
import textInput from "../../common/textInput";
export default {
    props: ["template"],
    components: { toggle, external, textInput },
    data() {
        return {

        }
    },
    methods: {
        save() {



            this.$emit("reset");
        },
        remove() {

        }
    }
}
</script>

<style scoped>

</style>