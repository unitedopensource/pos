<template>
    <div>
    <toggle title="setting.matrix" true-tooltip="tip.matrixService" false-tooltip="tip.disableMatrix" v-model="store.matrixService" :conditionalTooltip="true">
        <transition name="dropdown">
            <div v-if="store.matrixService" class="opt">
                <inputer title="text.api" v-model="store.mapAPI"></inputer>
            </div>
        </transition>
    </toggle>
    </div>
</template>

<script>
import toggle from "../common/toggle";
import inputer from "../common/inputer";
import switches from "../common/switches";
export default {
  components: { toggle, switches, inputer },
  data() {
    return {
      store: null
    };
  },
  created() {
    this.store = Object.assign({}, this.$store.getters.store);
  }
};
</script>