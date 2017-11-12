<template></template>

<script>
import { mapActions, mapGetters } from "vuex";
import { ipcRenderer } from "electron";
import serialport from "serialport";
import Print from "../printer";
import wol from "wake_on_lan";
import MAC from "getmac";

export default {
  data() {
    return {
      timeout: null
    };
  },
  created() {
    this.startTick();
    let language = navigator.language === "zh-CN" ? "zhCN" : "usEN";
    document.documentElement.lang = language;
    moment.locale(language === "usEN" ? "en" : "zh-cn");
    this.$setLanguage(language);
    this.setApp({
      date: today(),
      language,
      printer: true,
      database: true
    });
    this.setDevice({ online: navigator.onLine });
    ipcRenderer.send("Loading", this.$t("initial.findHost"));
  },
  sockets: {
    CONNECTED(text) {
      ipcRenderer.send("Loading", this.$t("initial.hostConnected"));
      this.$socket.emit("[INITIAL] POS");
      ipcRenderer.send("Loading", this.$t("initial.initialApplication"));
    },
    APP_RUNTIME_ENVIRONMENT(data) {
      let {
        config,
        menu,
        submenu,
        request,
        orders,
        table,
        template,
        reservations,
        sync
      } = data;
      ipcRenderer.send("Loading", this.$t("initial.loadConfiguration"));
      this.setConfig(config);
      this.setMenu(menu);
      this.setSubmenu(submenu);
      this.setRequest(request);
      ipcRenderer.send("Loading", this.$t("initial.applyConfiguration"));
      this.setTable(table);
      this.setTemplates(template);
      this.setReservation({ reservations, sync });
      this.setTodayOrder({ orders, sync });
      this.setLastSync(sync);
      window.server && this.checkAwake(config.store.station);
      MAC.getMac((err, mac) => {
        if (err) {
          ipcRenderer.send("Loading", this.$t("initial.hardwareIssue"));
        } else {
          this.findStation(mac);
          this.initDevices();
          this.initPrinter();

          this.station &&
            this.$socket.emit("[SYS] CONNECT", {
              alias: this.station.alies,
              mac: this.station.mac
            });

          ipcRenderer.send("Initialized");
          this.$router.push("Login");
        }
      });
    }
  },
  methods: {
    initDevices() {
      if (this.station) {
        this.station.callid.enable &&
          this.initCallerId(this.station.callid.port);
        this.station.pole.enable &&
          this.initPoleDisplay(this.station.pole.port);
        this.station.scale.enable &&
          this.initWeightScale(this.station.scale.port);
        this.station.terminal.enable && this.setDevice({ terminal: true });
      }
    },
    initCallerId(port) {
      this.setDevice({ callid: true });

      let telephone = new serialport(port, {
        autoOpen: false,
        parser: serialport.parsers.raw
      });

      telephone.open(err => {
        err
          ? this.setDevice({ callid: false })
          : telephone.write(
              this.station.callid.command + String.fromCharCode(13)
            );
      });

      telephone.on("data", data => {
        let raw = data.toString().split("\n");
        if (raw.length === 9 || raw.length === 6) {
          let name = raw.find(arr => arr.indexOf("NAME") !== -1);
          name = name.split("=")[1];
          let number = raw.find(arr => arr.indexOf("NMBR") !== -1);
          number = number
            .split("=")[1]
            .replace(/\D/g, "")
            .replace(/\+?1?(\d{3})\D?\D?(\d{3})\D?(\d{4})/, "$1$2$3");
          let time = +new Date();
          this.phoneRing({ name, number, time });
        } else if (raw.length === 3) {
          let type = raw[1].replace(/[^a-zA-Z ]/g, "");
          switch (type) {
            case "RING":
              clearTimeout(this.timeout);
              this.timeout = setTimeout(() => {
                this.phoneRing(null);
              }, 12000);
              break;
            case "ERROR":
              this.setDevice({ callid: false });
              break;
            case "OK":
              this.setDevice({ callid: true });
              break;
            default:
              this.setDevice({ callid: false });
          }
        }
      });
    },
    initPoleDisplay(port) {
      let poleDisplay = new serialport(port, { autoOpen: false });

      this.setDevice({ poleDisplay: true });

      poleDisplay.open(err => {
        if (err) {
          console.log("Display Pole Not Install");
          this.setDevice({ poleDisplay: false });
        } else {
          poleDisplay.write("\f");
          poleDisplay.write(line("United POS", "[888] 299-0524"));
          window.poleDisplay = poleDisplay;
        }
      });
    },
    initWeightScale(port) {
      // const SerialPort = require('serialport');
      // const Delimiter = SerialPort.parsers.Delimiter;
      // const port = new SerialPort('/dev/tty-usbserial1');
      // const parser = port.pipe(new Delimiter({ delimiter: Buffer.from('EOL') }));
      // parser.on('data', console.log);
    },
    initPrinter() {
      let config = this.config;
      CLODOP
        ? (window.Printer = new Print(CLODOP, config))
        : setTimeout(
            function() {
              window.Printer = new Print(CLODOP, config);
            },
            20000,
            CLODOP,
            config
          );
    },
    checkAwake(stations) {
      ipcRenderer.send("Loading", this.$t("initial.awakeClients"));
      Object.keys(stations).forEach(name => {
        stations[name].wol && wol.wake(stations[name].mac);
      });
    },
    ...mapActions([
      "setApp",
      "setMenu",
      "setTable",
      "phoneRing",
      "startTick",
      "setConfig",
      "setDevice",
      "setSubmenu",
      "setRequest",
      "findStation",
      "setLastSync",
      "setTemplates",
      "setTodayOrder",
      "setReservation"
    ])
  },
  computed: {
    ...mapGetters(["config", "station"])
  }
};
</script>
