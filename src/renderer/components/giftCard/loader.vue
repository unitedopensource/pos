<template>
  <div class="popupMask center dark" @click.self="init.reject">
    <div class="window inputter">
      <header class="title">
        <span>{{$t('title.giftCardReload')}}</span>
        <i class="fa fa-times" @click="init.reject"></i>
      </header>
      <div class="inner">
        <div class="display">
          <h5>{{giftCard}}</h5>
          <span class="due">
            <span class="symbol">$</span>
            <span class="balance">{{balance}}</span>
          </span>
          <div class="entry">
            <div v-if="payment === 'CASH'" class="unit" @click="payment = 'CREDIT'">CASH</div>
            <div v-else class="unit" @click="payment = 'CASH'">CREDIT</div>
            <input type="text" v-model="reload">
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
    <div :is="component" :init="componentData"></div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import TWEEN from "@tweenjs/tween.js";
import dialoger from "../common/dialoger";
import creditCard from "../payment/creditCard";

export default {
  props: ["init"],
  components: { dialoger, creditCard },
  computed: {
    ...mapGetters(["op", "station"])
  },
  data() {
    return {
      componentData: null,
      component: null,
      giftCard: null,
      balance: "0.00",
      payment: "CASH",
      reload: "0.00",
      reset: true,
      value: 0
    };
  },
  created() {
    let number = this.init.number.replace(
      /^\D?(\d{4})\D?\D?(\d{4})\D?(\d{4})\D?(\d{4})/,
      "$1 $2 $3 $4"
    );
    this.giftCard = this.$t("tip.forGiftCard", number);
    this.balance = this.init.balance.toFixed(2);
  },
  methods: {
    clear() {
      this.reload = "0.00";
      this.reset = true;
    },
    input(val) {
      if (this.reset) {
        this.reload = (val / 100).toFixed(2);
      } else {
        let value = (this.reload * 100).toFixed(0) + val;
        this.reload = (value / 100).toFixed(2);
      }
      this.reset = false;
    },
    del() {
      this.reload = (this.reload.slice(0, -1) / 10).toFixed(2);
    },
    enter() {
      this.verifyEntry()
        .then(this.confirmReload)
        .then(this.charge)
        .catch(this.reloadFailed);
    },
    verifyEntry() {
      return new Promise((resolve, reject) => {
        let noCashDrawerError = {
          title: "dialog.cashDrawerUnavailable",
          msg: "dialog.cashDrawerUnavailableTip",
          timeout: { duration: 5000, fn: "resolve" },
          buttons: [{ text: "button.confirm", fn: "resolve" }]
        };
        let invalidEntry = {
          title: "dialog.entryInvalid",
          msg: "dialog.entryMustBeNumber",
          buttons: [{ text: "button.confirm", fn: "resolve" }]
        };

        if (this.payment === "CASH" && !this.station.cashDrawer.enable)
          throw noCashDrawerError;

        isNumber(this.reload) ? resolve() : reject(invalidEntry);
      });
    },
    confirmReload() {
      return new Promise((resolve, reject) => {
        this.$dialog({
          title: "dialog.giftCardReload",
          msg: ["dialog.confirmEntryValue", this.reload]
        })
          .then(() => {
            resolve();
          })
          .catch(() => {
            this.$q();
          });
      });
    },
    reloadFailed(error) {
      typeof error === "object"
        ? this.$dialog(error).then(() => {
            this.$q();
            this.clear();
          })
        : this.$q();
    },
    charge() {
      this.$q();
      this.payment === "CASH" ? this.chargeCash() : this.chargeCreditCard();
    },
    chargeCash() {
      let cashDrawer =
        this.op.cashCtrl === "staffBank"
          ? this.op.name
          : this.station.cashDrawer.name;
      let date = today();
      let time = +new Date();

      let activity = {
        type: "CASHFLOW",
        inflow: parseFloat(this.reload),
        outflow: 0,
        time,
        ticket: {},
        operator: this.op.name
      };

      let transaction = {
        _id: ObjectId(),
        date,
        time,
        order: null,
        ticket:null,
        paid: parseFloat(this.reload),
        change: 0,
        actual: parseFloat(this.reload),
        tip: 0,
        cashier: this.op.name,
        cashDrawer,
        station: this.station.alies,
        type: "CASH",
        for: "Reload",
        subType: null,
        credential: null,
        lfd: null
      };

      this.op.cashCtrl === "enable" && Printer.openCashDrawer();

      this.$socket.emit("[SAVE] TRANSACTION", transaction);
      this.$socket.emit("[CASHFLOW] ACTIVITY", { cashDrawer, activity });

      this.init.activation ? this.activation() : this.reloadBalance();
    },
    chargeCreditCard() {
      let card = {
        creditCard: { number: "", date: "" },
        amount: this.reload,
        tip: 0
      };

      new Promise((resolve, reject) => {
        this.componentData = { resolve, reject, card };
        this.component = "creditCard";
      })
        .then(data => {
          let date = today();
          let time = +new Date();
          let cashDrawer =
            this.op.cashCtrl === "staffBank"
              ? this.op.name
              : this.station.cashDrawer.name;

          Object.assign(data, {
            order: null,
            for: "Reload",
            date: today(),
            _id: ObjectId()
          });

          Printer.printCreditCard(data);

          let transaction = {
            _id: ObjectId(),
            date,
            time,
            order: null,
            paid: parseFloat(this.reload),
            change: 0,
            actual: parseFloat(data.amount.approve),
            tip: 0,
            cashier: this.op.name,
            cashDrawer,
            station: this.station.alies,
            type: "CREDIT",
            for: "Reload",
            subType: data.account.type,
            credential: data._id,
            lfd: data.account.number
          };

          this.$socket.emit("[TERM] TRANSACTION", data);
          this.$socket.emit("[SAVE] TRANSACTION", transaction);

          this.init.activation ? this.activation() : this.reloadBalance();
        })
        .catch(error => {
          this.$q();
        });
    },
    activation() {
      let activation = {
        number: this.init.number,
        date: today(),
        time: +new Date(),
        cashier: this.op.name,
        balance: parseFloat(this.reload),
        activation: +new Date(),
        transaction: 1
      };
      this.$socket.emit("[GIFTCARD] ACTIVATION", activation, card => {
        Printer.printGiftCard("Activation", card);
        this.$emit("reloaded", card);
      });
    },
    reloadBalance() {
      let reload = {
        date: today(),
        time: +new Date(),
        type: "Reload",
        cashier: this.op.name,
        number: this.init.number,
        change: parseFloat(this.reload),
        balance: parseFloat(this.init.balance) + parseFloat(this.reload)
      };
      this.$socket.emit("[GIFTCARD] RELOAD", reload, card => {
        Printer.printGiftCard("Reload", card);
        this.$emit("reloaded", card);
      });
    }
  },
  watch: {
    reload: function(now, was) {
      let oldValue = parseFloat(was) + this.init.balance;
      let newValue = parseFloat(now) + this.init.balance;

      function animate() {
        TWEEN.update() && requestAnimationFrame(animate);
      }

      new TWEEN.Tween({ tweeningNumber: oldValue })
        .easing(TWEEN.Easing.Quadratic.Out)
        .to({ tweeningNumber: newValue }, 500)
        .onUpdate(e => {
          this.balance = e.tweeningNumber.toFixed(2);
        })
        .start();

      animate();
    }
  }
};
</script>

<style scoped>
.balance {
  width: 100px;
  display: inline-block;
  text-align: left;
}
</style>