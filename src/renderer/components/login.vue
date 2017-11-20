<template>
  <transition name="fade" appear>
    <div class="container">
      <div class="accessor shadow">
        <h2>{{store.name}}</h2>
        <transition-group tag="div" class="input" name="pin">
          <span v-for="(circle,index) in password" :key="index"></span>
        </transition-group>
        <section class="numpad">
          <div @click="setPin(7)">7</div>
          <div @click="setPin(8)">8</div>
          <div @click="setPin(9)">9</div>
          <div @click="setPin(4)">4</div>
          <div @click="setPin(5)">5</div>
          <div @click="setPin(6)">6</div>
          <div @click="setPin(1)">1</div>
          <div @click="setPin(2)">2</div>
          <div @click="setPin(3)">3</div>
          <div @click="setPin()">X</div>
          <div @click="setPin(0)">0</div>
          <div @click="login">√</div>
        </section>
      </div>
      <div class="ctrl">
        <input type="checkbox" v-model="toggleMenu" id="menu">
        <label for="menu">
          <i class="fa fa-bars"></i>
        </label>
        <transition name="menu">
          <ul v-show="toggleMenu">
            <li @click="massiveShutdown" v-if="host">
              <i class="fa fa-plug"></i>
              <span>{{$t('login.massiveShutdown')}}</span>
            </li>
            <li @click="shutdown">
              <i class="fa fa-desktop"></i>
              <span>{{$t('login.shutdown')}}</span>
            </li>
            <li @click="restart">
              <i class="fa fa-retweet"></i>
              <span>{{$t('login.restart')}}</span>
            </li>
            <li @click="exit">
              <i class="fa fa-window-close-o"></i>
              <span>{{$t('login.exit')}}</span>
            </li>
          </ul>
        </transition>
      </div>
      <div id="drag"></div>
      <div :is="component" :init="componentData"></div>
    </div>
  </transition>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import dialoger from "./common/dialoger";
import _debounce from "lodash.debounce";
import Electron from "electron";
import vsc from "semver";
export default {
  components: { dialoger },
  data() {
    return {
      host: false,
      reset: false,
      component: null,
      componentData: null,
      toggleMenu: false
    };
  },
  created() {
    this.host = window.server === true;
  },
  mounted() {
    window.addEventListener("keydown", this.input, false);
    this.checkVersionCompatible();
  },
  methods: {
    input(e) {
      e.preventDefault();
      switch (e.key) {
        case "Enter":
          this.login();
          break;
        case "Backspace":
          this.delPin();
          break;
        default:
          e.key.length === 1 &&
            /[a-zA-Z0-9]/i.test(e.key) &&
            this.setPin(e.key);
      }
    },
    login() {
      this.reset = true;
      this.$socket.emit("INQUIRY_LOGIN", this.password.join(""));
    },
    autoLogin: _debounce(function() {
      if (this.$route.name === "Login") {
        this.login();
        this.reset = false;
      }
    }, 500),
    massiveShutdown() {
      this.$dialog({
        type: "question",
        title: "dialog.massiveShutdownConfirm",
        msg: "dialog.massiveShutdownConfirmTip"
      })
        .then(() => {
          this.$socket.emit("[CTRL] MASSIVE_SHUTDOWN");
          this.$q();
        })
        .catch(() => {
          this.$q();
        });
    },
    shutdown() {
      Electron.ipcRenderer.send("Shutdown");
    },
    restart() {
      Electron.ipcRenderer.send("Relaunch");
    },
    exit() {
      Electron.ipcRenderer.send("Exit");
    },
    checkVersionCompatible() {
      this.$socket.emit("[SYS] GET_VERSION", requireVersion => {
        let appVersion = Electron.remote.app.getVersion();
        let result = vsc.satisfies(appVersion, requireVersion);

        if (!result && process.env.NODE_ENV !== "development") {
          this.$dialog({
            type: "warning",
            title: "dialog.updateNeeded",
            msg: [
              "dialog.versionRequirement",
              vsc.clean(requireVersion,true),
              appVersion
            ],
            buttons: [{ text: "button.confirm", fn: "resolve" }]
          }).then(() => {
            this.$q();
          });
        }
      });
    },
    checkTerminal() {},
    checkSettlement() {},
    ...mapActions(["setPin", "delPin", "setOp", "setApp"])
  },
  beforeDestroy() {
    window.removeEventListener("keydown", this.input, false);
  },
  sockets: {
    LOGIN_AUTH(result) {
      if (result.auth) {
        document.querySelector(".ctrl").classList.add("hide");
        let language = result.op.language || "usEN";
        moment.locale(language === "usEN" ? "en" : "zh-cn");
        this.$setLanguage(language);
        this.setApp({ language, mode: "create" });
        this.setOp(result.op);
        this.setPin();
        this.$router.push({ path: "/main" });
        this.$socket.emit("[SYNC] POS", sync => {
          if (this.sync !== sync) {
            this.$socket.emit("[SYNC] ORDER_LIST");
            this.$socket.emit("[SYNC] TABLE_LIST");
          }
        });
      } else {
        this.reset && this.setPin();
      }
    },
    SHUTDOWN() {
      Electron.ipcRenderer.send("Shutdown");
    }
  },
  watch: {
    password(n) {
      this.autoLogin();
    }
  },
  computed: {
    ...mapGetters(["sync", "store", "password", "station"])
  }
};
</script>

<style scoped>
.ctrl {
  position: fixed;
  bottom: 35px;
  right: 55px;
  text-align: center;
  min-width: 60px;
}

.ctrl label {
  background: #fff;
  color: #274a5a;
  padding: 10px 15px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.1s ease;
  box-shadow: 0 2px 3px rgba(0, 0, 0, 0.75);
}

.ctrl label:active {
  background: #e0e0e0;
}

.ctrl.hide,
.ctrl input {
  display: none;
}

.ctrl ul {
  position: absolute;
  bottom: 42px;
  left: -33px;
  background: #fff;
  padding: 0px 10px;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.4);
  border-radius: 6px;
}

.ctrl ul:after {
  content: " ";
  position: absolute;
  left: 52px;
  bottom: -9px;
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 10px 10px 0 10px;
  border-color: #fff transparent transparent transparent;
}

.ctrl li {
  display: flex;
  min-width: 100px;
  padding: 15px 0;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  position: relative;
}

.ctrl li:last-child {
  border: none;
}

.ctrl li:after {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  content: " ";
  height: 1px;
  background: -webkit-gradient(
    linear,
    0 0,
    100% 0,
    from(white),
    to(white),
    color-stop(50%, #03a9f4)
  );
}

.ctrl li i {
  width: 30px;
}

#drag {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 50px;
  height: 50px;
  -webkit-app-region: drag;
}
</style>
