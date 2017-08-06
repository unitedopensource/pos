<template>
    <div class="popupMask center dark" @click.self="init.reject(false)">
        <div class="window">
            <header class="title">
                <span>{{text('CASH_IN_COUNT')}}</span>
                <span class="cash">$ {{amount.toFixed(2)}}</span>
            </header>
            <section class="inner">
                <aside>
                    <div @click="change('hundred')" class="hundred">
                        <span class="text">$ 100</span>
                        <input type="text" v-model="hundred">
                    </div>
                    <div @click="change('fifty')" class="fifty">
                        <span class="text">$ 50</span>
                        <input type="text" v-model="fifty">
                    </div>
                    <div @click="change('twenty')" class="twenty">
                        <span class="text">$ 20</span>
                        <input type="text" v-model="twenty">
                    </div>
                    <div @click="change('ten')" class="ten">
                        <span class="text">$ 10</span>
                        <input type="text" v-model="ten">
                    </div>
                    <div @click="change('five')" class="five">
                        <span class="text">$ 5</span>
                        <input type="text" v-model="five">
                    </div>
                    <div @click="change('one')" class="one">
                        <span class="text">$ 1</span>
                        <input type="text" v-model="one">
                    </div>
                    <div @click="change('quarter')" class="quarter">
                        <span class="text">$ 0.25</span>
                        <input type="text" v-model="quarter">
                    </div>
                    <div @click="change('dime')" class="dime">
                        <span class="text">$ 0.10</span>
                        <input type="text" v-model="dime">
                    </div>
                    <div @click="change('nickel')" class="nickel">
                        <span class="text">$ 0.05</span>
                        <input type="text" v-model="nickel">
                    </div>
                    <div @click="change('penny')" class="penny">
                        <span class="text">$ 0.01</span>
                        <input type="text" v-model="penny">
                    </div>
                </aside>
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
                    <div @click="input('0')">0</div>
                    <div @click="del" class="del">←</div>
                </section>
            </section>
            <footer>
                <div class="btn" @click="confirm">{{text('CONFIRM')}}</div>
            </footer>
        </div>
    </div>
</template>

<script>
export default {
    props: ['init'],
    data() {
        return {
            hundred: 0,
            fifty: 0,
            twenty: 0,
            ten: 0,
            five: 0,
            one: 0,
            quarter: 0,
            dime: 0,
            nickel: 0,
            penny: 0,
            anchor: '',
            reset: true
        }
    },
    mounted() {
        this.anchor = 'hundred'
    },
    methods: {
        input(num) {
            if (parseInt(this[this.anchor]) === 0 || this.reset === true) {
                this[this.anchor] = num;
                this.reset = false;
            } else if (parseInt(this[this.anchor] + num) < 1000) {
                this[this.anchor] += num;
            }
        },
        change(anchor) {
            this.anchor = anchor;
            this.reset = true;
        },
        del() {
            this[this.anchor] = Number(this[this.anchor]) < 10 ? 0 : this[this.anchor].slice(0, -1);
        },
        confirm() {
            this.init.resolve(this.amount);
        }
    },
    watch: {
        anchor(n) {
            let dom = document.querySelector(".active");
            dom && dom.classList.remove("active");
            dom = document.querySelector(`.${n}`);
            dom && dom.classList.add("active");
        }
    },
    computed: {
        amount() {
            return this.hundred * 100 + this.fifty * 50 + this.twenty * 20 + this.ten * 10 + this.five * 5 + this.one * 1 + this.quarter * 0.25 + this.dime * 0.1 + this.nickel * 0.05 + this.penny * 0.01;
        }

    }
}
</script>

<style scoped>
.inner {
    display: flex;
    flex-direction: row;
}

aside>div {
    display: flex;
    margin: 5px;
    font-size: 22px;
    color: #333;
}

aside {
    border-right: 1px solid #ddd;
    width: 130px;
    padding: 5px 10px;
}

aside input {
    width: 50px;
    border: 1px solid #ddd;
    text-indent: 7px;
    font-size: 22px;
    color: #9E9E9E;
    outline: none;
}

aside span {
    flex: 1;
}

aside .active {
    border-right: 2px solid #2196F3;
}

.active input {
    color: #333;
}

section.numpad {
    display: flex;
    flex-wrap: wrap;
    max-width: 342px;
    padding: 5px 0 0px 5px;
}

.del {
    width: 222px;
    background: #78909C;
}
</style>