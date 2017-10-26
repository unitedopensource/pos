<template>
    <div class="popupMask center dark">
        <transition-group name="payment" mode="out-in" appear>
            <div class="window" v-show="!component" :key="0">
                <header class="title">
                    <span>{{$t('title.payment')}}</span>
                    <div v-if="!payInFull && order.hasOwnProperty('splitPayment')" class="viewer">
                        <label v-for="(split,index) in order.splitPayment" :key="index">
                            <input type="radio" name="split" :id="'split_'+index" :value="index" v-model="current" @change="switchInvoice(index)">
                            <label :for="'split_'+index" class="tag">{{index + 1}}</label>
                            <div class="preview" @click="preview(index)">
                                <i class="fa fa-wpforms"></i>
                                <span>{{$t('text.preview')}}</span>
                            </div>
                        </label>
                    </div>
                    <i class="fa fa-times" @click="init.reject(false)"></i>
                </header>
                <nav>
                    <div class="paymentTypes">
                        <div class="type">
                            <input type="radio" v-model="paymentType" name="paymentType" value="CASH" id="CASH" @change="setPaymentType('CASH')">
                            <label for="CASH">{{$t('type.CASH')}}</label>
                        </div>
                        <div class="type" v-if="!thirdPartyPayment">
                            <input type="radio" v-model="paymentType" name="paymentType" value="CREDIT" id="CREDIT" @change="setPaymentType('CREDIT')">
                            <label for="CREDIT">{{$t('type.CREDIT')}}</label>
                        </div>
                        <div class="type" v-else>
                            <input type="radio" v-model="paymentType" name="paymentType" value="THIRD" id="THIRD" @change="setPaymentType('THIRD')">
                            <label for="THIRD">{{$t('type.THIRD')}}</label>
                        </div>
                        <div class="type">
                            <input type="radio" v-model="paymentType" name="paymentType" value="GIFT" id="GIFT" @change="setPaymentType('GIFT')">
                            <label for="GIFT">{{$t('type.GIFT')}}</label>
                        </div>
                    </div>
                    <div class="balanceDue" @dblclick="roundUp">
                        <span class="for">{{$t('text.balanceDue')}}:</span>
                        <div class="inner">
                            <span class="due">
                                <span class="symbol">$</span>{{payment.remain | decimal}}</span>
                            <div class="addition" v-show="payment.discount > 0">
                                <span class="text">{{$t('text.discount')}}</span>
                                <span class="value">-{{payment.discount | decimal}}</span>
                            </div>
                            <div class="addition" v-show="payment.tip > 0">
                                <span class="text">{{$t('text.tip')}}</span>
                                <span class="value">+{{payment.tip | decimal}}</span>
                            </div>
                            <div class="addition" v-show="payment.gratuity > 0">
                                <span class="text">{{$t('text.gratuity')}}</span>
                                <span class="value">+{{payment.gratuity | decimal}}</span>
                            </div>
                        </div>
                    </div>
                    <div class="fn">
                        <button class="btn" @click="setTip">{{$t('button.setTip')}}</button>
                        <button class="btn" @click="setDiscount" :disabled="!discountable">{{$t('button.setDiscount')}}</button>
                        <button class="btn" @click="save">{{$t('button.save')}}</button>
                    </div>
                </nav>
                <article>
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
                    <section class="field">
                        <template v-if="paymentType === 'CASH'">
                            <div class="inputs">
                                <div class="input" @click="setAnchor($event)" data-anchor="paid" data-format="money">
                                    <span class="text">{{$t('text.paid')}}</span>
                                    <span class="value">{{paid}}</span>
                                </div>
                                <div class="input" @click="setAnchor($event)" data-anchor="tip" data-format="money">
                                    <span class="text">{{$t('text.tip')}}</span>
                                    <span class="value">{{tip}}</span>
                                </div>
                                <div class="input">
                                    <span class="text">{{$t('text.changeDue')}}</span>
                                    <span class="value">{{cashTender | decimal}}</span>
                                </div>
                                <div class="input" @click="setAnchor($event)" data-anchor="evenly" data-format="number">
                                    <span class="text">{{$t('text.separate')}}
                                        <span class="people">$ {{(payment.due / evenly) | decimal}}</span>
                                    </span>
                                    <span class="value">{{evenly}}</span>
                                </div>
                            </div>
                            <aside class="numpad">
                                <div @click="del">&#8592;</div>
                                <div @click="clear">C</div>
                                <div @click="charge">&#8626;</div>
                            </aside>
                        </template>
                        <template v-else-if="paymentType === 'CREDIT'">
                            <div class="inputs">
                                <div class="input" @click="setAnchor($event)" data-anchor="paid" data-format="money">
                                    <span class="text">{{$t('text.paid')}}</span>
                                    <span class="value">{{paid}}</span>
                                </div>
                                <div class="input" @click="setAnchor($event)" data-anchor="tip" data-format="money">
                                    <span class="text">{{$t('text.tip')}}</span>
                                    <span class="value">{{tip}}</span>
                                </div>
                                <div class="input" @click="setAnchor($event)" data-anchor="creditCard" data-format="number">
                                    <span class="text">{{$t('card.number')}}</span>
                                    <input v-model="creditCard" v-mask="'#### #### #### ####'">
                                </div>
                                <div class="input" @click="setAnchor($event)" data-anchor="expiration" data-format="number">
                                    <span class="text">{{$t('card.expirationDate')}}</span>
                                    <input v-model="expiration" v-mask="'## / ##'">
                                </div>
                            </div>
                            <aside class="numpad">
                                <div @click="del">&#8592;</div>
                                <div @click="clear">C</div>
                                <div @click="charge">&#8626;</div>
                            </aside>
                        </template>
                        <template v-else-if="paymentType === 'THIRD'">
                            <div class="inputs">
                                <div class="input" @click="setAnchor($event)" data-anchor="paid" data-format="money">
                                    <span class="text">{{$t('text.paid')}}</span>
                                    <span class="value">{{paid}}</span>
                                </div>
                                <div class="input" @click="setAnchor($event)" data-anchor="tip" data-format="money">
                                    <span class="text">{{$t('text.tip')}}</span>
                                    <span class="value">{{tip}}</span>
                                </div>
                                <div class="options">
                                    <div class="type">
                                        <input type="radio" v-model="thirdPartyType" value="Visa" id="Visa">
                                        <label for="Visa">Visa</label>
                                    </div>
                                    <div class="type">
                                        <input type="radio" v-model="thirdPartyType" value="Master" id="Master">
                                        <label for="Master">Master</label>
                                    </div>
                                    <div class="type">
                                        <input type="radio" v-model="thirdPartyType" value="Discover" id="Discover">
                                        <label for="Discover">Discover</label>
                                    </div>
                                    <div class="type">
                                        <input type="radio" v-model="thirdPartyType" value="AE" id="AE">
                                        <label for="AE">AE</label>
                                    </div>
                                    <div class="type">
                                        <input type="radio" v-model="thirdPartyType" value="GrubHub" id="GrubHub">
                                        <label for="GrubHub">GrubHub</label>
                                    </div>
                                    <div class="type">
                                        <input type="radio" v-model="thirdPartyType" value="Eat 24" id="Eat">
                                        <label for="Eat">Eat 24</label>
                                    </div>
                                </div>
                            </div>
                            <aside class="numpad">
                                <div @click="del">&#8592;</div>
                                <div @click="clear">C</div>
                                <div @click="charge">&#8626;</div>
                            </aside>
                        </template>
                        <template v-else>
                            <div class="inputs">
                                <div class="input" @click="setAnchor($event)" data-anchor="paid" data-format="money">
                                    <span class="text">{{$t('text.paid')}}</span>
                                    <span class="value">{{paid}}</span>
                                </div>
                                <div class="input" @click="setAnchor($event)" data-anchor="tip" data-format="money">
                                    <span class="text">{{$t('text.tip')}}</span>
                                    <span class="value">{{tip}}</span>
                                </div>
                                <div class="input" @click="setAnchor($event)" data-anchor="giftCard" data-format="number" v-if="typeof giftCard === 'string'">
                                    <span class="text">{{$t('card.number')}}</span>
                                    <input v-model="giftCard" type="text" v-mask="'#### #### #### ####'">
                                </div>
                                <div class="input" v-else>
                                  <span class="text">{{$t('card.number')}}</span>
                                    <input v-model="giftCard.number" v-mask="'#### #### #### ####'">
                                </div>
                                <div class="input" v-if="typeof giftCard === 'string'">
                                    <span class="text">{{$t('text.balance')}}</span>
                                    <span class="value">0.00</span>
                                </div>
                                <div class="input" v-else>
                                    <span class="text">{{$t('text.balance')}}</span>
                                    <span class="value">$ {{giftCard.balance | decimal}}</span>
                                </div>
                            </div>
                            <aside class="numpad">
                                <div @click="del">&#8592;</div>
                                <div @click="clear">C</div>
                                <div @click="queryGiftCard" v-if="anchor === 'giftCard' && typeof giftCard === 'string'" :class="{disabled:giftCard.length !== 19}"><i class="fa fa-search"></i></div>
                                <div @click="charge" v-else>&#8626;</div>
                            </aside>
                        </template>
                    </section>
                    <section class="quickInput">
                        <div class="numKey" v-for="(num,i) in quickInput" @click="setQuickInput(num)" :key="i">{{num}}</div>
                    </section>
                </article>
            </div>
            <div :is="component" :init="componentData" :key="1"></div>
        </transition-group>
    </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import dialoger from "../common/dialoger";
