<template>
  <div class="popupMask center dark" @click.self="init.reject">
    <div class="window">
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
    },
    switchUnit(unit) {
      this.unit = unit;
      this.reset = true;
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
      let tip;
      if (this.unit === "%") {
        tip = toFixed(this.init.payment.subtotal * this.tip / 100, 2);
      } else {
        tip = this.tip;
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

<style scoped>
.inner {
  padding: 0 2px 0 4px;
}

.display {
  height: 160px;
  text-align: center;
}

.wrap {
  display: flex;
  width: 453px;
}

section.numpad {
  flex: 3;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
}

h5 {
  padding: 20px 0 0;
  font-size: 16px;
  color: #545050;
}

.symbol {
  color: #009688;
  font-size: 28px;
  margin-right: 3px;
}

.due {
  font-size: 38px;
  font-weight: bold;
  color: #444;
  font-family: "Agency FB";
  position: relative;
}

i.tooltip {
  color: #ff5722;
  font-size: 18px;
  position: absolute;
  right: -35px;
  top: 15px;
  cursor: help;
}

i.tooltip:hover .content {
  opacity: 1;
}

span.content {
  position: absolute;
  opacity: 0;
  font-family: "Yuanti-SC";
  background: #fff8e1;
  color: #ff9800;
  box-shadow: 1px 1px 3px #cfd8dc;
  border-radius: 3px;
  font-size: 14px;
  padding: 10px;
  min-width: 170px;
  left: 50%;
  top: 25px;
  transform: translate(-50%, 0);
  transition: opacity 250ms ease-out;
}

.entry {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10px 10px 10px 5px;
  height: 45px;
  background: #fff;
  margin: 4px 3px 0 0;
  border-radius: 4px;
  box-shadow: 0 1px 1px #b5aaaa;
}

.entry input {
  border: none;
  outline: none;
  background: none;
  flex: 1;
  font-size: 46px;
  font-family: "Agency FB";
  font-weight: bold;
  color: #3c3c3c;
  text-align: right;
}

.entry .unit {
  padding: 8px 0;
  width: 55px;
  background: #607d8b;
  color: #fff;
  border-radius: 4px;
  font-size: 34px;
  font-family: "Agency FB";
  text-shadow: 0 1px 1px #333;
  box-shadow: 0px 2px 1px #123344;
  cursor: pointer;
}

.total {
  padding: 10px;
  display: flex;
  flex-direction: column;
}

span.formula {
  color: #607d8b;
  height: 25px;
}

.data {
  flex: 1;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.5);
  margin: 2px;
  display: flex;
  flex-direction: column;
  padding: 8px 12px;
  border-radius: 2px;
  background: #fff;
}

.data.active {
  color: #fff;
  background: #5c6bc0;
  text-shadow: 0 2px 3px rgba(0, 0, 0, 0.5);
  font-weight: bold;
}

.data .text {
  text-align: left;
  margin-bottom: 20px;
}

.data .value {
  text-align: right;
}
</style>
