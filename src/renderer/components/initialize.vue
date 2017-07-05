<template>
  <div></div>
</template>

<script>
import Electron from 'electron'
import Vue from 'vue'
import moment from 'moment'
import MAC from 'getmac'
import { mapActions } from "vuex"

export default {
  created() {
    this.startTick();
    let language = navigator.language === "us-EN" ? "usEN" : "zhCN";
    document.documentElement.lang = language;
    moment.locale(language === 'usEN' ? 'en' : 'zh-cn');
    this.$setLanguage(language);
    this.setApplication({
      date: moment().subtract('4', 'hours').format("YYYY-MM-DD"),
      language,
      printer: true,
      database: true
    })
    Electron.ipcRenderer.send("Loading", "Looking for host...");
  },
  sockets: {
    CONNECTED(text) {
      Electron.ipcRenderer.send("Loading", "Host server connected.");
      this.$socket.emit("INITIALIZING");
      Electron.ipcRenderer.send("Loading", "Initializing application...");
    },
    APPLICATION_CONFIG(data) {
      Electron.ipcRenderer.send("Loading", "Loading configuration...");
      this.setConfig(data.config[0]);
      this.setMenu(data.menu);
      this.setRequest(data.request);
      Electron.ipcRenderer.send("Loading", "Setting environment...");
      this.setTable(data.table);
      this.setReservation(data.reservation);
      this.regTemplates(data.template);
      this.setTodayOrderHistory({
        orders: data.orders,
        time: data.update.order
      });
      this.setUpdate(data.update);
      MAC.getMac((err, mac) => {
        if (err) {
          Electron.ipcRenderer.send("Loading", "An unknown network issue occurred...");
          setTimeout(() => {
            Electron.ipcRenderer.send("Initialized");
            this.$router.push('Login');
          }, 5000)
        } else {
          this.regStation(mac);
          Electron.ipcRenderer.send("Initialized");
          this.$router.push('Login');
        }
      });
    }
  },
  methods: {
    ...mapActions(['setConfig',
      'regStation',
      'setMenu',
      'setTable',
      'setRequest',
      'setApplication',
      'setReservation',
      'regTemplates',
      'startTick',
      'setUpdate',
      'setTodayOrderHistory'])
  }
}
</script>

<style>

</style>
