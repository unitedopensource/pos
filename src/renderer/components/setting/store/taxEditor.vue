<template>
    <div class="popupMask center dark" @click.self="init.reject(false)">
        <div class="editor">
            <header>{{$t('setting.taxEditor')}}</header>
            <div class="inner">
                <div class="input">
                    <label>{{$t('setting.name')}}</label>
                    <input v-model="tax.alies">
                </div>
                <div class="input">
                    <label>{{$t('text.taxRate')}}</label>
                    <input v-model.number="tax.rate">
                </div>
                <div class="option">
                    <div class="tip">
                        <h3>{{$t('text.apply')}}</h3>
                        <span>{{$t('setting.taxApplyTip')}}</span>
                    </div>
                    <div>
                        <checkbox v-model="tax.apply.WALK_IN" label="type.WALK_IN"></checkbox>
                        <checkbox v-model="tax.apply.PICK_UP" label="type.PICK_UP"></checkbox>
                        <checkbox v-model="tax.apply.DELIVERY" label="type.DELIVERY"></checkbox>
                        <checkbox v-model="tax.apply.DINE_IN" label="type.DINE_IN"></checkbox>
                        <checkbox v-model="tax.apply.BAR" label="type.BAR"></checkbox>
                        <checkbox v-model="tax.apply.SALES" label="type.SALES"></checkbox>
                    </div>
                </div>
                <div class="default">
                    <checkbox label="text.setDefault" v-model="tax.default"></checkbox>
                </div>
            </div>
            <footer>
                <div class="f1">
                    <span class="del" @click="del">{{$t('button.delete')}}</span>
                </div>
                <div class="btn" @click="init.reject(false)">{{$t('button.cancel')}}</div>
                <div class="btn" @click="confirm">{{$t('button.confirm')}}</div>
            </footer>
        </div>
    </div>
</template>

<script>
import checkbox from '../common/checkbox'
export default {
    components: { checkbox },
    props: ['init'],
    data() {
        return {
            tax: null
        }
    },
    created() {
        this.tax = Object.assign({}, this.init.tax);
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