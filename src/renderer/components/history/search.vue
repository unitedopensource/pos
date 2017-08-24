<template>
  <div class="popupMask center dark" @click.self="init.reject">
    <div class="search window">
      <header class="title"><span>{{$t('history.search')}}</span><i class="fa fa-times" @click="init.reject"></i></header>
      <div class="inner">
        <input type="text" v-model="invoice">
        <section class="numpad">
          <div @click="input('7')">7</div>
          <div @click="input('8')">8</div>
          <div @click="input('9')">9</div>
          <div @click="input('4')">4</div>
          <div @click="input('5')">5</div>
          <div @click="input('6')">6</div>
          <div @click="input('1')">1</div>
          <div @click="input('2')">2</div>
          <div @click="input('3')">3</div>
          <div @click="input('0')">0</div>
          <div @click="input('-')">-</div>
        </section>
        <aside class="numpad">
          <div @click="del">&#8592;</div>
          <div @click="done">&#8626;</div>
        </aside>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props:['init'],
  data(){
    return{
      invoice:""
    }
  },
  methods:{
    input(string){
      this.invoice += string;
    },
    del(){
      this.invoice = this.invoice.slice(0,-1);
    },
    done(){
      this.init.resolve(this.invoice);
    }
  }
}
</script>

<style scoped>
  .search{
    background: #eee;
  }
  section.numpad {
    display: inline-flex;
    flex-wrap: wrap;
    width: 342px;
    margin-left: 2px;
}
  .search input {
    display: block;
    padding: 8px;
    font-size: 1.25em;
    border: 2px solid #ccc;
    margin: 25px auto;
  }
  aside.numpad {
    display: inline-flex;
    flex-direction: column;
    margin-left: -5px;
  }
  section.numpad div:last-child {
    width: 223px;
  }
  aside.numpad div:last-child {
    height: 228px;
    line-height: 228px;
  }
</style>
