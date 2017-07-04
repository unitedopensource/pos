<template>
  <transition name="fade" appear>
    <div class="container">
      <div class="login shadow">
        <h2>{{store.name}}</h2>
        <div class="input">
          <span v-for="circle in password"></span>
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
          <div @click.ctrl="setPin('@')" @click="setPin(0)">0</div>
          <div @click="login">√</div>
        </section>
      </div>
      <div @click="shutdown" class="shutdown">
        <i class="fa fa fa-times-circle"></i>
        {{text('SHUTDOWN')}}
      </div>
    </div>
  </transition>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import _debounce from 'lodash.debounce'
import Electron from 'electron'
import moment from 'moment'
export default {
  data() {
    return {
      component: null,
      componentData: null,
      reset: false
    }
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
          /^\d+$/.test(e.key) && this.setPin(e.key);
      }
    },
    login() {
      this.reset = true;
      this.$socket.emit("INQUIRY_LOGIN", ~~this.password.join(''));
    },
    autoLogin: _debounce(function () {
      if (this.$route.name === 'Login') {
        this.login();
        this.reset = false;
      }
    }, 500),
    shutdown() {
      Electron.ipcRenderer.send("SHUTDOWN");
    },
    ...mapActions(['setPin', 'delPin', 'setOp', 'setApplication'])
  },
  beforeDestroy() {
    window.removeEventListener("keydown", this.input, false);
  },
  sockets: {
    LOGIN_AUTH(result) {
      if (result.auth) {
        document.querySelector(".shutdown").classList.add("hide");
        let language = result.op[0].language || "usEN";
        moment.locale(language === 'usEN' ? 'en' : 'zh-cn');
        this.$setLanguage(language);
        this.setApplication({ language });
        if (this.station && this.station.timeout) {
          this.setApplication({
            autoLogout: true,
            opLastAction: new Date
          })
        }
        this.setOp(result.op[0]);
        this.setPin();
        this.$router.push({ path: '/main' });
      } else {
        this.reset && this.setPin();
      }
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
.fade-enter-active,
.fade-leave-active {
  opacity: 1;
  transition: opacity .5s;
  transition-delay: 0.3s;
}

.fade-enter,
.fade-leave {
  opacity: 0;
}

.login {
  width: 337px;
  background-color: #f9f9f9;
  border-radius: 4px;
  color: rgba(0, 0, 0, 0.87);
  text-align: center;
  padding: 10px 9px 4px;
}

.input {
  background: lightgray;
  text-align: center;
  color: #fff;
  width: 275px;
  height: 32px;
  padding: 5px 0;
  margin: auto;
  box-shadow: inset 0px 0px 6px rgba(105, 81, 81, 0.285);
}

.input span {
  display: inline-block;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0px 1px 3px rgba(0, 0, 0, 0.3);
  margin-right: 5px;
}

h2 {
  padding: 20px 10px;
}

section {
  margin-top: 15px;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
}

section div:nth-child(3n+3) {
  margin-right: 0;
}

.shutdown {
  position: fixed;
  bottom: 35px;
  right: 35px;
  text-align: center;
  background: #fff;
  color: #274a5a;
  padding: 10px 15px;
  border-radius: 24px;
  cursor: pointer;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.75);
}

.shutdown.hide {
  display: none;
}
</style>