import capture from "../giftCard/capture";
import ticket from "../common/ticket";
import creditCard from "./creditCard";
import discount from "./discount";
import thirdParty from "./mark";
import tips from "./tips";
export default {
  props: ["init"],
  components: {
    tips,
    ticket,
    capture,
    dialoger,
    discount,
    creditCard,
    thirdParty
  },
  computed: {
    isNewTicket() {
      return this.app.mode === "create" && this.$route.name === "Menu";
    },
    cashTender() {
      let change = toFixed(this.paid - this.payment.remain, 2);
      return Math.max(0, change);
    },
    ...mapGetters([
      "op",
      "app",
      "store",
      "ticket",
      "device",
      "customer",
      "station"
    ])
  },
  data() {
    return {
      releaseComponentLock: true,
      componentData: null,
      component: null,
      discountable: false,
      order: null,
      thirdPartyPayment: true,
      thirdPartyType: null,
      paymentType: "CASH",
      payInFull: true,
      quickInput: [],
      creditCard: "",
      expiration: "",
      giftCard: "",
      anchor: "paid",
      evenly: 1,
      current: 0,
      reset: true,
      paid: "0.00",
      tip: "0.00"
    };
  },
  created() {
    this.initial()
      .then(this.checkComponentUsage)
      .then(this.checkPermission)
      .then(this.checkSplit)
      .catch(err => {
        this.initialFailed(err);
      });
  },
  mounted() {
    this.setPaymentType("CASH");
  },
  beforeDestroy() {
    this.releaseComponentLock &&
      this.$socket.emit("[COMPONENT] UNLOCK", {
        component: "payment",
        lock: this.order._id
      });
  },
  methods: {
    initial() {
      return new Promise(resolve => {
        this.order = this.init.hasOwnProperty("order")
          ? JSON.parse(JSON.stringify(this.init.order))
          : JSON.parse(JSON.stringify(this.$store.getters.order));

        this.payment = this.order.payment;
        this.thirdPartyPayment = !this.station.terminal.enable;
        resolve();
      });
    },
    checkComponentUsage() {
      return new Promise((resolve, reject) => {
        let data = {
          component: "payment",
          operator: this.op.name,
          lock: this.order._id,
          time: +new Date(),
          exp: +new Date() + 1000 * 120
        };
        this.$socket.emit("[COMPONENT] LOCK", data, lock => {
          lock ? reject({ error: "paymentPending", data }) : resolve();
        });
      });
    },
    checkPermission() {
      return new Promise((resolve, reject) => {
        this.discountable = this.op.modify.includes("discount");
        this.op.cashCtrl === "disable"
          ? reject({ error: "accessDenied" })
          : resolve();
      });
    },
    checkSplit() {
      this.order.split ? this.askPayMode() : this.initialized();
    },
    askPayMode() {
      this.$dialog({
        type: "question",
        title: "dialog.splitPayment",
        msg: "dialog.splitPaymentTip",
        buttons: [
          { text: "button.paidInFull", fn: "reject" },
          { text: "button.splitPay", fn: "resolve" }
        ]
      })
        .then(() => {
          this.$q();
          this.paySplit();
        })
        .catch(() => {
          this.payWhole();
          this.setPaymentType("CASH");
          this.$q();
        });
    },
    paySplit() {
      this.payInFull = false;
      let index = this.order.splitPayment.findIndex(
        split => toFixed(split.remain.toFixed(2), 2) > 0
      );

      if (index === -1) {
        //Fuck Javascript Floating issue
        this.handleFloatingIssue();
      } else {
        this.switchInvoice(index);
        this.initialized();
      }
    },
    payWhole() {
      let paid = this.payment.log
        .map(log => log.paid - log.change)
        .reduce((a, b) => a + b, 0);
      this.payment.remain = Math.max(
        0,
        this.payment.balance - toFixed(paid, 2)
      );
      this.initialized();
    },
    initialized() {
      this.getQuickInput(this.payment.remain);
      this.poleDisplay(
        ["Balance Due:", ""],
        ["", this.payment.remain.toFixed(2)]
      );
    },
    initialFailed(reason) {
      let { error, data } = reason;
      switch (error) {
        case "paymentPending":
          let current = +new Date();
          let exp = data.exp;
          let duration = exp - current;

          this.releaseComponentLock = false;

          this.$dialog({
            title: "dialog.pending",
            msg: "dialog.pendingOrderAccessDenied",
            timeout: { duration, fn: "resolve" },
            buttons: [{ text: "button.confirm", fn: "resolve" }]
          }).then(() => {
            this.exit();
          });
          break;
        case "accessDenied":
          this.$dialog({
            type: "warning",
            title: "dialog.accessDenied",
            msg: "dialog.accessDeniedTip",
            timeout: { duration: 10000, fn: "resolve" },
            buttons: [{ text: "button.confirm", fn: "resolve" }]
          }).then(() => {
            this.exit();
          });
          break;
      }
    },
    setAnchor(target) {
      let dom = document.querySelector(".input.active");
      dom && dom.classList.remove("active");
      if (target instanceof Event) {
        this.anchor = target.currentTarget.dataset.anchor;
        target.currentTarget.classList.add("active");
        target.currentTarget.dataset.anchor === "tip"
          ? this.getQuickTip(this.payment.remain)
          : this.getQuickInput(this.payment.remain);
      } else {
        document
          .querySelector(`[data-anchor="${target}"]`)
          .classList.add("active");
      }

      this.reset = true;
    },
    del() {
      let { anchor, format } = document.querySelector(".input.active").dataset;
      let val = this[anchor];

      switch (format) {
        case "money":
          this[anchor] = (val.slice(0, -1) / 10).toFixed(2);
          break;
        case "number":
          this[anchor] = val.length > 0 ? val.slice(0, -1) : val;
          break;
      }
    },
    clear() {
      let { anchor, format } = document.querySelector(".input.active").dataset;

      switch (format) {
        case "money":
          this[anchor] = "0.00";
          break;
        case "number":
          this[anchor] = "";
          break;
      }
      this.reset = true;
    },
    charge() {
      switch (this.paymentType) {
        case "CASH":
          this.checkCashDrawer()
            .then(this.chargeCash)
            .then(this.tenderCash)
            .then(this.saveLogs)
            .then(this.postToDatabase)
            .then(this.askReceipt)
            .then(this.checkBalance)
            .catch(this.payFailed);
          break;
        case "CREDIT":
          this.checkOverPay()
            .then(this.checkEntry)
            .then(this.chargeCreditCard)
            .then(this.saveTransaction)
            .then(this.postToDatabase)
            .then(this.askReceipt)
            .then(this.checkBalance)
            .catch(this.payFailed);
          break;
        case "THIRD":
          this.checkOverPay()
            .then(this.chargeThirdParty)
            .then(this.saveLogs)
            .then(this.postToDatabase)
            .then(this.askReceipt)
            .then(this.checkBalance)
            .catch(this.payFailed);
          break;
        case "GIFT":
          this.swipeGiftCard()
            .then(this.checkGiftCard)
            .then(this.checkGiftCardBalance)
            .then(this.checkOverPay)
            .then(this.chargeGiftCard)
            .then(this.updateGiftCard)
            .then(this.postToDatabase)
            .then(this.askReceipt)
            .then(this.checkBalance)
            .catch(this.payFailed);
          break;
      }
    },
    payFailed(error) {
      typeof error === "object"
        ? this.$dialog(error).then(() => {
            this.$q();
          })
        : this.$q();
    },
    setPaymentType(type) {
      this.paymentType = type;

      switch (type) {
        case "CASH":
          this.paid = "0.00";
          this.tip = "0.00";
          break;
        case "CREDIT":
        case "THIRD":
          this.paid = this.payment.remain.toFixed(2);
          this.tip = this.payment.tip.toFixed(2);
          break;
        case "GIFT":
          this.giftCard = "";
          this.paid = this.payment.remain.toFixed(2);
          this.tip = this.payment.tip.toFixed(2);

          this.swipeGiftCard()
            .then(this.checkGiftCard)
            .catch(() => {
              this.$q();
            });
          break;
      }

      this.setAnchor("paid");
      this.thirdPartyType = null;
      this.getQuickInput(this.payment.remain);
    },
    checkOverPay() {
      return new Promise((resolve, reject) => {
        let error = {
          type: "error",
          title: "dialog.paymentFailed",
          msg: "dialog.canNotPayZeroAmount",
          buttons: [{ text: "button.confirm", fn: "resolve" }]
        };

        if (this.paid === "0.00") throw error;
        if (this.paid > this.payment.remain) {
          let extra = toFixed(this.paid - this.payment.remain, 2);
          this.$dialog({
            title: "dialog.paidAmountGreaterThanDue",
            msg: ["dialog.extraAmountSetAsTip", extra.toFixed(2)],
            buttons: [
              { text: "button.cancel", fn: "reject" },
              { text: "button.setTip", fn: "resolve" }
            ]
          })
            .then(() => {
              this.paid = this.payment.remain.toFixed(2);
              this.tip = extra.toFixed(2);
              this.payment.tip = extra;

              this.$q();
              this.recalculatePayment();
              resolve();
            })
            .catch(() => {
              this.$q();
            });
        } else {
          resolve();
        }
      });
    },
    chargeCash() {
      return new Promise(resolve => {
        let paid = Math.min(this.paid, this.payment.remain);
        this.payment.paid = toFixed(this.payment.paid + paid, 2);
        this.payment.type = "CASH";

        this.recalculatePayment();
        this.op.cashCtrl === "enable" && Printer.openCashDrawer();
        resolve("CASH");
      });
    },
    chargeCreditCard(card) {
      return new Promise((resolve, reject) => {
        this.componentData = { card, resolve, reject };
        this.component = "creditCard";
      });
    },
    chargeThirdParty() {
      return new Promise(charge => {
        if (this.thirdPartyType) {
          let paid = Math.min(this.paid, this.payment.remain);
          this.payment.paid = toFixed(this.payment.paid + paid, 2);
          this.payment.type = this.thirdPartyType;
          this.recalculatePayment();
          charge(this.thirdPartyType);
        } else {
          new Promise((resolve, reject) => {
            this.componentData = { resolve, reject, callback: true };
            this.component = "thirdParty";
          })
            .then(type => {
              let paid = Math.min(this.paid, this.payment.remain);
              this.payment.paid = toFixed(this.payment.paid + paid, 2);
              this.payment.type = type;
              this.recalculatePayment();
              charge(type);
            })
            .catch(() => {
              this.component = null;
            });
        }
      });
    },
    chargeGiftCard() {
      return new Promise((resolve, reject) => {
        let paid = Math.min(this.paid, this.payment.remain);
        this.payment.paid = toFixed(this.payment.paid + paid, 2);
        this.payment.type = "GIFT";

        this.recalculatePayment();
        resolve("GIFT");
      });
    },
    swipeGiftCard(number) {
      return new Promise((resolve, reject) => {
        if (typeof this.giftCard === "string") {
          this.componentData = number
            ? { resolve, reject, number }
            : { resolve, reject };
          this.component = "capture";
        } else {
          resolve({
            number: this.giftCard.number,
            result: this.giftCard
          });
        }
      });
    },
    queryGiftCard() {
      this.swipeGiftCard(this.giftCard)
        .then(this.checkGiftCard)
        .catch(() => {
          this.$q();
        });
    },
    checkGiftCard(card) {
      this.$q();

      return new Promise((resolve, reject) => {
        let { number, result } = card;

        if (result) {
          this.giftCard = result;
          this.setAnchor("paid");
          this.$forceUpdate();
          resolve();
        } else {
          this.$dialog({
            type: "error",
            title: "title.giftCardActivation",
            msg: ["title.giftCardNotActivated", number],
            buttons: [{ text: "button.confirm", fn: "resolve" }]
          }).then(reject);
        }
      });
    },
    checkCashDrawer() {
      return new Promise((resolve, reject) => {
        let error = {
          type: "error",
          title: "dialog.paymentFailed",
          msg: "dialog.canNotPayZeroAmount",
          buttons: [{ text: "button.confirm", fn: "resolve" }]
        };

        if (parseFloat(this.paid) === 0) throw error;
        this.station.cashDrawer.enable || this.op.cashCtrl === "staffBank"
          ? resolve()
          : reject({
              title: "dialog.cashDrawerUnavailable",
              msg: "dialog.cashDrawerUnavailableTip",
              buttons: [{ text: "button.confirm", fn: "resolve" }]
            });
      });
    },
    checkEntry() {
      return new Promise((resolve, reject) => {
        let number = this.creditCard.replace(/[^0-9\.]+/g, "");
        let date = this.expiration.replace(/[^0-9\.]+/g, "");
        let lengthError = {
          type: "error",
          title: "dialog.invalidCreditCard",
          msg: "dialog.creditCardLengthIncorrect",
          buttons: [{ text: "button.confirm", fn: "resolve" }]
        };
        let expError = {
          type: "error",
          title: "dialog.invalidCreditCard",
          msg: "dialog.expirationDateIncorrect",
          buttons: [{ text: "button.confirm", fn: "resolve" }]
        };

        if (number.length > 0 && number.length !== 16) throw lengthError;
        if (date.length > 0 && date.length !== 4) throw expError;

        let card = {
          creditCard: { number, date },
          amount: this.paid,
          tip: this.tip
        };
        resolve(card);
      });
    },
    tenderCash(type) {
      return new Promise(resolve => {
        this.poleDisplay(
          ["Paid Cash", this.paid.toFixed(2)],
          ["Change Due:", this.cashTender.toFixed(2)]
        );

        if (this.cashTender > 0) {
          this.$dialog({
            title: ["dialog.cashChange", this.cashTender.toFixed(2)],
            msg: ["dialog.cashChangeTip", this.paid.toFixed(2)],
            buttons: [{ text: "button.confirm", fn: "resolve" }]
          }).then(() => {
            this.$q();
            resolve(type);
          });
        } else {
          resolve(type);
        }
      });
    },
    saveTransaction(record) {
      this.poleDisplay("PAID by Credit Card", "Thank You");
      return new Promise((resolve, reject) => {
        Object.assign(record, {
          order: {
            _id: this.order._id,
            type: this.order.type || this.ticket.type,
            number: this.order.number || this.ticket.number,
            cashier: this.order.cashier || this.op.name,
            server: this.order.server || this.op.name
          }
        });

        this.payment.paid += parseFloat(record.amount.approve);
        this.payment.type = "CREDIT";
        this.recalculatePayment();

        if (this.tip > 0)
          record.amount.approve = (record.amount.approve - record.amount.tip
          ).toFixed(2);

        Printer.printCreditCard(record);

        this.$socket.emit("[SAVE] TRANSACTION", record, _id => {
          this.payment.log.push({
            _id,
            type: "CREDIT",
            change: "0.00",
            paid: record.amount.approve,
            balance: this.payment.remain,
            number: record.account.number,
            tip: record.amount.tip
          });

          let activity = {
            _id: ObjectId(),
            order: this.order._id,
            transaction: _id,
            type: "CREDITFLOW",
            inflow: parseFloat(record.amount.approve),
            outflow: 0,
            time: +new Date(),
            ticket: this.order.ticket,
            cardBin: record.account.number,
            operator: this.op.name
          };

          let cashDrawer =
            this.op.cashCtrl === "staffBank"
              ? this.op.name
              : this.station.cashDrawer.name;
          this.$socket.emit("[CASHFLOW] ACTIVITY", { cashDrawer, activity });

          resolve();
        });
      });
    },
    updateGiftCard() {
      return new Promise(resolve => {
        let paid = parseFloat(this.paid);
        let activity = {
          _id: Object(),
          order: this.order._id,
          type: "GIFTFLOW",
          inflow: paid,
          outflow: 0,
          time: +new Date(),
          ticket: this.order.ticket,
          operator: this.op.name
        };

        let cashDrawer =
          this.op.cashCtrl === "staffBank"
            ? this.op.name
            : this.station.cashDrawer.name;

        this.$socket.emit("[CASHFLOW] ACTIVITY", { cashDrawer, activity });

        let log = {
          balance: toFixed(this.giftCard.balance - paid, 2),
          change: -paid,
          date: today(),
          time: +new Date(),
          type: "Purchase",
          cashier: this.op.name,
          number: this.giftCard.number.replace(/\D/g, ""),
          order: {
            _id: this.order._id,
            number: this.order.number || this.ticket.number,
            type: this.order.type || this.ticket.type,
            time: +new Date()
          }
        };

        this.$socket.emit("[GIFTCARD] ACTIVITY", log, _id => {
          this.payment.log.push({
            _id,
            type: "GIFT",
            paid,
            change: 0,
            balance: this.cashTender
          });
          resolve();
        });
      });
    },
    askReceipt() {
      return new Promise(resolve => {
        this.store.noReceipt
          ? resolve()
          : this.$dialog({
              type: "question",
              title: "dialog.printReceiptConfirm",
              msg: "dialog.printReceiptConfirmTip",
              buttons: [
                { text: "button.noReceipt", fn: "reject" },
                { text: "button.printReceipt", fn: "resolve" }
              ]
            })
              .then(() => {
                if (this.payInFull) {
                  Printer.setTarget("Receipt").print(this.order, true);
                } else {
                  let index = this.current + 1;
                  let order = JSON.parse(JSON.stringify(this.order));
                  order.payment = this.payment;
                  order.number = order.number + "-" + index;
                  order.content = this.order.content.filter(item => {
                    if (Array.isArray(item.sort)) {
                      return item.sort.includes(index);
                    } else {
                      return item.sort === index;
                    }
                  });
                  Printer.setTarget("Receipt").print(order, true);
                }

                resolve();
                this.$q();
              })
              .catch(() => {
                resolve();
                this.$q();
              });
      });
    },
    saveLogs(type) {
      return new Promise(resolve => {
        let activity;
        let _id = ObjectId();
        let order = this.order._id;
        let cashDrawer =
          this.op.cashCtrl === "staffBank"
            ? this.op.name
            : this.station.cashDrawer.name;

        switch (type) {
          case "CASH":
            activity = {
              _id,
              order,
              type: "CASHFLOW",
              inflow: parseFloat(this.paid),
              outflow: parseFloat(this.cashTender),
              time: +new Date(),
              ticket: this.order.ticket,
              operator: this.op.name
            };
            break;
          default:
            activity = {
              _id,
              order,
              type: "OTHERFLOW",
              inflow: parseFloat(this.paid),
              outflow: 0,
              time: +new Date(),
              ticket: this.order.ticket,
              operator: this.op.name
            };
        }
        this.$socket.emit("[CASHFLOW] ACTIVITY", { cashDrawer, activity });

        let actual =
          type === "CASH"
            ? toFixed(this.paid - this.cashTender, 2)
            : parseFloat(this.paid);

        let balance = Math.max(0, this.payment.remain);

        let log = {
          _id: null,
          type,
          paid: parseFloat(this.paid),
          change: type === "CASH" ? this.cashTender : 0,
          actual,
          balance,
          tip: parseFloat(this.tip),
          number: null
        };

        this.payment.log.push(log);
        resolve();
      });
    },
    postToDatabase() {
      return new Promise((resolve, reject) => {
        let settled = this.isTicketSettled();

        if (this.isNewTicket) {
          let customer = JSON.parse(JSON.stringify(this.customer));
          delete customer.extra;

          Object.assign(this.order, {
            payment: this.payInFull ? this.payment : this.combineSplitPayment(),
            customer,
            type: this.ticket.type,
            station: this.station.alies,
            cashier: this.op.name,
            source: this.op.role === "ThirdParty" ? this.op.name : "POS",
            modify: 0,
            status: 1,
            date: today(),
            time: +new Date(),
            settled,
            print: true
          });

          this.$socket.emit("[SAVE] INVOICE", this.order, false, content => {
            this.order = content;
            resolve();
          });
        } else {
          Object.assign(this.order, {
            payment: this.payInFull ? this.payment : this.combineSplitPayment(),
            cashier: this.op.name,
            settled,
            print: true
          });
          this.$socket.emit("[UPDATE] INVOICE", this.order, false);
          resolve();
        }
      });
    },
    isTicketSettled() {
      if (this.payInFull) {
        return this.payment.remain === 0;
      } else {
        return this.order.splitPayment.every(ticket => ticket.remain === 0);
      }
    },
    combineSplitPayment() {
      this.order.splitPayment[this.current] = JSON.parse(
        JSON.stringify(this.payment)
      );
      let payment = {
        subtotal: 0,
        tax: 0,
        total: 0,
        due: 0,
        balance: 0,
        paid: 0,
        change: 0,
        gratuity: 0,
        tip: 0,
        discount: 0,
        delivery: 0,
        surcharge: 0,
        remain: 0,
        log: [],
        type: "MULTIPLE",
        settled: true
      };
      this.order.splitPayment.forEach(split => {
        Object.keys(split).forEach(key => {
          switch (typeof split[key]) {
            case "number":
              payment[key] = toFixed(payment[key] + split[key], 2);
              break;
            case "object":
              if (Array.isArray(split[key])) {
                payment[key].push(...split[key]);
              }
              break;
            case "boolean":
              !split[key] && (payment[key] = false);
              break;
          }
        });
      });
      delete payment.sort;
      return payment;
    },
    checkBalance() {
      if (this.payInFull) {
        if (this.payment.remain > 0) {
          this.poleDisplay("Thank You", [
            "Due:",
            this.payment.remain.toFixed(2)
          ]);
          this.$q();
          this.setPaymentType("CASH");
        } else {
          this.poleDisplay("Thank You", "Please Come Again!");
          if (this.isNewTicket) {
            this.$socket.emit("[UPDATE] INVOICE", this.order, true);
            Printer.setTarget("Order").print(this.order);
            this.exitPayment();
          } else {
            this.exitPayment();
          }
        }
      } else {
        let index = this.order.splitPayment.findIndex(
          split => toFixed(split.remain.toFixed(2), 2) > 0
        );
        index === -1 ? this.settled() : this.switchInvoice(index);
      }
    },
    checkGiftCardBalance() {
      return new Promise((resolve, reject) => {
        if (this.giftCard.balance <= 0) {
          this.$dialog({
            type: "error",
            title: "dialog.paymentFailed",
            msg: "dialog.insufficientAmount",
            buttons: [{ text: "button.confirm", fn: "resolve" }]
          }).then(() => {
            this.$q();
            reject();
          });
        } else if (this.giftCard.balance < this.paid) {
          this.$dialog({
            type: "warning",
            title: "dialog.paymentFailed",
            msg: "dialog.canNotPayZeroAmount",
            buttons: [
              { text: "button.cancel", fn: "reject" },
              { text: "button.chargeRemain", fn: "resolve" }
            ]
          })
            .then(() => {
              this.paid = this.giftCard.balance.toFixed(2);
              this.$q();
              resolve();
            })
            .catch(() => {
              reject();
            });
        } else {
          resolve();
        }
      });
    },
    switchInvoice(index) {
      this.current = index;
      this.payment = this.order.splitPayment[index];
      this.setPaymentType("CASH");
      this.getQuickInput(this.payment.remain);
    },
    input(val) {
      let { anchor, format } = document.querySelector(".input.active").dataset;
      let value = this[anchor];

      switch (format) {
        case "money":
          value = this.reset ? val : (value * 100).toFixed(0) + val;
          this[anchor] = (value / 100).toFixed(2);
          break;
        case "number":
          value = this.reset ? val : value + val;
          this[anchor] = value;
          break;
      }

      this.reset = false;
    },
    setTip() {
      new Promise((resolve, reject) => {
        this.componentData = { resolve, reject, payment: this.payment };
        this.component = "tips";
      })
        .then(result => {
          let { tip } = result;
          this.tip = tip.toFixed(2);
          Object.assign(this.payment, { tip });
          this.recalculatePayment();
          this.$q();
        })
        .catch(() => {
          this.$q();
        });
    },
    setDiscount() {
      new Promise((resolve, reject) => {
        this.componentData = { resolve, reject, payment: this.payment };
        this.component = "discount";
      })
        .then(result => {
          let { discount, coupon } = result;

          if (coupon) {
            this.setOrder({ coupon });
            Object.assign(this.order, { coupon });
          } else {
            this.setOrder({ coupon: undefined });
            Object.assign(this.order, { coupon: undefined });
          }

          Object.assign(this.payment, { discount });
          this.recalculatePayment();

          this.poleDisplay(
            ["Discount:", -discount.toFixed(2)],
            ["Due:", this.payment.remain.toFixed(2)]
          );

          this.$q();
        })
        .catch(() => {
          this.$q();
        });
    },
    save() {
      if (this.isNewTicket) {
        this.setOrder(Object.assign(this.order, { payment: this.payment }));
        this.exit();
      } else {
        Object.assign(this.order, { payment: this.payment });
        this.$socket.emit("[UPDATE] INVOICE", this.order, false);
        this.exit();
      }
    },
    preview(index) {
      let ticket = JSON.parse(JSON.stringify(this.order));
      ticket.payment = ticket.splitPayment[index];
      ticket.print = false;

      let { sort } = ticket.payment;

      ticket.content = ticket.content.filter(
        item =>
          Array.isArray(item.sort)
            ? item.sort.includes(sort)
            : item.sort === sort
      );
      ticket.content.forEach(item => {
        item.print = false;
      });

      this.$p("ticket", { ticket, exit: true });
    },
    roundUp() {
      let rounded = Math.ceil(this.payment.remain);

      this.payment.gratuity = toFixed(rounded - this.payment.remain, 2);
      this.paid = "0.00";

      this.recalculatePayment();
    },
    setQuickInput(val) {
      let { anchor } = document.querySelector(".input.active").dataset;
      anchor === "tip"
        ? (this.tip = val.toFixed(2))
        : (this.paid = val.toFixed(2));

      this.reset = true;
    },
    getQuickInput(amount) {
      let preset = [
        1,
        2,
        3,
        4,
        5,
        10,
        15,
        20,
        25,
        30,
        35,
        40,
        45,
        50,
        60,
        70,
        80,
        100,
        120,
        140,
        150,
        200,
        300,
        350,
        400,
        450,
        500,
        600,
        700,
        800,
        900,
        1000,
        1100,
        1500,
        2000,
        3000,
        4000,
        5000
      ];
      let array = [];
      let round = Math.ceil(isNumber(amount) ? toFixed(amount, 2) : 0);
      array.push(amount.toFixed(2));
      amount === round ? array.push(round + 1) : array.push(round);
      let index = preset.findIndex(i => i > round);
      array.push(preset.slice(index, index + 6));
      this.quickInput = [].concat.apply([], array);
    },
    getQuickTip(amount) {
      let preset = [];
      let base = (Math.ceil(toFixed(amount, 2)) - amount).toFixed(2);
      preset.push(base);
      preset.push((parseFloat(base) + 1).toFixed(2));
      preset.push("1.00");
      preset.push("2.00");
      preset.push("3.00");
      preset.push("5.00");
      preset.push((amount * 0.15).toFixed(2));
      preset.push((amount * 0.2).toFixed(2));
      this.quickInput = preset;
    },
    recalculatePayment() {
      let {
        subtotal,
        tax,
        discount,
        paid,
        delivery,
        tip,
        gratuity
      } = this.payment;
      let total = toFixed(subtotal + tax + delivery, 2);
      let due = toFixed(total - discount, 2);
      let surcharge = toFixed(tip + gratuity, 2);
      let balance = toFixed(due + surcharge, 2);
      let remain = Math.max(0, toFixed(balance - paid, 2));
      let settled = remain === 0;

      this.payment = Object.assign({}, this.payment, {
        total,
        due,
        tip,
        discount,
        surcharge,
        balance,
        remain,
        settled
      });
      this.getQuickInput(remain);
    },
    poleDisplay(line1, line2) {
      if (!this.device.poleDisplay) return;
      poleDisplay.write("\f");
      poleDisplay.write(line(line1, line2));
    },
    settled() {
      this.combineSplitPayment();
      this.order.settled = true;
      this.$socket.emit("[UPDATE] INVOICE", this.order, false);
      this.exitPayment();
    },
    exit() {
      this.init.reject();
    },
    exitPayment() {
      switch (this.$route.name) {
        case "Menu":
          let { doneLock } = this.station;
          if (this.ticket.type === "BUFFET") {
            this.resetMenu();
            this.exit();
          } else {
            if (doneLock) {
              this.setOp(null);
              this.resetAll();
              this.$router.push({ path: "/main/lock" });
            } else {
              this.resetAll();
              this.$router.push({ path: "/main" });
            }
          }
          break;
        case "Table":
          this.resetAll();
        case "History":
        case "PickupList":
          this.exit();
          break;
        default:
          this.exit();
      }
    },
    handleFloatingIssue() {
      this.$dialog({
        type: "alert",
        title: "dialog.splitTicketSettled",
        msg: "dialog.splitTicketSettledTip",
        buttons: [
          { text: "button.cancel", fn: "reject" },
          { text: "button.markAsPaid", fn: "resolve" }
        ]
      })
        .then(() => {
          let payment = this.combineSplitPayment();
          Object.assign(this.order, { payment });
          this.$socket.emit("[UPDATE] INVOICE", this.order, false);
          this.exit();
        })
        .catch(() => {
          this.exit();
        });
    },
    ...mapActions(["setOp", "setOrder", "resetAll", "resetMenu"])
  },
  watch: {
    tip(n) {
      this.payment.tip = toFixed(n, 2);
      this.recalculatePayment();
      n === "0.00" && (this.paid = this.payment.remain.toFixed(2));
      this.paymentType !== "CASH" &&
        (this.paid = this.payment.remain.toFixed(2));
    }
  }
};
</script>

