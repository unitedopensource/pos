<template>
  <div class="popupMask center dark" @click.self="init.reject(false)">
    <div class="driver window">
      <header class="title">
        <span>#{{init.ticket}} {{text('SET_DRIVER')}}</span>
        <i class="fa fa-close" @click="init.reject"></i>
      </header>
      <div class="inner">
        <div v-for="(letter,index) in letters" :key="letter" @click="setDriver(letter,$event)" :class="letter">{{letter}}</div>
      </div>
      <footer>
        <div class="f1">
          <div class="btn" @click="clear">{{text("CLEAR")}}</div>
        </div>
        <div class="btn">{{text('SET_TIP')}}</div>
        <div class="btn" @click="confirm">{{text("CONFIRM")}}</div>
      </footer>
    </div>
  </div>
</template>

<script>
export default {
  props: ['init'],
  mounted() {
    if (this.init.driver) {
      document.querySelector('.' + this.init.driver).classList.add("active");
      this.letter = this.init.driver;
    }
  },
  data() {
    return {
      letters: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'],
      letter: null
    }
  },
  methods: {
    setDriver(letter, e) {
      let dom = document.querySelector(".driver .active");
      dom && dom.classList.remove("active");
      e.currentTarget.classList.add("active");
      this.letter = letter;
    },
    clear() {
      this.init.reject(true);
    },
    confirm() {
      this.init.resolve(this.letter);
    }
  }
}
</script>

<style scoped>
.window {
  width: 602px;
}

.inner {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  font-weight: bold;
}

.btn {
  margin: 5px;
}

.inner div {
  width: 30px;
  text-align: center;
  padding: 22px;
  margin: 5px;
  background: #fff;
  border: 1px solid #ddd;
}

div.active {
  background: #009688;
  color: #f5f5f5;
}
</style>
