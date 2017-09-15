<template>
  <transition name="fade" appear>
    <div class="container">
      <div class="accessor shadow">
        <h2>{{store.name}}</h2>
        <div class="input">
          <span v-for="(circle,index) in password" :key="index"></span>
        </div>
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
      <div :is="component" :init="componentData"></div>
    </div>
  </transition>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import dialoger from './common/dialoger'
import _debounce from 'lodash.debounce'
import { ipcRenderer } from 'electron'
export default {
  components: { dialoger },
  data() {
    return {
      host: false,
      reset: false,
      component: null,
      componentData: null,
      toggleMenu: false,
    }
  },
  created() {
    //let argv = remote.process.argv.slice(1);
    //this.host = argv.indexOf('-server') !== -1;
    this.host = window.server === true;
  },
  mounted() {
    window.addEventListener("keydown", this.input, false);
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
          /^[a-z,A-z,0-9]$/.test(e.key) && this.setPin(e.key);
      }
    },
    login() {
      this.reset = true;
      this.$socket.emit("INQUIRY_LOGIN", this.password.join(''));
    },
    autoLogin: _debounce(function() {
      if (this.$route.name === 'Login') {
        this.login();
        this.reset = false;
      }
    }, 500),
    massiveShutdown() {
      this.$dialog({
        type: 'question',
        title: 'dialog.massiveShutdownConfirm',
        msg: 'dialog.massiveShutdownConfirmTip'
      }).then(() => {
        this.$socket.emit("[CTRL] MASSIVE_SHUTDOWN");
        this.$q()
      }).catch(() => { this.$q() })
    },
    shutdown() {
      ipcRenderer.send("Shutdown");
    },
    restart() {
      ipcRenderer.send("Relaunch");
    },
    exit() {
      //add flow control on next patch
      //Promise.all([this.checkTerminal(),this.checkSettlement()]).then()
      ipcRenderer.send("Exit");
    },
    checkTerminal() {

    },
    checkSettlement() {

    },
    ...mapActions(['setPin', 'delPin', 'setOp', 'setApp'])
  },
  beforeDestroy() {
    window.removeEventListener("keydown", this.input, false);
  },
  sockets: {
    LOGIN_AUTH(result) {
      if (result.auth) {
        document.querySelector(".ctrl").classList.add("hide");
        let language = result.op.language || "usEN";
        moment.locale(language === 'usEN' ? 'en' : 'zh-cn');
        this.$setLanguage(language);
        this.setApp({ language, mode: 'create' });
        this.setOp(result.op);
        this.setPin();
        this.$router.push({ path: '/main' });
      } else {
        this.reset && this.setPin()
      }
    },
    SHUTDOWN() {
      ipcRenderer.send("Shutdown")
    }
  },
  watch: {
    password(n) {
      this.autoLogin();
    }
  },
  computed: {
    ...mapGetters(['store', 'password', 'station'])
  }
}
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
  background: #E0E0E0;
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
  content: ' ';
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
  content: ' ';
  height: 1px;
  background: -webkit-gradient(linear, 0 0, 100% 0, from(white), to(white), color-stop(50%, #03A9F4));
}

.ctrl li i {
  width: 30px;
}
</style>
