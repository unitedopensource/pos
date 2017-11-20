<template>
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
        <div @click="access">√</div>
      </section>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import _debounce from "lodash.debounce";
export default {
  data() {
    return {
      reset: false
    };
  },
  mounted() {
    window.addEventListener("keydown", this.input, false);
  },
  methods: {
    input(e) {
      e.preventDefault();
      switch (e.key) {
        case "Enter":
          this.access();
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
    access() {
      this.reset = true;
      this.$socket.emit("[ACCESS] PIN", this.password.join(""));
    },
    autoAccess: _debounce(function() {
      if (this.$route.name === "Lock") {
        this.access();
        this.reset = false;
      }
    }, 300),
    ...mapActions(["setPin", "delPin", "setOp", "setApp"])
  },
  beforeDestroy() {
    window.removeEventListener("keydown", this.input, false);
  },
  sockets: {
    AUTHORIZATION(data) {
      let { auth, op } = data;
      if (auth) {
        let language = op.language || "usEN";
        moment.locale(language === "usEN" ? "en" : "zh-cn");
        this.$setLanguage(language);
        this.setApp({ language, mode: "create" });
        this.setOp(op);
        this.setPin();
        this.$router.push({ path: "/main" });
      } else {
        this.reset && this.setPin();
      }
    }
  },
  watch: {
    password(n) {
      this.autoAccess();
    }
  },
  computed: {
    ...mapGetters(["store", "password", "station"])
  }
};
</script>