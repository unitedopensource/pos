<template>
    <div class="popupMask center">
        <div class="station">
            <header>
                <h5>New Station</h5>
                <h3>Station Setup</h3>
            </header>
            <div class="wrap">
                <div class="inner">
                  <input type="text" v-model="station.alias" placeholder="Enter name for this station">
                </div>
                <p>Copyright © 2017 United POS Inc.</p>
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
  width: 600px;
  border-radius: 4px;
  box-shadow: var(--shadow);
}

header {
  padding: 10px 20px;
  border-bottom: 1px solid #eee;
}

.inner {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 150px;
}

input {
  border: 2px solid #ddd;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 4px;
  font-size: 20px;
  padding: 5px;
  outline: none;
}

p {
  text-align: center;
}

footer {
  background: #eee;
  display: flex;
  border-top: 1px solid #ddd;
}
</style>