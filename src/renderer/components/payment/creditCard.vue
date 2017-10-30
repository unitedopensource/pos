<template>
    <div class="creditCard">
        <i class="fa loader" :class="[icon]"></i>
        <h3>{{msg}}</h3>
        <h5>{{tip}}</h5>
        <footer>
            <button class="btn" @click="exit" :disabled="!cancelable">{{$t('button.cancelAction')}}</button>
        </footer>
    </div>
</template>

<script>
import { mapGetters } from "vuex";
export default {
  props: ["init"],
  data() {
    return {
      msg: "",
      tip: "",
      config: null,
      icon: "info",
      timeout: null,
      transacting: null,
      terminal: null,
      device: null,
      url: null,
      cancelable: false
    };
  },
  created() {
    this.station.terminal.enable
      ? this.initTerminal()
      : this.init.reject({
          type: "info",
          title: "terminal.paymentFailed",
          msg: "terminal.paymentFailedTip",
          buttons: [
            { text: "button.cancel", fn: "reject" },
            { text: "button.markAsPaid", fn: "resolve" }
          ]
        });
  },
  methods: {
    initTerminal() {
      let terminal = this.station.terminal;
      this.msg = this.$t("terminal.initial", terminal.model);
      this.terminal = this.getFile(terminal.model);
      this.terminal
        .initial(
          terminal.address,
          terminal.port,
          terminal.sn,
          this.station.alies
        )
        .then(r => r.text())
        .then(device => {
          this.device = this.terminal.check(device);
          if (this.device.code !== "000000") {
            this.terminalError(
              this.$t(
                "terminal.initialFailed",
                this.device.model || terminal.model,
                this.device.code
              ),
              this.device.msg
            );
            return;
          }
          clearTimeout(this.timeout);
          setTimeout(() => {
            let { creditCard } = this.init.card;
            this.msg =
              creditCard.number && creditCard.date
                ? this.$t(
                    "terminal.transacting",
                    this.device.model || terminal.model
                  )
                : this.$t(
                    "terminal.ready",
                    this.device.model || terminal.model
                  );
          }, 2000);

          let url = this.terminal.charge(this.init.card);

          this.transacting = new XMLHttpRequest();
          this.transacting.open("GET", url, true);
          this.transacting.send(null);
          this.transacting.onload = () => {
            if (this.transacting.readyState === this.transacting.DONE) {
              if (this.transacting.status === 200) {
                let result = this.terminal.explainTransaction(
                  this.transacting.responseText
                );
                result.code === "000000"
                  ? this.init.resolve(result)
                  : this.terminalError(this.$t(result.msg));
              }
            }
          };
        });
      this.timeout = setTimeout(() => {
        this.init.reject({
          type: "warning",
          title: "terminal.timeout",
          msg: ["terminal.timeoutTip", terminal.address],
          buttons: [{ text: "button.confirm", fn: "resolve" }]
        });
      }, 10000);
    },
    terminalError(msg, tip) {
      this.icon = "error";
      this.msg = msg;
      this.tip = tip;
      setTimeout(() => {
        this.init.reject(false);
      }, 2500);
    },
    getFile(device) {
      switch (device) {
        case "SP30":
        case "S80":
        case "S300":
          return require("./parser/pax.js");
        case "NX2200":
          return require("./parser/exadigm.js");
        default:
          return require("./parser/pax.js");
      }
    },
    exit() {
      if (this.transacting) {
        this.msg = this.$t("terminal.aborting");
        this.transacting.abort();
        setTimeout(() => {
          this.terminal.abort();
          this.init.reject(false);
        }, 5000);
      } else {
        this.init.reject(false);
      }
    }
  },
  computed: {
    ...mapGetters(["station"])
  }
};
</script>

<style scoped>
.creditCard {
  background: #eff3f6;
  width: 400px;
  min-height: 170px;
  border-radius: 4px;
  text-align: center;
  color: #3c3c3c;
  box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14),
    0 3px 1px -2px rgba(0, 0, 0, 0.12), 0 1px 5px 0 rgba(0, 0, 0, 0.2);
}

h5 {
  color: #ff5722;
  margin-top: 10px;
}

i {
  font-size: 6em;
  text-shadow: 0 1px 1px rgba(0, 0, 0, 0.3);
  margin: 15px 0;
}

footer {
  background: #eee;
  margin-top: 15px;
}

.btn {
  margin: 10px;
  width: 90%;
}
</style>
