<template>
    <div class="popupMask center">
        <div class="station">
            <header>
                <h5>New Station</h5>
                <h3>Station Configuration</h3>
            </header>
            <div class="wrap">
                
            </div>
            <footer>
                <button class="btn" @click="confirm">{{$t('button.done')}}</button>
            </footer>
        </div>
    </div>
</template>

<script>
import preset from "../preset";
import Electron from "electron";
export default {
  props: ["reg"],
  data() {
    return {
      station: null
    };
  },
  created() {
    let { mac, username } = this.reg;
    this.station = preset.station(mac, username);
  },
  methods: {
    confirm() {
      this.$socket.emit("[STATION] ATTACHED", this.station, () => {
        Electron.ipcRenderer.send("Relaunch");
      });
    }
  }
};
</script>

<style scoped>
.station {
  background: #fff;
  box-shadow: var(--shadow);
}
footer {
  background: #eee;
  display: flex;
  border-top: 1px solid #ddd;
}
</style>