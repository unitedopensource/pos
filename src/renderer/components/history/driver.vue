<template>
  <div class="popupMask center dark" @click.self="exit()">
    <div class="driver window">
      <header class="title">
        <span>#{{init.ticket}} {{$t('title.setDriver')}}</span>
      </header>
      <div class="inner">
        <div v-for="(letter,index) in letters" :key="letter" @click="setDriver(letter,$event)" :class="letter">{{letter}}</div>
      </div>
      <footer>
        <div class="f1">
          <div class="btn" @click="clear">{{$t("button.clear")}}</div>
        </div>
        <div class="btn">{{$t('button.setTip')}}</div>
        <div class="btn" @click="confirm">{{$t("button.confirm")}}</div>
      </footer>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
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
      delete this.order.driver;
      this.letter = null;
      this.$socket.emit("[UPDATE] INVOICE", this.order);
      this.init.resolve();
    },
    exit() {
      this.init.reject();
    },
    confirm() {
      if (this.letter) {
        this.setOrder({ driver: this.letter });
        this.$socket.emit("[UPDATE] INVOICE", this.order);
      }
      this.init.resolve();
    },
    ...mapActions(['setOrder'])
  },
  computed: {
    ...mapGetters(['order'])
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
