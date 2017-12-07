<template>
  <div>
    <external title="setting.tax" tooltip="tip.tax">
        <router-link tag="div" class="external" :to="{name:'Setting.store.tax'}">
            <i class="fa fa-caret-right"></i>
        </router-link>
    </external>
    <toggle title="setting.taxBeforeDiscount" v-model="tax.beforeDiscount" @update="updateTaxDiscount"></toggle>
    <toggle title="setting.taxBeforeCredit" v-model="tax.beforeCredit" @update="updateTaxCredit"></toggle>
    <toggle title="setting.deliveryTax" tooltip="tip.deliveryTax" v-model="tax.deliveryTax" @update="updateDeliveryTax"></toggle>
    <toggle title="setting.deliveryCharge" true-tooltip="tip.deliveryCharge" false-tooltip="tip.deliveryFree" v-model="store.delivery" :conditionalTooltip="true" @update="updateDelivery">
        <transition name="dropdown">
            <div v-if="store.delivery" class="fees">
              <label>{{$t('text.amount')}}</label>
              <input type="text" v-model="store.deliveryCharge" v-mask="'$ ##.##'" maxlength="7" placeholder="$ 0.00" @blur="updateDeliveryCharge">
            </div>
        </transition>
    </toggle>
    <toggle title="setting.tipSuggestion" tooltip="tip.tipSuggestion" v-model="store.tipSuggestion" @update="updateTipSuggestion">
      <transition name="dropdown">
            <div v-if="store.tipSuggestion" class="fees">
              <label>{{$t('text.tipPercentage')}}</label>
              <input type="text" v-model="store.tipPercentages" v-mask="'##,##,##'" maxlength="10" placeholder="15,18,20" @blur="updateTipPercentages">
            </div>
        </transition>
    </toggle>
    <options title="setting.receiptDialog" tooltip="tip.receiptDefaultAction" v-model="store.receipt" :opts="receiptOption" @update="updateReceipt"></options>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import toggle from "../common/toggle";
import options from "../common/options";
import external from "../common/external";
import textInput from "../common/textInput";

export default {
  components: { options, toggle, textInput, external },
  computed: {
    ...mapGetters(["config", "tax"])
  },
  data() {
    return {
      store: null,
      receiptOption: [
        {
          label: "text.prompt",
          tooltip: "tip.alwaysAskReceipt",
          value: "prompt"
        },
        {
          label: "text.never",
          tooltip: "tip.doNotPrintReceipt",
          value: "never"
        },
        {
          label: "text.always",
          tooltip: "tip.alwaysPrintReceipt",
          value: "always"
        }
      ]
    };
  },
  created() {
    this.store = Object.assign({}, this.config.store);
  },
  methods: {
    update(data) {
      this.$socket.emit("[UPDATE] CONFIG", data);
    },
    updateTaxDiscount(value) {
      this.update({
        key: "tax.beforeDiscount",
        value
      });
    },
    updateTaxCredit(value) {
      this.update({
        key: "tax.beforeCredit",
        value
      });
    },
    updateDeliveryTax(value) {
      this.update({
        key: "tax.deliveryTax",
        value
      });
    },
    updateDelivery(value) {
      this.update({
        key: "store.delivery",
        value
      });
    },
    updateDeliveryCharge() {
      let value = parseFloat(this.store.deliveryCharge.replace(/^\D+/g, ""));
      this.update({
        key: "store.deliveryCharge",
        value
      });
    },
    updateTipSuggestion(value) {
      this.update({
        key: "store.tipSuggestion",
        value
      });
    },
    updateTipPercentages() {
      let value = this.store.tipPercentages || "15,18,20";
      if (value.split(",").length === 3) {
        this.update({
          key: "store.tipPercentages",
          value
        });
      }
    },
    updateReceipt(value) {
      this.update({
        key: "store.receipt",
        value
      });
    }
  }
};
</script>

<style scoped>
.fees {
  display: flex;
  align-items: center;
  padding: 5px 0 10px 30px;
}

.fees input {
  border: none;
  outline: none;
  border-bottom: 1px solid #ddd;
  margin-left: 15px;
  font-family: "Agency FB";
  font-weight: bold;
  font-size: 18px;
  width: 100px;
  text-indent: 10px;
  color: #3c3c3c;
}
</style>