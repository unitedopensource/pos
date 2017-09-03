<template>
  <div class="popupMask center dark" @click.self="init.reject">
    <div class="marker window">
      <header class="title">
        <span>{{$t("menu.marker")}}</span>
        <i class="fa fa-times" @click="init.reject"></i>
      </header>
      <section class="display">
        <div class="item target" @click="select(0)">
          <span class="marked">{{item.mark[0] | mark}}</span>
          <span class="text">{{item[language]}}</span>
        </div>
        <div class="item" @click="select(1)" v-if="item.side[language]">
          <span class="marked">{{item.mark[1] | mark}}</span>
          <span class="text">{{item.side[language]}}</span>
        </div>
      </section>
      <section class="mark">
        <span @click="markIt('S')">S</span>
        <span @click="markIt('P')">P</span>
        <span @click="markIt('K')">K</span>
        <span @click="markIt('H')">H</span>
        <span @click="markIt('G')">G</span>
        <span @click="markIt('V')">V</span>
        <span @click="markIt('N')">N</span>
        <span @click="markIt('M')">M</span>
      </section>
      <footer>
        <button class="btn" @click="clear">{{$t("button.clear")}}</button>
        <button class="btn" @click="done">{{$t("button.done")}}</button>
      </footer>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
export default {
  props: ['init'],
  created() {
    this.order = Object.assign({}, this.item);
  },
  data() {
    return {
      target: 0,
      order: null
    }
  },
  methods: {
    select(index) {
      this.target = index;
      document.querySelector(".target").classList.remove("target");
      document.querySelectorAll(".display .item")[index].classList.add("target");
    },
    markIt(word) {
      if (this.order.mark[this.target].length === 4) return;
      let index = this.order.mark[this.target].indexOf(word);
      index === -1 ? this.order.mark[this.target].push(word) : this.order.mark[this.target].splice(index, 1);
    },
    done() {
      this.alterItem(this.order);
      this.init.resolve();
    },
    clear() {
      this.item.mark = [[], []];
    },
    ...mapActions(['alterItem'])
  },
  computed: {
    ...mapGetters(['item', 'language'])
  },
  filters: {
    mark(array) {
      return array.join(" ");
    }
  }
}
</script>

<style scoped>
.marker {
  width: 400px;
  transform: translateY(-74px);
}

section.mark {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  background: #ddd;
}

section.mark span {
  width: 90px;
  text-align: center;
  background: #fff;
  border-radius: 2px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
  font-size: 4em;
  margin: 5px;
  padding: 5px 0;
  transition: background 0.22s linear;
}

section.display {
  display: flex;
  justify-content: center;
  padding: 25px 0 5px;
  font-size: 1.5em;
}

.display .item {
  padding: 10px 15px;
  margin: 15px 5px;
  position: relative;
}

.item.target {
  border-bottom: 4px solid #01579B;
  background: #fff;
  border-radius: 2px;
}

span.marked {
  display: block;
  position: absolute;
  top: -25px;
  left: 0;
  text-align: center;
  width: 100%;
  color: #FF5722;
  font-weight: lighter;
  letter-spacing: -1px;
}

footer {
  margin-top: 25px;
}

section.mark span:active {
  background: #FF5722;
}
</style>
