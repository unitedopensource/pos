<template>
    <div>
        <header class="nav">
          <div class="back" @click="save">
              <i class="fa fa-chevron-left"></i>
          </div>
          <nav></nav>
        </header>
        <toggle title="text.cashDrawer" true-tooltip="tip.enableCashdrawer" false-tooltip="tip.disableCashdrawer" :conditionalTooltip="true" v-model="cashDrawer.enable">
            <transition name="dropdown">
                <div class="opt" v-if="cashDrawer.enable">
                    <inputer title="text.alias" v-model="cashDrawer.name"></inputer>
                </div>
            </transition>
        </toggle>
        <text-list title="text.binding" v-model="cashDrawer.bind" :opts="printers"></text-list>
        <toggle title="setting.cashFlowRecord" v-model="cashDrawer.cashFlowCtrl">
            <transition name="dropdown">
                <div v-if="cashDrawer.cashFlowCtrl" class="opt">
                    <inputer title="text.initialAmount" v-model.number="cashDrawer.initialAmount"></inputer>
                </div>
            </transition>
        </toggle>
      </div>
</template>

<script>
import toggle from "../../common/toggle";
import inputer from "../../common/inputer";
import textList from "../../common/textList";

export default {
  props: ["init"],
  components: { toggle, inputer, textList },
  data() {
    return {
      cashDrawer: null,
      printers: []
    };
  },
  created() {
    this.cashDrawer = Object.assign({}, this.$store.getters.station.cashDrawer);
    this.printers = Object.keys(
      this.$store.getters.config.printers
    ).map(name => ({
      label: name,
      tooltip: "",
      plainText: true,
      value: name
    }));
  },
  methods: {
    save() {
      let value = this.cashDrawer;
      if (value.enable) {
        value.name =
          value.name ||
          "cashDrawer_" +
            Math.random()
              .toString(36)
              .substring(4, 6);
      }

      this.$socket.emit("[UPDATE] STATION", {
        _id: this.$store.getters.station._id,
        key: "cashDrawer",
        value
      });
      this.$router.push({ name: "Setting.station" });
    }
  }
};
</script>