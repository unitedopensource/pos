<template></template>

<script>
import { mapActions, mapGetters } from "vuex";
import { ipcRenderer } from "electron";
import serialport from "serialport";
import Print from "../printer";
import Magic from "wake_on_lan";
import Mac from "getmac";
import os from "os";

export default {
  data() {
    return {
      timeout: null
    };
  },
  created() {
    this.startTick();
    this.initialEnvironment();
  },
  methods: {
    initialEnvironment() {
      let language = navigator.language === "zh-CN" ? "zhCN" : "usEN";
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
    setEnvironment(data) {
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
      this.setStationEnvironment()
        .then(this.initialized)
        .catch(this.registration);
    },
    setStationEnvironment() {
      return new Promise((use, register) => {
        Mac.getMac((err, mac) => {
          if (err) {
            ipcRenderer.send("Loading", this.$t("initial.hardwareIssue"));
          } else {
            let { username } = os.userInfo();

            this.$socket.emit(
              "[INITIAL] STATION",
              { mac, username },
              station => {
                station ? use(station) : register({ mac, username });
              }
            );
          }
        });
      });
    },
    initialized(data) {
      this.setStation(data);
      this.awakeStation();
      this.initialDevice();
      this.initialPrinter();

      let { alias, mac } = data;
      this.$socket.emit("[STATION] CONNECTED", { alias, mac });
      ipcRenderer.send("Initialized");
      this.$router.push("Login");
    },
    registration(data) {
      ipcRenderer.send("Initialized");
      this.$router.push({ name: "Station", params: { reg: data } });
    },
    awakeStation() {
      if (window.isServer) {
        ipcRenderer.send("Loading", this.$t("initial.awakeClients"));
        this.$socket.emit("[AWAKEN] STATIONS", data => {
          data && data.foreach(station => Magic.wake(station));
        });
      }
    },
    initialDevice() {
      this.station.callid.enable && this.initCallerId(this.station.callid);
      this.station.pole.enable && this.initPoleDisplay(this.station.pole.port);
      this.station.scale.enable && this.initScale(this.station.scale.port);
      this.station.terminal.enable && this.setDevice({ terminal: true });
    },
    initCallerId(opt) {
      let { command, port } = opt;
      this.setDevice({ callid: true });

      let telephone = new serialport(port, {
        autoOpen: false,
        parser: serialport.parsers.raw
      });

      telephone.open(err => {
        err
          ? this.setDevice({ callid: false })
          : telephone.write(command + "\r");
      });

      telephone.on("data", data => {
        let raw = data.toString().split("\n");
        switch (raw.length) {
          case 3:
            let type = raw[1].replace(/[^a-zA-Z ]/g, "");
            switch (type) {
              case "RING":
                clearTimeout(this.timeout);
                this.timeout = setTimeout(() => {
                  this.phoneRing(null);
                }, 1.2e4);
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
            break;
          case 6:
          case 9:
            let name = raw.find(i => i.indexOf("NAME") !== -1).split("=")[1];
            let number = raw
              .find(i => i.indexOf("NMBR") !== -1)
              .split("=")[1]
              .replace(/\D/g, "");
            let time = +new Date();
            this.phoneRing({ name, number, time });
            break;
        }
      });
    },
    initPoleDisplay() {
      let poleDisplay = new serialport(port, { autoOpen: false });
      poleDisplay.open(err => {
        if (err) {
          this.setDevice({ poleDisplay: false });
        } else {
          poleDisplay.write("\f");
          poleDisplay.write(line("United POS", "[888] 299-0524"));
          this.setDevice({ poleDisplay: true });
          window.poleDisplay = poleDisplay;
        }
      });
    },
    initScale(port) {},
    initialPrinter() {
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
    ...mapActions([
      "setApp",
      "setMenu",
      "setTable",
      "phoneRing",
      "startTick",
      "setConfig",
      "setDevice",
      "setSubmenu",
      "setStation",
      "setRequest",
      "setLastSync",
      "setTemplates",
      "setTodayOrder",
      "setReservation"
    ])
  },
  sockets: {
    CONNECTED() {
      ipcRenderer.send("Loading", this.$t("initial.hostConnected"));
      this.$socket.emit("[INITIAL] POS");
      ipcRenderer.send("Loading", this.$t("initial.initialApplication"));
    },
    APP_RUNTIME_CONFIG(data) {
      ipcRenderer.send("Loading", this.$t("initial.loadConfiguration"));
      this.setEnvironment(data);
    }
  },
  computed: {
    ...mapGetters(["config", "station"])
  }
};
</script>