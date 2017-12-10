<template>
  <div>
    <external title="setting.tax" tooltip="tip.tax" @open="editTax"></external>
    <toggle title="setting.taxBeforeDiscount" v-model="tax.beforeDiscount" @update="updateTaxDiscount"></toggle>
    <toggle title="setting.taxBeforeCredit" v-model="tax.beforeCredit" @update="updateTaxCredit"></toggle>
    <toggle title="setting.deliveryTax" tooltip="tip.deliveryTax" v-model="tax.deliveryTax" @update="updateDeliveryTax"></toggle>
    <toggle title="setting.deliveryCharge" true-tooltip="tip.deliveryCharge" false-tooltip="tip.deliveryFree" v-model="store.delivery" :conditionalTooltip="true" @update="updateDelivery">
        <transition name="dropdown">
          <div class="opt" v-if="store.delivery">
            <inputer title="text.amount" v-model.number="store.deliveryCharge" @update="updateDeliveryCharge"></inputer>
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
    <!-- <toggle title="setting.rounding" v-model="store.rounding.enable"></toggle> -->
    <options title="setting.receiptDialog" tooltip="tip.receiptDefaultAction" v-model="store.receipt" :opts="receiptOption" @update="updateReceipt"></options>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import toggle from "../common/toggle";
import inputer from "../common/inputer";
import options from "../common/options";
import external from "../common/external";
import textInput from "../common/textInput";

export default {
  components: { options, toggle, inputer, textInput, external },
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
    updateDeliveryCharge(value) {
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
    },
    editTax() {
      this.$router.push({ name: "Setting.store.tax" });
    }
  }
};
</script>