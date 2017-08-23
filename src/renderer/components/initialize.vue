<template>
  <div>
  </div>
</template>

<script>
import Electron from 'electron'
import Vue from 'vue'
import MAC from 'getmac'
import serialport from 'serialport'
import { mapActions, mapGetters } from "vuex"

export default {
  created() {
    this.startTick();
    let language = navigator.language === "us-EN" ? "usEN" : "zhCN";
    document.documentElement.lang = language;
    moment.locale(language === 'usEN' ? 'en' : 'zh-cn');
    this.$setLanguage(language);
    this.setApp({
      date: today(),
      language,
      printer: true,
      database: true
    })
    Electron.ipcRenderer.send("Loading", this.$t('initial.findHost'));
  },
  data() {
    return {
      timeout: null
    }
  },
  sockets: {
    CONNECTED(text) {
      Electron.ipcRenderer.send("Loading", this.$t('initial.hostConnected'));
      this.$socket.emit("INITIALIZING");
      Electron.ipcRenderer.send("Loading", this.$t('initial.initialApplication'));
    },
    APPLICATION_CONFIG(data) {
      Electron.ipcRenderer.send("Loading", this.$t('initial.loadConfiguration'));
      this.setConfig(data.config[0]);
      this.setMenu(data.menu);
      this.setRequest(data.request);
      Electron.ipcRenderer.send("Loading", this.$t('initial.applyConfiguration'));
      this.setTable(data.table);
      this.setTemplates(data.template);
      this.setReservation(data.reservation);
      this.setTodayOrder({
        orders: data.orders,
        time: data.update.order
      });
      this.setLastSync(data.update);
      MAC.getMac((err, mac) => {
        if (err) {
          Electron.ipcRenderer.send("Loading", this.$t('initial.hardwareIssue'))
        } else {
          this.findStation(mac);
          this.initDevices();
          Electron.ipcRenderer.send("Initialized");
          this.$router.push('Login');
        }
      })
    }
  },
  methods: {
    initDevices() {
      if (this.station) {
        this.station.callid.enable && this.initCallerId(this.station.callid.port);
        this.station.pole.enable && this.initPoleDisplay(this.station.pole.port);
        this.station.scale.enable && this.initWeightScale(this.station.scale.port);
        this.station.terminal.enable && this.setDevice({ terminal: true });
      }
    },
    initCallerId(port) {
      this.setDevice({ callid: true });
      let telephone = new serialport(port, {
        autoOpen: false,
        parser: serialport.parsers.raw
      });
      //window.telephone = telephone;
      telephone.open(err => { err ? this.setDevice({ callid: false }) : telephone.write(this.station.callid.command + String.fromCharCode(13)) });
      telephone.on('data', (data) => {
        let raw = data.toString().split('\n');
        if (raw.length === 9 || raw.length === 6) {
          let name = raw.find(arr => arr.indexOf("NAME") !== -1);
          name = name.split("=")[1];
          let number = raw.find(arr => arr.indexOf("NMBR") !== -1);
          number = number.split("=")[1].replace(/\D/g, '').replace(/\+?1?(\d{3})\D?\D?(\d{3})\D?(\d{4})/, "$1$2$3");
          let time = +new Date();
          this.phoneRing({ name, number, time });
        } else if (raw.length === 3) {
          let type = raw[1].replace(/[^a-zA-Z ]/g, "");
          switch (type) {
            case "RING":
              clearTimeout(this.timeout);
              this.timeout = setTimeout(() => { this.phoneRing(null) }, 10000)
              break;
            case "ERROR":
              this.setDevice({ callid: false });
              break;
            case "OK":
              this.setDevice({ callid: true });
              break;
          }
        }
      });
    },
    initPoleDisplay(port) {
      this.setDevice({ poleDisplay: true })
      let poleDisplay = new serialport(port, { autoOpen: false });
      poleDisplay.open(err => {
        if (err) {
          console.log('Display Pole Not Install');
          this.setDevice({ poleDisplay: false })
        } else {
          poleDisplay.write('\f');
          poleDisplay.write(line("United POS", "[888] 299-0524"));
          window.poleDisplay = poleDisplay;
        }
      })
    },
    initWeightScale(port) {

    },
    ...mapActions([
      'setApp',
      'setMenu',
      'setTable',
      'phoneRing',
      'startTick',
      'setConfig',
      'setDevice',
      'setRequest',
      'findStation',
      'setLastSync',
      'setTemplates',
      'setTodayOrder',
      'setReservation'])
  },
  computed: {
    ...mapGetters(['station'])
  }
}
</script>

<style>

</style>
