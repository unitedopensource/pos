<template>
  <div class="popupMask center dark" @click.self="init.reject">
    <div class="window">
      <header class="title">
        <span>{{$t('text.discount')}}</span>
        <i class="fa fa-times" @click="init.reject"></i>
      </header>
      <div class="inner">
        <div class="display">
          <div class="total">
            <span class="due">{{(init.payment.subtotal) | decimal}}</span>
            <span class="formula">{{formula}}</span>
          </div>
          <div class="wrap">
            <div class="data active">
              <span class="text">{{$t('button.setDiscount')}}</span>
              <span class="value">{{discount}}</span>
            </div>
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
            <div @click="switchUnit" v-if="this.currentUnit === '%'">%</div>
            <div @click="switchUnit" v-else>$</div>
            <div @click="enter">&#8626;</div>
          </aside>
        </div>
      </div>
    </div>
    <div class="couponWrap">
      <div class="coupons">
        <div class="coupon" v-for="(coupon,index) in coupons" :key="index">
          <input type="radio" v-model="redeem" name="coupon" :value="coupon" :id="'coupon'+index" @change="applyCoupon">
          <label class="value" :for="'coupon'+index">
            <span class="discount">{{coupon.discount}}</span>
            <div class="change">
              <span class="before">{{init.payment.total | decimal}}</span>
              <i class="fa fa-long-arrow-right"></i>
              <span class="after">{{init.payment.total | discount(coupon.discount)}}</span>
            </div>
          </label>
          <span class="name">{{coupon.for}}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: ['init'],

  data() {
    return {
      coupons: [],
      redeem: null,
      currentUnit: "%",
      formula: null,
      discount: null,
    }
  },
  created() {
    this.$socket.emit("[COUPON] LIST", (coupons) => { this.coupons = coupons })
  },
  mounted() {
    this.currentUnit = this.discount = this.init.payment.discount > 0 ? '$ ' + this.init.payment.discount : '0 %';
  },
  filters: {
    discount(value, coupon) {
      if (coupon.includes('%')) {
        let discount = 1 - coupon.replace(/\D+/, "") / 100;
        return toFixed(value * discount, 2);
      } else {
        let discount = ~~coupon.replace(/\D+/, "");
        return value - discount;
      }
    }
  },
  methods: {
    switchUnit() {
      if (this.currentUnit === "$") {
        this.discount = "0 %";
        this.currentUnit = "%";
      } else {
        this.discount = "$ 0.00";
        this.currentUnit = "$";
      }
      this.formula = null;
      this.redeem = null;
    },
    getFormula(value) {
      let total = this.init.payment.subtotal.toFixed(2);
      if (value.includes('%')) {
        let result = toFixed(total * (parseFloat(value.replace(/D+/, "")) / 100), 2);
        this.formula = `${total} * ${value} = ${result}`;
      }
    },
    input(num) {
      let value = this.discount;
      if (value.includes('%')) {
        value = ~~(value.replace(/\D+/, "") + num) + " %";
        this.getFormula(value);
        this.discount = value;
      } else {
        value = Math.round(parseFloat(value.replace(/\D+/, "")) * 100);
        value = (value ? value + num : num) / 100;
        this.discount = "$ " + value.toFixed(2);
      }
    },
    del() {
      this.redeem = null;
      let value = this.discount;
      if (value.includes('%')) {
        value = ~~String(value.replace(/\D+/, "")).slice(0, -1) + " %";
        this.getFormula(value);
        this.discount = value;
      } else {
        value = value.replace(/\D+/, "").slice(0, -1) / 10;
        this.discount = "$ " + value.toFixed(2);
      }
    },
    enter() {
      let discount = this.discount.includes("%") ?
        (this.discount.replace(/\D+/, "") / 100 * this.init.payment.subtotal).toFixed(2) :
        parseFloat(this.discount.replace(/\D+/, ""));
      this.init.resolve({ discount, coupon: this.redeem });
    },
    applyCoupon() {
      this.discount = this.redeem.discount;
      this.input('');
    }
  }
}
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

span.due {
  font-size: 2em;
  font-weight: bold;
  color: #444;
}

.total {
  padding: 10px;
  display: flex;
  flex-direction: column;
}

span.formula {
  color: #607D8B;
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
}

.data.active {
  color: #fff;
  background: #5C6BC0;
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

.couponWrap {
  margin-left: 20px;
}

.coupon {
  width: 250px;
  height: 100px;
  background: #009688;
  border-radius: 6px;
  position: relative;
  overflow: hidden;
  margin-bottom: 5px;
  box-shadow: 0 4px 4px -2px rgba(0, 0, 0, 0.5);
}

.coupon:before {
  position: absolute;
  bottom: 20px;
  left: -11px;
  background: rgb(55, 57, 59);
  content: ' ';
  width: 20px;
  height: 20px;
  border-radius: 50%;
  z-index: 1;
}

.coupon:after {
  position: absolute;
  bottom: 20px;
  right: -11px;
  background: rgb(55, 57, 59);
  content: ' ';
  width: 20px;
  height: 20px;
  border-radius: 50%;
  z-index: 1;
}

.name {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 30px;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
  border-top: 1px dashed #09a596;
  color: aliceblue;
  text-shadow: 0 1px 1px #333;
}

.coupon .value {
  height: 68px;
  border-bottom: 1px dashed #076f65;
  position: relative;
  display: block;
}

.discount {
  position: absolute;
  right: 5px;
  top: 2px;
  font-size: 25px;
  color: aliceblue;
  text-shadow: 0 1px 1px #333;
  font-family: 'Agency FB';
}

.change {
  display: flex;
  padding-top: 28px;
  width: 100%;
  justify-content: center;
  align-items: center;
  font-size: 28px;
  font-family: 'Agency FB';
  font-weight: bold;
  color: aliceblue;
}

.change span {
  margin: 0 5px;
}

.change i {
  color: #74bfb8;
  text-shadow: 0 1px 1px #0a6f66;
}

input:checked+label:after {
  content: '\f0c4';
  position: absolute;
  left: 18px;
  bottom: -13px;
  font-size: 28px;
  font-family: fontAwesome;
  color: #E0F2F1;
  text-shadow: 0 1px 1px #333;
  z-index: 2;
  animation: cut 0.3s linear;
}

@keyframes cut {
  from {
    opacity: 0;
    transform: translateX(-10px)
  }
  to {
    opacity: 1;
    transform: translateX(0)
  }
}
</style>
