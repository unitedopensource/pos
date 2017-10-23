<template>
  <div class="popupMask center dark" @click.self="init.reject">
    <div class="window inputter">
      <header class="title">
        <span>{{$t('text.adjustTip')}}</span>
        <i class="fa fa-times" @click="init.reject"></i>
      </header>
      <div class="inner">
        <div class="display">
          <h5>{{$t('tip.tipFor')}}</h5>
          <span class="due">
            <span class="symbol">$</span>{{init.payment.subtotal | decimal}}
            <i class="tooltip fa fa-question-circle-o">
              <span class="content">{{tooltip}}</span>
            </i>
          </span>
          <div class="entry">
            <div v-if="unit === '%'" class="unit" @click="switchUnit('$')">%</div>
            <div v-else class="unit" @click="switchUnit('%')">$</div>
            <input type="text" v-model="tip">
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
            <div @click="input('0')">0</div>
            <div @click="input('00')" class="double">00</div>
          </section>
          <aside class="numpad">
            <div @click="del">&#8592;</div>
            <div @click="clear">C</div>
            <div @click="enter">&#8626;</div>
          </aside>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: ["init"],
  data() {
    return {
      unit: "%",
      tip: "0",
      reset: true
    };
  },
  created() {
    if (this.init.payment.tip) {
      this.tip = this.init.payment.tip.toFixed(2);
      this.unit = "$";
    }
  },
  methods: {
    clear() {
      this.tip = this.unit === "$" ? "0.00" : "0";
      this.reset = true;
    },
    switchUnit(unit) {
      this.unit = unit;
      this.clear();
    },
    input(val) {
      let value = this.tip;
      if (this.unit === "%") {
        this.tip = this.reset ? val : value + val;
      } else {
        if (this.reset) {
          this.tip = (val / 100).toFixed(2);
        } else {
          value = (value * 100).toFixed(0) + val;
          this.tip = (value / 100).toFixed(2);
        }
      }
      this.reset = false;
    },
    del() {
      let value = this.tip;
      if (this.unit === "%") {
        if (value.length > 1) {
          this.tip = value.slice(0, -1);
        } else {
          this.tip = "0";
          this.reset = true;
        }
      } else {
        this.tip = (value.slice(0, -1) / 10).toFixed(2);
      }
    },
    enter() {
      let tip = parseFloat(this.tip);

      if (this.unit === "%") {
        tip = toFixed(this.init.payment.subtotal * this.tip / 100, 2);
      }

      this.init.resolve({ tip });
    }
  },
  computed: {
    tooltip() {
      if (~~this.tip > 0) {
        if (this.unit === "%") {
          return this.$t(
            "text.calcTips",
            toFixed(this.init.payment.subtotal * this.tip / 100, 2).toFixed(2)
          );
        } else {
          return this.$t("text.calcTips", this.tip.toFixed(2));
        }
      } else {
        return this.$t("tip.howTipCalculate");
      }
    }
  }
};
</script>
