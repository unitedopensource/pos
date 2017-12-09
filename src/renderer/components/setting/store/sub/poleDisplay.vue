<template>
    <div>
        <header class="nav">
          <div class="back" @click="save">
              <i class="fa fa-chevron-left"></i>
          </div>
          <nav></nav>
        </header>
        <toggle title="setting.poleDisplay" v-model="poleDisplay.enable"></toggle>
        <text-list title="text.port" v-model="poleDisplay.port" :opts="ports"></text-list>
        <text-input title="text.firstLine" v-model="poleDisplay.top"></text-input>
        <text-input title="text.secondLine" v-model="poleDisplay.bot"></text-input>
        <toggle title="setting.animation" tooltip="tip.poleDisplayAnimation" v-model="poleDisplay.animation"></toggle>
      </div>
</template>

<script>
import toggle from "../../common/toggle";
import textList from "../../common/textList";
import textInput from "../../common/textInput";

export default {
  components: { toggle, textList, textInput },
  data() {
    return {
      poleDisplay: Object.assign({}, this.$store.getters.station.pole),
      ports: Array(10)
        .fill("COM")
        .map((p, i) => p + (i + 1))
        .map(port => ({
          label: command,
          tooltip: "",
          plainText: true,
          value: command
        }))
    };
  },
  methods: {
    save() {
      this.$socket.emit("[UPDATE] STATION", {
        _id: this.$store.getters.station._id,
        key: "pole",
        value: this.poleDisplay
      });
      this.$router.push({ name: "Setting.station" });
    }
  }
};
</script>