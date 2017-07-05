<template>
    <div class="popupMask center dark" @click.self="init.reject(false)">
        <div class="editor">
            <header>{{text('EDITOR.HEADER.TAX')}}</header>
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
                    <div class="tip">
                        <h3>{{text('APPLY')}}</h3>
                        <span>{{text('EDITOR.TAX.TIP')}}</span>
                    </div>
                    <div>
                        <checkbox v-model="tax.apply.WALK_IN" label="WALK_IN"></checkbox>
                        <checkbox v-model="tax.apply.PICK_UP" label="PICK_UP"></checkbox>
                        <checkbox v-model="tax.apply.DELIVERY" label="DELIVERY"></checkbox>
                        <checkbox v-model="tax.apply.DINE_IN" label="DINE_IN"></checkbox>
                        <checkbox v-model="tax.apply.BAR" label="BAR"></checkbox>
                    </div>
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
    display: flex;
    align-items: center;
}

.tip {
    width: 113px;
}

h3 {
    font-weight: normal;
}

.tip span {
    font-size: 13px;
    font-style: italic;
    color: gray;
}
</style>