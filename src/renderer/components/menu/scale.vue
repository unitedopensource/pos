<template>
    <div class="popupMask center dark" @click.self="init.reject(false)">
        <div class="window">
            <header class="title">
                <span>{{text('WEIGHT_SCALE')}}</span>
                <span>{{item[language]}}</span>
            </header>
            <section class="inner">
                <div class="input">
                    <div>
                        <label>{{text('WEIGHT')}}</label>
                        <input type="text" v-model.number="scale" ref="scale" @keydown.enter="done">
                    </div>
                    <div>
                        <label>@</label>
                        <input type="text" v-model="item.unitPrice" :disabled="true">
                    </div>
                    <div>
                        <label>=
                            <span>{{total}}</span>
                        </label>
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
            this.scale = (((this.scale * 100) + num) / 100).toFixed(2)
        },
        del() {
            this.scale = (String(this.scale * 100).slice(0, -1) / 100).toFixed(2)
        },
        done() {
            let price = parseFloat(this.total);
            Object.assign(this.item, {
                single: 0.00,
                price: [0.00],
                prices: {
                    DEFAULT: [0.00]
                },
                choiceSet: [{
                    qty: 1,
                    zhCN: `${this.scale}@${this.item.unitPrice.toFixed(2)}/`+this.text('PER_UNIT'),
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
    height: 75px;
}

.wrap {
    display: flex;
    padding: 0 1px 0 3px;
}

section.numpad {
    display: flex;
    flex-wrap: wrap;
    width: 342px;
}

.zero {
    width: 337px;
}

.input {
    display: flex;
    margin-left: 3em;
    align-items: center;
}

.input input {
    font-size: 2em;
    width: 100px;
}
</style>