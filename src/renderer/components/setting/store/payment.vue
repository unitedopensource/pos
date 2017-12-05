<template>
    <div>
        <external title="setting.tax" tooltip="tip.tax">
            <div class="edit" @click="editTax">
                <i class="fa fa-caret-right"></i>
            </div>
        </external>
        <toggle title="setting.deliveryCharge" true-tooltip="tip.deliveryCharge" false-tooltip="tip.deliveryTax" v-model="store.delivery" :conditionalTooltip="true">
            <transition name="dropdown">
                <div v-if="store.delivery">123</div>
            </transition>
        </toggle>
        <toggle title="setting.deliveryTax" tooltip="tip.deliveryTax" v-model="tax.deliveryTax"></toggle>
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
          value: "dialog"
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
.edit {
  margin: 0 10px;
  padding: 10px 25px;
  color: #555;
  cursor: pointer;
}

.edit:hover {
  background: #eee;
  border-radius: 4px;
}
</style>