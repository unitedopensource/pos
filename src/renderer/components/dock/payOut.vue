<template>
    <div class="popupMask center dark" @click.self="init.reject">
      <div class="payout">
        <header>
          <h5>{{$t('title.payout')}}</h5>
          <h2>{{$t('title.payoutRecord')}}</h2>
        </header>
        <div class="wrap">
          <div class="textWrap">
            <textarea v-model="note"></textarea>
            <span class="placeholder" v-show="!note">{{$t('tip.payout')}}</span>
          </div>
          <div class="detail">
            <div></div>
          </div>
        </div>
        <footer>
          <div class="f1">
            <p>
              <span class="text">{{$t('text.cashier')}}:</span>
              <span class="value">{{op.name}}</span>
            </p>
            <p>
              <span class="text">{{$t('text.cashdrawer')}}:</span>
              <span class="value">{{station.cashDrawer.name}}</span>
            </p>
          </div>
          <button class="btn" @click="confirm" :disabled="amount === '0.00'">{{$t('button.confirm')}}</button>
        </footer>
      </div>
    </div>
</template> 

<script>
import { mapGetters } from "vuex";
import dialoger from "../common/dialoger";
export default {
  props: ["init"],
  components: { dialoger },
  data() {
    return {
      receiver: "",
      amount: "0.00",
      note: ""
    };
  },
  methods: {
    confirm() {
      let cashDrawer = this.station.cashDrawer.name;
      let transaction = {
        _id: ObjectId(),
        date: today(),
        time: +new Date(),
        order: null,
        ticket: {
          number: null,
          type: null
        },
        paid: parseFloat(this.amount),
        change: 0,
        actual: parseFloat(this.amount),
        tip: 0,
        cashier: this.op.name,
        server: null,
        cashDrawer,
        station: this.station.alies,
        receiver: this.receiver,
        type: "CASH",
        for: "Payout",
        subType: null,
        credential: null,
        lfd: null,
        note: this.note
      };

      let activity = {
        type: "CASHFLOW",
        inflow: 0,
        outflow: parseFloat(this.amount),
        time: +new Date(),
        ticket: {
          number: null,
          type: null
        },
        operator: this.op.name
      };

      this.$socket.emit("[SAVE] TRANSACTION", transaction);
      this.$socket.emit("[CASHFLOW] ACTIVITY", { cashDrawer, activity });
    }
  },
  computed: {
    ...mapGetters(["op", "station"])
  }
};
</script>

<style scoped>
.payout {
  width: 650px;
  background: #fafafa;
}

header {
  background: #fff;
  padding: 10px 25px;
  border-bottom: 1px solid #eee;
}

header h5 {
  margin: 3px;
  font-weight: normal;
}

.textWrap {
  width: 100%;
  position: relative;
}

textarea {
  border: none;
  resize: none;
  outline: none;
  width: calc(100% - 50px);
  height: 45px;
  padding: 25px;
  font-family: "Yuanti-SC";
  font-size: 18px;
  border-bottom: 1px dashed #ddd;
}

.placeholder {
  position: absolute;
  top: 25px;
  left: 25px;
  font-style: italic;
  color: lightgray;
}

footer {
  display: flex;
  padding: 0 0 0 25px;
  align-items: center;
}

.f1 {
  display: flex;
}

p {
  margin-right: 25px;
}

p .text {
  font-weight: bold;
}
</style>