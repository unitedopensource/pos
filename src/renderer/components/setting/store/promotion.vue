<template>
    <div>
        <toggle title="setting.rewardSystem" v-model="store.reward"></toggle>
    </div>
</template>

<script>
import toggle from "../common/toggle";
import options from "../common/options";
export default {
  components: { toggle, options },
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