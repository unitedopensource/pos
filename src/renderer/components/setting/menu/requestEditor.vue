<template>
    <div class="popupMask center dark" @click.self="init.reject(false)">
        <div class="editor">
            <header>{{text('EDITOR.HEADER.REQUEST')}}</header>
            <div class="inner">
                <div class="input">
                    <label>{{text('ALIES')}}</label>
                    <input v-model="tax.alies">
                </div>
                <div class="input">
                    <label>{{text('TAX_RATE')}}</label>
                    <input v-model.number="tax.rate">
                </div>
                <div class="option">
                    <checkbox v-model="tax.apply.WALK_IN" label="WALK_IN"></checkbox>
                    <checkbox v-model="tax.apply.PICK_UP" label="PICK_UP"></checkbox>
                    <checkbox v-model="tax.apply.DELIVERY" label="DELIVERY"></checkbox>
                    <checkbox v-model="tax.apply.DINE_IN" label="DINE_IN"></checkbox>
                    <checkbox v-model="tax.apply.BAR" label="BAR"></checkbox>
                </div>
                <div class="default">
                    <checkbox label="SET_DEFAULT" v-model="tax.default"></checkbox>
                </div>
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
export default {
    components: { checkbox },
    props: ['init'],
    created() {
        console.log(this.init.tax);
        this.tax = Object.assign({}, this.init.tax);
    },
    data() {
        return {
            tax: null
        }
    },
    methods: {
        del() {
            this.init.reject(true);
        },
        confirm() {
            this.init.resolve(this.tax)
        }
    }
}
</script>

<style scoped>
.option {
    text-indent: 10px;
}

.default {
    margin-top: 10px;
    border-top: 1px dashed #eee;
    padding-top: 15px;
}

</style>