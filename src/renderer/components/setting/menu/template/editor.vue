<template>
    <div class="popupMask setting dark center" @click.self="init.reject">
        <div class="editor">
            <header>
                <h5></h5>
                <h3>{{$t('title.template')}}</h3>
            </header>
            <div class="wrap">
                <inputer title="text.primary" v-model="item.usEN"></inputer>
                <inputer title="text.secondary" v-model="item.zhCN"></inputer>
                <inputer title="text.price" v-model.number="item.price"></inputer>
                <div class="checkboxes">
                    <checkbox :title="name" v-model="item.print" :val="name" v-for="(name,index) in init.printers" :key="index" :multiple="true" :translate="false"></checkbox>
                </div>
            </div>
            <footer>
                <div class="opt">
                    <span class="del">{{$t('button.delete')}}</span>
                </div>
                <button class="btn" @click="confirm">{{$t('button.confirm')}}</button>
            </footer>
        </div>
    </div>
</template>

<script>
import inputer from "../../common/inputer";
import checkbox from "../../common/checkbox";

export default {
    props: ["init"],
    components: { inputer, checkbox },
    data() {
        return {
            item: JSON.parse(JSON.stringify(this.init.item))
        }
    },
    methods: {
        confirm() {

        }
    }
}
</script>