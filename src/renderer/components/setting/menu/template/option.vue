<template>
    <div class="popupMask setting center dark" @click.self="init.reject">
        <div class="editor">
            <header>
                <h5></h5>
                <h3>{{$t('button.option')}}</h3>
            </header>
            <div class="wrap">
                <inputer title="text.alias" v-model="option.name"></inputer>
                <inputer title="text.maxItem" v-model.number="option.max"></inputer>
                <inputer title="text.startAt" v-model="option.startAt"></inputer>
                <inputer title="text.overCharge" v-model="option.addition"></inputer>
            </div>
            <footer>
                <button class="btn" @click="confirm">{{$t('button.confirm')}}</button>
            </footer>
        </div>
    </div>
</template>

<script>
import inputer from "../../common/inputer";
export default {
    props: ["init"],
    components: { inputer },
    data() {
        return {
            option: JSON.parse(JSON.stringify(this.init.option))
        }
    },
    methods: {
        confirm() {

        }
    }
}
</script>