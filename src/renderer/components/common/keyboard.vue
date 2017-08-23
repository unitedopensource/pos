<template>
  <div class="keyboard" v-show="displayKeyboard">
    <section class="alphabetic">
      <span id="Q" @click="input('Q')">Q</span>
      <span id="W" @click="input('W')">W</span>
      <span id="E" @click="input('E')">E</span>
      <span id="R" @click="input('R')">R</span>
      <span id="T" @click="input('T')">T</span>
      <span id="Y" @click="input('Y')">Y</span>
      <span id="U" @click="input('U')">U</span>
      <span id="I" @click="input('I')">I</span>
      <span id="O" @click="input('O')">O</span>
      <i class="fa fa-terminal" @click="clearAll"></i>
      <span id="A" @click="input('A')">A</span>
      <span id="S" @click="input('S')">S</span>
      <span id="D" @click="input('D')">D</span>
      <span id="F" @click="input('F')">F</span>
      <span id="G" @click="input('G')">G</span>
      <span id="H" @click="input('H')">H</span>
      <span id="J" @click="input('J')">J</span>
      <span id="K" @click="input('K')">K</span>
      <span id="L" @click="input('L')">L</span>
      <i class="fa fa-long-arrow-left" @click="backspace"></i>
      <span id="Z" @click="input('Z')">Z</span>
      <span id="X" @click="input('X')">X</span>
      <span id="C" @click="input('C')">C</span>
      <span id="V" @click="input('V')">V</span>
      <span id="B" @click="input('B')">B</span>
      <span id="N" @click="input('N')">N</span>
      <span id="M" @click="input('M')">M</span>
      <span id="P" @click="input('P')">P</span>
      <span @click="input('/')">/</span>
      <span @click="input('#')">#</span>
      <i class="fa fa-search" @click="search"></i>
      <span @click="input('|')">|</span>
      <span class="space" @click="input(' ')"></span>
      <i class="fa fa-keyboard-o" @click="toggleKeyboard"></i>
      <span @click="cancelOrder">{{$t('dashboard.cancel')}}</span>
      <span class="double created" @click="createOrder">{{$t('dashboard.create')}}</span>
    </section>
    <section class="numeric">
      <span @click="input('7')">7</span>
      <span @click="input('8')">8</span>
      <span @click="input('9')">9</span>
      <span @click="input('4')">4</span>
      <span @click="input('5')">5</span>
      <span @click="input('6')">6</span>
      <span @click="input('1')">1</span>
      <span @click="input('2')">2</span>
      <span @click="input('3')">3</span>
      <span class="double" @click="input('0')">0</span>
      <span @click="input('-')">-</span>
    </section>
  </div>
</template>

<script>
import {mapGetters,mapActions} from 'vuex'
export default {
  methods:{
    input(char){
      this.$emit("input",char)
    },
    backspace(){
      this.$emit("backspace")
    },
    clearAll(){
      this.$emit("clear")
    },
    search(){
      this.$emit("search")
    },
    cancelOrder(){
      this.$emit("cancel")
    },
    createOrder(){
      this.$emit("create")
    },
    ...mapActions(['toggleKeyboard'])
  },
  computed:{
    ...mapGetters(['displayKeyboard'])
  }
}
</script>

<style scoped>
  .keyboard {
      position: fixed;
      bottom: 0;
      left: 0;
      background: linear-gradient(#9098a3, #48525f);
      color: #3A3D42;
      border-top:1px solid #848b96;
      display: flex;
  }
  section.alphabetic,
  section.numeric {
      display:inline-flex;
      vertical-align:top;
      flex-wrap:wrap;
  }
  .alphabetic span,
  .alphabetic i,
  .numeric span,
  .numeric i{
      margin: 4px;
      width: 70.7px;
      height: 62px;
      line-height: 25px;
      font-size: 1.15em;
      font-weight: bold;
      text-indent: 8px;
      background: linear-gradient(#fefefe, #cfd0d3);
      box-shadow: 0 1px 3px rgba(0,0,0,.7), 0 1px 0 rgba(0,0,0,.3);
      text-shadow: 0 1px 1px white;
      border-top:1px solid rgba(255,255,255,.45);
      border-radius: 4px;
  }
  .alphabetic span:active, .numeric span:active {
    background: linear-gradient(#E2E3E4,#AAADB4);
}
.alphabetic i {
    background: linear-gradient(#939ba6,#687180);
    color: white;
    text-shadow: 0 1px 3px rgba(0,0,0,.7), 0 1px 0 rgba(0,0,0,.3);
    border-top: 1px solid rgba(255,255,255,.45);
    font-weight: normal;
}
.alphabetic i:active, .numeric i:active {
    color:#3A3D42;
    box-shadow:0 1px 3px rgba(0,0,0,.7), 0 1px 0 rgba(0,0,0,.3);
    background: linear-gradient(#f8f8f9,#dddfe1);
    text-shadow: 0 1px 1px white;
}
  section.alphabetic {
      flex: 10;
  }
  section.numeric {
      flex: 3;
  }
  span.space{
    width: 307px;
  }
  span.double{
    width: 149.4px;
  }
  span.created{
    background: linear-gradient(#4085f4, #1950dc);
    text-shadow: 0 -2px 0px #203f79;
    color:#fff;
  }
  span.created:active{
    background: linear-gradient(#2577fb, #053bc5);
  }
  .keyboard .next {
    background: linear-gradient(#c3e4ff, #6b8fb7);
}
</style>
