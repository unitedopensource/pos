<template>
  <div class="popupMask center dark" @click.self="init.reject">
    <div class="window inputter">
      <header class="title">
        <span>{{$t('text.discount')}}</span>
        <i class="fa fa-times" @click="init.reject"></i>
      </header>
      <div class="inner">
        <div class="display">
          <h5>{{$t('tip.discountFor')}}</h5>
          <span class="due">
            <span class="symbol">$</span>{{init.payment.subtotal | decimal}}
            <i class="tooltip fa fa-question-circle-o">
              <span class="content">{{tooltip}}</span>
            </i>
          </span>
          <div class="entry">
            <div v-if="unit === '%'" class="unit" @click="switchUnit('$')">%</div>
            <div v-else class="unit" @click="switchUnit('%')">$</div>
            <input type="text" v-model="discount">
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
    <div class="couponWrap">
      <div class="coupons">
        <div class="coupon" v-for="(coupon,index) in coupons" :key="index">
          <input type="radio" v-model="redeem" name="coupon" :value="coupon" :id="'coupon'+index" @change="applyCoupon">
          <label class="value" :for="'coupon'+index">
            <span class="discount">{{coupon.discount}}</span>
            <div class="change">
              <span class="before">{{init.payment.total | decimal}}</span>
              <i class="fa fa-long-arrow-right"></i>
              <span class="after">{{init.payment.subtotal | discount(coupon.discount)}}</span>
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
  props: ["init"],
  computed: {
    tooltip() {
      if (~~this.discount > 0) {
        if (this.unit === "%") {
          return this.$t(
            "text.calcDiscount",
            toFixed(
              this.init.payment.subtotal * this.discount / 100,
              2
            ).toFixed(2)
          );
        } else {
          return this.$t("text.calcDiscount", this.discount.toFixed(2));
        }
      } else {
        return this.$t("tip.howDiscountCalculate");
      }
    }
  },
  filters: {
    discount(value, coupon) {
      if (coupon.includes("%")) {
        let discount = 1 - coupon.replace(/\D+/, "") / 100;
        return toFixed(value * discount, 2).toFixed(2);
      } else {
        let discount = ~~coupon.replace(/\D+/, "");
        return value - discount;
      }
    }
  },
  data() {
    return {
      coupons: [],
      redeem: null,
      discount: "0",
      reset: true,
      unit: "%"
    };
  },
  created() {
    this.$socket.emit("[COUPON] LIST", coupons => {
      this.coupons = coupons;
    });
  },
  methods: {
    switchUnit(unit) {
      this.unit = unit;
      this.redeem = null;
      this.clear();
    },
    clear() {
      this.discount = this.unit === "$" ? "0.00" : "0";
      this.reset = true;
    },
    input(val) {
      let value = this.discount;
      if (this.unit === "%") {
        this.discount = this.reset ? val : value + val;
      } else {
        if (thi.reset) {
          this.discount = (value / 100).toFixed(2);
        } else {
          value = (value * 100).toFixed(0) + val;
          this.discount = (value / 100).toFixed(2);
        }
      }
      this.reset = false;
    },
    del() {
      this.redeem = null;
      let value = this.discount;

      if (this.unit === "%") {
        if (value.length > 1) {
          this.discount = value.slice(0, -1);
        } else {
          this.discount = "0";
          this.reset = true;
        }
      } else {
        this.discount = (value.slice(0, -1) / 10).toFixed(2);
      }
    },
    enter() {
      let discount = parseFloat(this.discount);

      if (this.unit === "%") {
        discount = toFixed(this.init.payment.subtotal * this.discount / 100, 2);
      }

      this.init.resolve({ discount, coupon: this.redeem });
    },
    applyCoupon() {
      this.discount = this.redeem.discount.replace(/\D/g, "");
      this.unit = this.redeem.discount.indexOf("%") !== -1 ? "%" : "$";
    }
  }
};
</script>

<style scoped>
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
  content: " ";
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
  content: " ";
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
  font-family: "Agency FB";
}

.change {
  display: flex;
  padding-top: 28px;
  width: 100%;
  justify-content: center;
  align-items: center;
  font-size: 28px;
  font-family: "Agency FB";
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

input:checked + label:after {
  content: "\f0c4";
  position: absolute;
  left: 18px;
  bottom: -13px;
  font-size: 28px;
  font-family: fontAwesome;
  color: #e0f2f1;
  text-shadow: 0 1px 1px #333;
  z-index: 2;
  animation: cut 0.3s linear;
}

@keyframes cut {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
</style>
