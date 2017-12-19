<template>
  <div class="container">
    <div class="accessor shadow">
      <h2>{{store.name}}</h2>
        <transition-group tag="div" class="input" name="pin">
          <span v-for="(circle,index) in password" :key="index"></span>
        </transition-group>
      <section class="numpad">
        <div @click="setPin(7)" class="numKey">7</div>
        <div @click="setPin(8)" class="numKey">8</div>
        <div @click="setPin(9)" class="numKey">9</div>
        <div @click="setPin(4)" class="numKey">4</div>
        <div @click="setPin(5)" class="numKey">5</div>
        <div @click="setPin(6)" class="numKey">6</div>
        <div @click="setPin(1)" class="numKey">1</div>
        <div @click="setPin(2)" class="numKey">2</div>
        <div @click="setPin(3)" class="numKey">3</div>
        <div @click="setPin()" class="numKey">X</div>
        <div @click="setPin(0)" class="numKey">0</div>
        <div @click="access" class="numKey">√</div>
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
    window.addEventListener("keydown", this.entry, false);
  },
  beforeDestroy() {
    window.removeEventListener("keydown", this.entry, false);
  },
  methods: {
    entry(e) {
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