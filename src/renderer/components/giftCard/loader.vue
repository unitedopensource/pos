<template>
    <div class="popupMask center dark">
        <div class="window" v-show="!component">
            <header class="title">
                <span>{{$t('title.reload')}}</span>
                <i class="fa fa-times" @click.self="init.reject"></i>
            </header>
            <div class="inner">
                <input type="text" v-model="value" :placeholder="balance" ref="entry">
                <section class="numpad">
                    <div @click="input('7')">7</div>
                    <div @click="input('8')">8</div>
                    <div @click="input('9')">9</div>
                    <div @click="input('4')">4</div>
                    <div @click="input('5')">5</div>
                    <div @click="input('6')">6</div>
                    <div @click="input('1')">1</div>
                    <div @click="input('2')">2</div>
                    <div @click="input('3')">3</div>
                    <div @click="input('.')">.</div>
                    <div @click="input('0')">0</div>
                </section>
                <aside class="numpad">
                    <div @click="del">&#8592;</div>
                    <div @click="verify">&#8626;</div>
                </aside>
            </div>
        </div>
        <div :is="component" :init="componentData"></div>
    </div>
</template>

<script>
import { mapGetters } from 'vuex'
import dialoger from '../common/dialoger'
export default {
    props: ['init'],
    components: { dialoger },
    data() {
        return {
            componentData: null,
            component: null,
            balance: '0.00',
            reset: true,
            value: 0
        }
    },
    created() {
        this.init.hasOwnProperty('balance') && (this.balance = this.init.balance);
        !this.station.cashDrawer.enable && this.noCashDrawer()
    },
    mounted() {
        this.$refs.entry.focus()
    },
    computed: {
        ...mapGetters(['station'])
    },
    methods: {
        noCashDrawer() {
            this.$dialog({
                title: 'dialog.cashDrawerUnavailable', msg: 'dialog.cashDrawerUnavailableTip',
                timeout: { duration: 5000, fn: 'resolve' },
                buttons: [{ text: 'button.confirm', fn: 'resolve' }]
            }).then(() => {
                this.init.reject()
            })
        },
        input(string) {
            if (String(this.value).includes('.') && string === '.') return;
            this.reset ? this.value = string : this.value += string;
            this.reset = false;
        },
        del() {
            this.value = this.value.slice(0, -1)
        },
        verify() {
            !isNumber(this.value) ?
                this.$dialog({
                    title: 'dialog.entryInvalid', msg: 'dialog.entryMustBeNumber',
                    buttons: [{ text: 'button.confirm', fn: 'resolve' }]
                }).then(() => {
                    this.$q()
                    this.value = 0;
                    this.reset = true;
                }) : this.continute();
        },
        continute() {
            this.$dialog({
                title: 'dialog.giftCardReload', msg: ['dialog.confirmEntryValue', this.value.toFixed(2)]
            }).then(() => {
                this.init.resolve(parseFloat(this.value))
            }).catch(() => {
                this.$q()
            })
        }
    }
}
</script>

<style scoped>
section.numpad {
    display: inline-flex;
    flex-wrap: wrap;
    width: 342px;
    margin-left: 2px;
}

input {
    display: block;
    padding: 8px;
    font-size: 1.5em;
    border: 2px solid #ccc;
    margin: 25px auto;
    text-align: right;
    font-family: 'Microsoft YaHei';
}

aside.numpad {
    display: inline-flex;
    flex-direction: column;
    margin-left: -5px;
}

section.numpad div:last-child {
    width: 223px;
}

aside.numpad div:last-child {
    height: 228px;
    line-height: 228px;
}
</style>