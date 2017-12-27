<template>
    <div class="popupMask center dark">
        <div class="editor">
            <header class="title">
                <h5 class="cash">$ {{amount.toFixed(2)}}</h5>
                <h3>{{$t('text.cashInCount')}}</h3>
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
                <num-pad v-model="number" @input="input" type="number"></num-pad>
            </section>
            <footer>
                <div class="opt">
                    <checkbox v-model="detail" title="text.recordDetail"></checkbox>
                </div>
                <button class="btn" @click="init.reject(false)">{{$t('button.cancel')}}</button>
                <button class="btn" @click="confirm">{{$t('button.confirm')}}</button>
            </footer>
        </div>
    </div>
</template>

<script>
import numPad from "./numpad"
import checkbox from "../setting/common/checkbox";
export default {
  props: ["init"],
  components: { numPad, checkbox },
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
      anchor: "",
      reset: true,
      detail: false,
      number: ""
    };
  },
  mounted() {
    this.anchor = "hundred";
  },
  methods: {
    input(num) {
      this[this.anchor] = num;
      this.reset = false;
    },
    change(anchor) {
      this.anchor = anchor;
      this.number = "";
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
      return (
        this.hundred * 100 +
        this.fifty * 50 +
        this.twenty * 20 +
        this.ten * 10 +
        this.five * 5 +
        this.one * 1 +
        this.quarter * 0.25 +
        this.dime * 0.1 +
        this.nickel * 0.05 +
        this.penny * 0.01
      );
    }
  }
};
</script>

<style scoped>
.inner {
  display: flex;
  flex-direction: row;
}

aside > div {
  display: flex;
  margin: 6px 5px;
  font-size: 22px;
  color: #9e9e9e;
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
  color: #9e9e9e;
  outline: none;
  border-radius: 2px;
}

aside span {
  flex: 1;
  font-family: "Agency FB";
  font-weight: bold;
}

.active input {
  color: #fff;
  background: #55caff;
  border: 1px solid #50b6e6;
}

.active span.text {
  color: #3c3c3c;
}
</style>