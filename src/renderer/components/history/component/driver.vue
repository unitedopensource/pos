<template>
    <div class="popupMask center dark" @click.self="init.reject">
        <div class="driver window">
            <header class="title">
                <span>{{$t('title.setDriver')}}</span>
                <i class="fa fa-times" @click="init.reject"></i>
            </header>
            <div class="inner">
                <ul class="orders">
                    <li v-for="(order,index) in orders" :key="index" :data-ticket="order.number" @click="setTarget(order,$event)">
                        <span class="number">{{order.number}}</span>
                        <div class="info">
                            <span class="phone">{{order.customer.phone | phone}}</span>
                            <span class="address">{{order.customer.address}}</span>
                        </div>
                        <span class="price">{{order.payment.total}}</span>
                        <span class="driver">{{order.driver}}</span>
                    </li>
                </ul>
                <ul class="letters">
                    <li v-for="(letter,index) in letters" :key="letter" @click="setDriver(letter,$event)" :class="letter" :data-letter="letter">{{letter}}</li>
                    <li class="clear">{{$t('button.clear')}}</li>
                </ul>
            </div>
            <footer>
                <div class="f1">
                    <checkbox v-model="loop" label="text.autoNextTicket"></checkbox>
                </div>
                <div class="btn">{{$t('button.next')}}</div>
            </footer>
        </div>
    </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import checkbox from "../../setting/common/checkbox";
import tips from "../../payment/tips";
export default {
  props: ["init"],
  components: { tips, checkbox },
  computed: {
    ...mapGetters(["op", "history"])
  },
  data() {
    return {
      letters: [
        "A",
        "B",
        "C",
        "D",
        "E",
        "F",
        "G",
        "H",
        "I",
        "J",
        "K",
        "L",
        "M",
        "N",
        "O",
        "P",
        "Q",
        "R",
        "S",
        "T",
        "U",
        "V",
        "W",
        "X",
        "Y",
        "Z"
      ],
      target: null,
      letter: null,
      orders: null,
      order: null,
      loop: true,
      componentData: null,
      component: null
    };
  },
  created() {
    this.initialData();
  },
  methods: {
    initialData() {
      let viewable = this.approval(this.op.view, "invoices");
      this.orders = this.history.filter(invoice => invoice.type === "DELIVERY");

      !viewable &&
        (this.orders = orders.filter(
          invoice => invoice.cashier === this.op.name
        ));
    },
    setTarget(order, e) {
      let { number, driver } = order;

      let dom = document.querySelector("ul.orders .active");
      dom && dom.classList.remove("active");

      e.currentTarget.classList.add("active");
      this.order = order;
    },
    setDriver(letter) {
      if (!this.order) return;

      Object.assign(this.order, { driver: letter });

      this.loop && this.next();
    },
    next() {}
  },
  watch: {
    order(n) {
      let dom = document.querySelector("ul.letters .active");
      dom && dom.classList.remove("active");

      if (n.driver) {
        document
          .querySelector(`[data-letter="${n.driver.toUpperCase()}"]`)
          .classList.add("active");
      }
    }
  }
};
</script>

<style scoped>
.inner {
  display: flex;
  width: 619px;
}

ul.letters {
  display: flex;
  flex-wrap: wrap;
  flex: 1;
}

.letters li {
  width: 70px;
  height: 60px;
  border: 1px solid #cfd8dc;
  background: #fff;
  margin: 1px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
}

ul.orders {
  width: 320px;
  margin-right: 2px;
}

span.address {
  color: #009688;
}
.orders li {
  display: flex;
  padding: 5px;
  align-items: center;
  color: #3c3c3c;
  border-bottom: 1px solid #eeeeee;
  height: 50px;
  background: #fff;
}

.orders .number {
  width: 35px;
  text-align: center;
  font-family: "Agency FB";
  font-weight: bold;
  font-size: 20px;
  margin-right: 5px;
}
.orders .info {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.orders .price {
  min-width: 50px;
  text-align: center;
}

.f1 {
  display: flex;
  align-items: center;
}

li.clear {
  width: 144px;
  background: #ff5722;
  color: #fff;
}

.orders .active {
  background: #009688;
  color: #fff;
  text-shadow: 0 1px 1px #333;
}

.orders .active .address {
  color: #fff;
}
</style>