<style scoped>
.window {
  width: 916px;
}

nav {
  display: flex;
  margin-left: 4px;
}

.viewer {
  display: inline-flex;
  margin-left: 10px;
}

.viewer input:checked + label {
  background: #3f51b5;
}

.viewer .tag {
  width: 35px;
  justify-content: center;
  display: flex;
  margin-right: 5px;
  cursor: pointer;
  transition: background 0.3s ease;
  border-radius: 4px;
  background: #51aef5;
}

.viewer label {
  position: relative;
}

.viewer input:checked ~ .preview {
  animation: preview 0.5s 0.2s ease-out forwards;
}

.preview {
  visibility: hidden;
  position: absolute;
  bottom: 40px;
  left: -18px;
  width: 75px;
  height: 70px;
  background-color: #555;
  color: #fff;
  text-align: center;
  padding: 5px 0;
  border-radius: 6px;
  z-index: 1;
  opacity: 0;
  display: flex;
  flex-direction: column;
}

.preview:after {
  content: "";
  position: absolute;
  top: 100%;
  left: 50%;
  margin-left: -5px;
  border-width: 5px;
  border-style: solid;
  border-color: #555 transparent transparent transparent;
}

.preview span {
  font-size: 16px;
}

.preview i {
  font-size: 28px;
  color: #eeeeee;
  padding: 8px 2px;
}

