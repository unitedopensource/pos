<template>
    <div>
        <text-input title="text.alias" v-model="station.alias"></text-input>
        <text-input title="text.mac" v-model="station.mac" :disabled="true"></text-input>
        <text-input title="text.username" v-model="station.username" :disabled="true"></text-input>
        <toggle title="text.autoAwake" v-model="station.wol"></toggle>
        <external title="setting.cashDrawer">
            <div class="external" @click="editCashDrawer">
                <i class="fa fa-caret-right"></i>
            </div>
        </external>
        <external title="setting.terminal" tooltip="tip.terminal">
            <div class="external" @click="editTerminal">
                <i class="fa fa-caret-right"></i>
            </div>
        </external>
        <external title="setting.callerId">
            <div class="external" @click="editPole">
                <i class="fa fa-caret-right"></i>
            </div>
        </external>
        <external title="setting.poleDisplay" tooltip="tip.poleDisplay">
            <div class="external" @click="editPole">
                <i class="fa fa-caret-right"></i>
            </div>
        </external>
        <external title="setting.weightScale">
            <div class="external" @click="editScale">
                <i class="fa fa-caret-right"></i>
            </div>
        </external>
        <external title="setting.interface" tooltip="tip.interface">
            <div class="external" @click="editInterface">
                <i class="fa fa-caret-right"></i>
            </div>
        </external>
        <toggle title="setting.autoLock" tooltip="tip.autoLock" v-model="station.autoLock.enable">
          <transition name="dropdown">
                <div v-if="station.autoLock.enable" class="opt">
                    <range title="setting.timeout" :min="0" :max="600" :step="30" v-model.number="station.autoLock.timeout"></range>
                    <switches title="text.doneLock" v-model="station.autoLock.done"></switches>
                </div>
            </transition>
        </toggle>
    </div>
</template>

<script>
import range from "../common/range";
import toggle from "../common/toggle";
import external from "../common/external";
import switches from "../common/switches";
import textInput from "../common/textInput";
export default {
  components: { range, toggle, textInput, external, switches },
  data() {
    return {
      station: null
    };
  },
  created() {
    this.station = Object.assign({}, this.$store.getters.station);
  },
  methods: {
    editCashDrawer() {},
    editTerminal() {},
    editPole() {},
    editScale() {},
    editInterface() {}
  }
};
</script>