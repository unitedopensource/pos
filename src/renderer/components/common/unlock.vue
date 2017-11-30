<template>
    <div class="popupMask center dark" @click.self="init.reject">
        <div class="accessor shadow">
            <h2>{{$t('text.enterPin')}}</h2>
            <div class="input">
                <span v-for="(circle,index) in pin" :key="index"></span>
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
                <div @click="reset">X</div>
                <div @click="setPin(0)">0</div>
                <div @click="access">√</div>
            </section>
        </div>
    </div>
</template>

<script>
export default {
  props: ["init"],
  data() {
    return {
      pin: []
    };
  },
  mounted() {
    window.addEventListener("keydown", this.entry, false);
  },
  beforeDestroy() {
    window.removeEventListener("keydown", this.entry, false);
  },
  methods: {
    setPin(num) {
      this.pin.push(num);
    },
    reset() {
      this.pin = [];
    },
    delPin() {
      this.pin.pop();
    },
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
            /^[a-z,A-z,0-9]$/.test(e.key) &&
            this.setPin(e.key);
      }
    },
    access() {
      this.$socket.emit("[ACCESS] CODE", this.pin.join(""), op => {
        op ? this.init.resolve(op) : this.init.reject();
      });
    }
  }
};
</script>