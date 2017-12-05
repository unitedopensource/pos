<template>
    <div>
        <toggle></toggle>
        <options title="setting.receiptDialog" tooltip="tip.receiptDefaultAction" v-model="store.receipt" :choice="receiptOption"></options>
    </div>
</template>

<script>
import { mapGetters } from "vuex";
import toggle from "../common/toggle";
import options from "../common/options";
import textInput from "../common/textInput";
export default {
  components: { textInput, options, toggle },
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
  }
};
</script>