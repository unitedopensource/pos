<template>
    <div>
        <external title="setting.tax" tooltip="tip.tax">
            <div class="external" @click="editTax">
                <i class="fa fa-caret-right"></i>
            </div>
        </external>
        <toggle title="setting.taxBeforeDiscount" v-model="tax.beforeDiscount"></toggle>
        <toggle title="setting.taxBeforeCredit" v-model="tax.beforeCredit"></toggle>
        <toggle title="setting.deliveryTax" tooltip="tip.deliveryTax" v-model="tax.deliveryTax"></toggle>
        <toggle title="setting.deliveryCharge" true-tooltip="tip.deliveryCharge" false-tooltip="tip.deliveryFree" v-model="store.delivery" :conditionalTooltip="true">
            <transition name="dropdown">
                <div v-if="store.delivery" class="fees">
                  <label>{{$t('text.amount')}}</label>
                  <input type="text" v-model.number="store.deliveryCharge" maxlength="4" placeholder="$ 0.00">
                </div>
            </transition>
        </toggle>
        <toggle title="setting.tipSuggestion" tooltip="tip.tipSuggestion" v-model="store.tipSuggestion">
          <transition name="dropdown">
                <div v-if="store.tipSuggestion" class="fees">
                  <label>{{$t('text.tipPercentage')}}</label>
                  <input type="text" v-model="store.tipPercentages" maxlength="8" placeholder="15,18,20">
                </div>
            </transition>
        </toggle>
        <options title="setting.receiptDialog" tooltip="tip.receiptDefaultAction" v-model="store.receipt" :choice="receiptOption"></options>
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
    editTax() {}
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