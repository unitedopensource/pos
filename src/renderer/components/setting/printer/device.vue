<template>
  <div>
    <header class="nav">
      <div class="title">
        <h3>{{$t("title.printerList")}}</h3>
      </div>
      <nav>
        <span class="add" @click="create">{{$t('button.new')}}</span>
      </nav>
    </header>
    <external :title="printer" v-for="(printer,index) in printers" :key="index" @open="config(printer)"></external>
    <div :is="component" :init="componentData"></div>
  </div>
</template>

<script>
import Preset from "../../../preset";
import editor from "./component/creator";
import external from "../common/external";

export default {
  components: { editor, external },
  data() {
    return {
      printers: Object.keys(this.$store.getters.config.printers),
      componentData: null,
      component: null
    };
  },
  methods: {
    create() {
      new Promise((resolve, reject) => {
        this.componentData = { resolve, reject, printers: this.printers };
        this.component = "editor";
      })
        .then(name => {
          const printer = Preset.printer();
          Object.assign(this.$store.getters.config.printers, {
            [name]: printer
          });

          this.printers = Object.keys(this.$store.getters.config.printers);

          this.$socket.emit("[CONFIG] UPDATE", {
            key: `printers.${name}`,
            value: printer
          });
          this.$q();
        })
        .catch(() => this.$q());
    },
    config(printer) {
      this.$emit("click", printer);
    }
  }
};
</script>