<template>
    <div class="popupMask center dark" @click.self="init.reject(false)">
        <div class="window">
            <header class="title">
                <span>{{$t('menu.scale')}}</span>
                <span>{{item[language]}}</span>
            </header>
            <section class="inner">
                <div class="input">
                    <div>
                        <h3>{{$t('text.weight')}}</h3>
                        <input type="text" v-model.number="scale" ref="scale" @keydown.enter="done" class="value">
                    </div>
                    <div>
                        <h3>@ {{item.unitPrice.toFixed(2)}} / {{$t('text.perUnit')}}</h3>
                        <span class="value">{{total}}</span>
                    </div>
                </div>
                <div class="wrap">
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
                        <div @click="input('0')" class="zero">0</div>
                    </section>
                    <aside class="numpad">
                        <div @click="del">&#8592;</div>
                        <div @click="scale = '0.00'">C</div>
                        <div @click="done">&#8626;</div>
                    </aside>
                </div>
            </section>
        </div>
    </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
export default {
    props: ['init'],
    data() {
        return {
            item: null,
            scale: "0.00"
        }
    },
    created() {
        this.item = JSON.parse(JSON.stringify(this.init.item))
    },
    mounted() {
        this.$refs.scale.focus();
    },
    methods: {
        input(num) {
            let value = Math.round(parseFloat(this.scale) * 100);
            if(value + num > 99999)return;
            this.scale = ((value + num) / 100).toFixed(2);
        },
        del() {
            this.scale = (String(this.scale * 100).toFixed(0).slice(0, -1) / 100).toFixed(2)
        },
        done() {
            let price = parseFloat(this.total);
            Object.assign(this.item, {
                single: 0.00,
                price: [0.00],
                total: "",
                prices: {
                    DEFAULT: [0.00]
                },
                choiceSet: [{
                    qty: 1,
                    zhCN: `${this.scale}@${this.item.unitPrice.toFixed(2)}/` + this.$t('text.perUnit'),
                    usEN: `${this.scale}@${this.item.unitPrice.toFixed(2)}/per Unit`,
                    single: price,
                    price: this.total
                }]
            })
            this.addToOrder(this.item);
            this.init.resolve();
        },
        ...mapActions(['addToOrder'])
    },
    computed: {
        total() {
            return (this.scale * this.item.unitPrice).toFixed(2)
        },
        ...mapGetters(['language'])
    }

}
</script>

<style scoped>
.input {
    display: flex;
    width: 460px;
}

.wrap {
    display: flex;
    padding: 0 1px 0 4px;
}

section.numpad {
    display: flex;
    flex-wrap: wrap;
    width: 342px;
}

.zero {
    width: 337px;
}

.input div {
    flex: 1;
    height: 90px;
    margin: 6px;
    border-radius: 2px;
    background: #fff;
    box-shadow: var(--shadow);
}

h3 {
    padding: 8px 5px;
    border-bottom: 1px solid #eee;
    background: #607D8B;
    color: #fff;
    text-align: center;
    font-weight: normal;
}

input {
    width: 100%;
    border: none;
}

.value {
    font-size: 43px;
    font-family: 'Agency FB';
    font-weight: bold;
    color: #616161;
    letter-spacing: 4px;
    text-align: right;
    display: block;
}




/* .input {
    display: flex;
    margin-left: 3em;
    align-items: center;
}

.input input {
    font-size: 2em;
    width: 100px;
} */
</style>