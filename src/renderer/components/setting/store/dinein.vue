<template>
    <div>
        <toggle title="setting.table" true-tooltip="tip.dinein.useTableLayout" false-tooltip="tip.dinein.noTableLayout" v-model="dinein.table" :conditionalTooltip="true"></toggle>
        <toggle title="setting.guestCount" tooltip="tip.dinein.guestCount" v-model="dinein.table"></toggle>
        <toggle title="setting.autoClear" tooltip="tip.dinein.autoClearTable" v-model="dinein.autoClear"></toggle>
        <toggle title="setting.printOnDone" true-tooltip="tip.dinein.printReceipt" false-tooltip="tip.dinein.noReceipt" v-model="dinein.printOnDone" :conditionalTooltip="true"></toggle>
        <toggle title="setting.passwordRequire" tooltip="tip.dinein.passwordRequire" v-model="dinein.passwordRequire"></toggle>
        <external title="setting.surcharge" tooltip="tip.tax">
            <div class="external" @click="edit">
                <i class="fa fa-caret-right"></i>
            </div>
        </external>
    </div>
</template>

<script>
import toggle from "../common/toggle";
import external from "../common/external";
export default {
  components: { toggle, external },
  data() {
    return {
      dinein: null
    };
  },
  created() {
    this.dinein = Object.assign({}, this.$store.getters.dinein);
  },
  methods: {
    edit() {
        
    }
  }
};
</script>