<template>
  <div>
    <header class="nav">
      <router-link tag="div" :to="{name:'Setting.printer'}" class="back">
        <i class="fa fa-chevron-left"></i>
      </router-link>
      <div class="title">
        <h3>{{printer}}</h3>
      </div>
      <nav>
        <span>{{$t('button.remove')}}</span>
      </nav>
    </header>
    <external title="print.printTicket" @open="$router.push({name:'Setting.printer.option',params:{printer,obj:'print'}})"></external>
    <external title="print.printDouble" @open="$router.push({name:'Setting.printer.option',params:{printer,obj:'double'}})"></external>
    <external title="print.title" @open="$router.push({name:'Setting.printer.title',params:{printer}})"></external>
    <external title="print.footer" @open="openFooterEditor"></external>
    <toggle title="print.buzzer" v-model="config.control.buzzer" @update="updateBuzzer"></toggle>
    <toggle title="print.category" v-model="config.control.categorize" @update="updateCategorize"></toggle>
    <toggle title="print.priority" v-model="config.control.prioritize" @update="updatePrioritize"></toggle>
    <options title="print.mode" tooltip="tip.printMode" v-model="config.control.mode" :opts="modeOpts" @update="updateMode"></options>
    <div :is="component" :init="componentData"></div>
  </div>
</template>

<script>
import toggle from "../common/toggle";
import options from "../common/options";
import external from "../common/external";
import editor from "./component/footerEditor";

export default {
  props: ["printer"],
  components: { editor, toggle, options, external },
  data() {
    return {
      config: null,
      componentData: null,
      component: null,
      modeOpts: [
        {
          label: "print.normal",
          tooltip: "tip.mode.normal",
          value: "normal"
        },
        {
          label: "print.difference",
          tooltip: "tip.mode.difference",
          value: "difference"
        },
        {
          label: "print.new",
          tooltip: "tip.mode.new",
          value: "new"
        },
        {
          label: "print.todo",
          tooltip: "tip.mode.todo",
          value: "todo"
        }
      ]
    };
  },
  created() {
    const config = this.$store.getters.config.printers[this.printer];
    this.config = JSON.parse(JSON.stringify(config));
  },
  beforeDestroy() {
    Object.assign(
      this.$store.getters.config.printers[this.printer],
      this.config
    );
    
    Printer.initial(
      CLODOP,
      this.$store.getters.config,
      this.$store.getters.station
    );
  },
  methods: {
    update(data) {
      this.$socket.emit("[CONFIG] UPDATE", data);
    },
    updateMode(value) {
      this.update({
        key: `printers.${this.printer}.control.mode`,
        value
      });
    },
    updateBuzzer(value) {
      this.update({
        key: `printers.${this.printer}.control.buzzer`,
        value
      });
    },
    updateCategorize(value) {
      this.update({
        key: `printers.${this.printer}.control.categorize`,
        value
      });
    },
    updatePrioritize(value) {
      this.update({
        key: `printers.${this.printer}.control.prioritize`,
        value
      });
    },
    openFooterEditor() {}
  }
};
</script>