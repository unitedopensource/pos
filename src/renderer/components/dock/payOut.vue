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
            <div>
              <label>{{$t('text.receiver')}}</label>
              <input type="text" v-model="receiver">
            </div>
            <div>
              <label>{{$t('text.amount')}}</label>
              <input type="text" v-model="amount" placeholder="0.00">
            </div>
          </div>
          <div class="signature">
            <span class="text">Signature</span>
            <i class="fa fa-times" v-show="reset" @click="clearSignature"></i>
            <canvas width="650" height="150" ref="pad"></canvas>
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
          <button class="btn" @click="confirm">{{$t('button.confirm')}}</button>
        </footer>
      </div>
    </div>
</template> 

<script>
import { mapGetters } from "vuex";
import dialoger from "../common/dialoger";
import * as SignaturePad from "signature_pad";
export default {
  props: ["init"],
  components: { dialoger },
  data() {
    return {
      receiver: "",
      amount: "0.00",
      signaturePad: null,
      reset: false,
      note: ""
    };
  },
  mounted() {
    this.signaturePad = new SignaturePad(this.$refs.pad, {
      backgroundColor: "rgb(255,255,255)"
    });

    this.signaturePad.onBegin = () => {
      this.reset = true;
    };
  },
  methods: {
    confirm() {
      this.validation()
        .then(this.checkSignature)
        .then(this.record)
        .catch(this.payoutFailed);
    },
    validation() {
      return new Promise((resolve, reject) => {
        isNumber(this.amount) ? resolve() : reject("amount");
      });
    },
    checkSignature() {
      return new Promise((resolve, reject) => {
        this.signaturePad.isEmpty() ? reject("signature") : resolve();
      });
    },
    clearSignature() {
      this.signaturePad.clear();
      this.reset = false;
    },
    payoutFailed(error) {
      switch (error) {
        case "amount":
          this.$dialog({
            type: "question",
            title: "dialog.payoutConfirm",
            msg: ["dialog.payoutCashConfirm", this.amount.toFixed(2)]
          })
            .then(() => {
              this.record();
              this.$q();
            })
            .catch(() => {
              this.$q();
            });
          break;
        case "signature":
          this.$dialog({
            type: "alert",
            title: "dialog.signatureRequired",
            msg: "dialog.payoutSignatureRequired",
            buttons: [{ text: "confirm", fn: "resolve" }]
          }).then(() => {
            this.$q();
          });
          break;
      }
    },
    record() {
      console.log(this.signaturePad.toDataURL());
    },
    saveToDatabase() {
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
      this.init.resolve();
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
  height: 95px;
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
  border: 1px solid #e0e0e0;
  background: #eeeeee;
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

p .value {
  color: #9e9e9e;
}

.detail {
  display: flex;
  justify-content: center;
  background: #607d8b;
  padding: 5px;
  border-top: 1px dashed #ddd;
  border-bottom: 1px dashed #ddd;
  box-shadow: inset 1px 0px 13px rgba(0, 0, 0, 0.5);
}

.detail > div {
  display: flex;
  flex-direction: column;
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.5);
  margin: 0 5px;
  background: #fff;
  border-radius: 4px;
  flex: 1;
}

.detail input {
  border: none;
  background: transparent;
  outline: none;
  font-size: 24px;
  text-indent: 35px;
}

label {
  text-indent: 15px;
  padding: 5px 0;
}

.signature {
  position: relative;
  height: 150px;
}

.signature .text {
  position: absolute;
  left: 20px;
  top: 15px;
  font-style: italic;
  color: #bdbdbd;
  pointer-events: none;
}

.signature i {
  position: absolute;
  padding: 10px 15px;
  right: 0;
}
</style>