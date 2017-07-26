<template>
    <div class="popupMask center dark" @click.self="init.reject(false)">
        <div class="window">
            <header class="title">
                <span>{{text('CASH_IN_COUNT')}}</span>
                <span class="cash">$ {{amount.toFixed(2)}}</span>
            </header>
            <div class="inner">
                <div class="bill">
                    <div @click="pointer ='hundred'" class="hundred">
                        <span class="value">{{hundred}}</span>
                        <span class="text">$ 100</span>
                    </div>
                    <div @click="pointer ='fifty'" class="fifty">
                        <span class="value">{{fifty}}</span>
                        <span class="text">$ 50</span>
                    </div>
                    <div @click="pointer ='twenty'" class="twenty">
                        <span class="value">{{twenty}}</span>
                        <span class="text">$ 20</span>
                    </div>
                    <div @click="pointer ='ten'" class="ten">
                        <span class="value">{{ten}}</span>
                        <span class="text">$ 10</span>
                    </div>
                    <div @click="pointer ='five'" class="five">
                        <span class="value">{{five}}</span>
                        <span class="text">$ 5</span>
                    </div>
                    <div @click="pointer ='one'" class="one">
                        <span class="value">{{one}}</span>
                        <span class="text">$ 1</span>
                    </div>
                </div>
                <div class="coin">
                    <div @click="pointer ='quarter'" class="quarter">
                        <span class="value">{{quarter}}</span>
                        <span class="text">$ 0.25</span>
                    </div>
                    <div @click="pointer ='dime'" class="dime">
                        <span class="value">{{dime}}</span>
                        <span class="text">$ 0.10</span>
                    </div>
                    <div @click="pointer ='nickel'" class="nickel">
                        <span class="value">{{nickel}}</span>
                        <span class="text">$ 0.05</span>
                    </div>
                    <div @click="pointer ='penny'" class="penny">
                        <span class="value">{{penny}}</span>
                        <span class="text">$ 0.01</span>
                    </div>
                </div>
                <div class="range">
                    <smart-range v-model="value" label="QTY" @input="change" :max="50"></smart-range>
                </div>
            </div>
            <footer>
                <div class="btn" @click="confirm">{{text('CONFIRM')}}</div>
            </footer>
        </div>
    </div>
</template>

<script>
import smartRange from '../setting/common/smartRange'
export default {
    props: ['init'],
    components: { smartRange },
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
            pointer: '',
            value: 0
        }
    },
    mounted() {
        this.pointer = 'hundred'
    },
    methods: {
        change() {
            this[this.pointer] = this.value;
        },
        confirm() {
            this.init.resolve(this.amount);
        }
    },
    watch: {
        pointer(n) {
            let dom = document.querySelector(".active");
            dom && dom.classList.remove("active");
            dom = document.querySelector(`.${n}`);
            dom && dom.classList.add("active");
            this.value = this[n];
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
    flex-direction: column;
    width: 500px;
}

.bill,
.coin {
    display: flex;
    padding: 10px;
}

.bill>div,
.coin>div {
    flex: 1;
    display: flex;
    flex-direction: column-reverse;
    justify-content: center;
    align-items: center;
    background: #fff;
    margin: 2px;
    height: 70px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
}

.bill .active,
.coin .active {
    background: #009688;
    color: #fff;
}

.range {
    margin: 15px 0;
}

.cash {
    font-size: 16px;
    color: #FAFAFA;
}
</style>