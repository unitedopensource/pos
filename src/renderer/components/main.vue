<template>
  <div class="container" @click.self="toggleKeyboard(false)">
    <dock></dock>
    <router-view></router-view>
    <div :is="component" :init="componentData"></div>
  </div>
</template>

<script>
import { mapActions } from "vuex";
import dock from "./dock/dock";
import discount from "./payment/discount";

export default {
  components: { dock, discount },
  data() {
    return {
      componentData: null,
      component: null
    }
  },
  created() {
    this.$bus.on("__THREAD__OPEN", this.openComponent)
  },
  beforeDestroy() {
    this.$bus.off("__THREAD__OPEN", this.openComponent)
  },
  methods: {
    openComponent({ component, args }) {
      switch (component) {
        case "discount":
          new Promise((resolve, reject) => {
            this.componentData = Object.assign({}, { resolve, reject }, args);
            this.component = component;
          }).then(result => {
            this.$bus.emit("__THREAD__CLOSE", result);
            this.$q()
          }).catch(() => this.$q());
          break;
      }
    },
    ...mapActions(["toggleKeyboard"])
  }
};
</script>