.paymentTypes {
  display: flex;
  height: 60px;
}

.paymentTypes label {
  display: block;
  width: 104px;
  margin: 4px 6px 4px 0;
  background: #fff;
  border: 2px solid #e0e0e0;
  position: relative;
  text-align: center;
  line-height: 49px;
  border-radius: 4px;
  color: #bdbdbd;
}

.options {
  display: flex;
  flex-wrap: wrap;
}

.options label {
  display: flex;
  width: 103px;
  height: 50px;
  margin: 2px;
  justify-content: center;
  background: #fff;
  border: 2px solid #e0e0e0;
  position: relative;
  text-align: center;
  align-items: center;
  border-radius: 4px;
  color: #bdbdbd;
}

.options label:after {
  bottom: 0px !important;
}

.type input:checked + label {
  background: #66bb6a;
  color: #fafafa;
  border: 2px solid #009688;
  text-shadow: 0 2px 1px rgba(0, 0, 0, 0.5);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.type input:checked + label:before {
  position: absolute;
  content: " ";
  width: 23px;
  height: 15px;
  background: #009688;
  bottom: 0;
  right: 0;
  border-top-left-radius: 4px;
}

.type input:checked + label:after {
  position: absolute;
  content: "\f00c";
  font-family: fontAwesome;
  bottom: -17px;
  right: 3px;
}

.balanceDue {
  width: 219px;
  height: 42px;
  margin: 10px 0 4px;
  border-radius: 4px;
  border: 2px solid #607d8b;
  color: #3c3c3c;
  position: relative;
}

.balanceDue .for {
  position: absolute;
  top: -12px;
  background: #f5f5f5;
  font-weight: 700;
  left: 10px;
  padding: 0 5px;
}

.balanceDue .inner {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 0 5px;
}

.due {
  font-family: "Agency FB";
  font-weight: bold;
  font-size: 36px;
}

.symbol {
  font-size: 26px;
  font-weight: normal;
  color: #009688;
  text-shadow: 0 1px 1px #ddd;
}

.addition {
  display: flex;
  flex-direction: column;
  margin-left: 5px;
  text-align: center;
  color: #ff9800;
  font-size: 14px;
  text-align: center;
}

.addition .text {
  font-size: 14px;
}

.fn {
  margin-left: 4px;
}

.fn .btn {
  height: 48px;
  margin: 6px 2px;
  width: 106px;
}

article {
  display: flex;
  margin-left: 4px;
}

section.numpad {
  display: flex;
  flex-wrap: wrap;
  width: 342px;
}
.double {
  width: 223px;
}
section.field {
  display: flex;
  width: 339px;
}
.input {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 223px;
  height: 83px;
  border-radius: 2px;
  margin-bottom: 6px;
  color: #4c4b4b;
  box-shadow: var(--shadow);
}
.input.active {
  background: #5c6bc0;
  color: #fff;
  text-shadow: 0 1px 1px #444;
}
.input .text {
  padding: 7px 10px;
  font-size: 22px;
  display: flex;
  align-items: center;
}
.input input {
  border: none;
  background: none;
  outline: none;
  font-size: 26px;
  text-align: right;
  padding-right: 10px;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  font-family: "Agency FB";
  font-weight: bold;
  color: #3c3c3c;
}
.input.active input {
  color: #fff;
}
.people {
  font-family: "Agency FB";
  font-size: 17px;
  color: #fafafa;
  padding: 1px 8px;
  text-shadow: 0 1px 1px #333;
  background: #4caf50;
  border-radius: 4px;
  margin-left: 10px;
  box-shadow: 0 1px 1px #607d8b;
}

.input .value {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 10px;
  font-size: 26px;
  font-family: "Agency FB";
  font-weight: bold;
}

aside.numpad {
  text-align: center;
  margin-left: 5px;
}

section.quickInput {
  margin-left: 3px;
  display: flex;
  flex-wrap: wrap;
  height: 353px;
  width: 228px;
}
.disabled {
  opacity: 0.5;
  pointer-events: none;
}

@keyframes preview {
  from {
    opacity: 0;
    transform: translate3d(0, 10px, 0);
  }
  to {
    opacity: 1;
    visibility: visible;
    transform: translate3d(0, 0, 0);
  }
}
</style>