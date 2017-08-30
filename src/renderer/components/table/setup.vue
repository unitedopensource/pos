<template>
      <div class="popupMask center dark" @click.self="exit">
        <div class="setup window">
          <header class="title">{{$t("text.setGuest")}}<span class="table">{{init.table.name}}</span></header>
          <input type="text" v-model="guest">
          <div class="inner">
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
            </section>
            <aside class="numpad">
              <div @click="del">&#8592;</div>
              <div @click="clear">C</div>
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
      guest:1,
      reset:true
    }
  },
  methods:{
    input(num){
      this.guest = this.reset?num:(this.guest+num > 99?this.guest:this.guest+num);
      this.reset = false;
    },
    del(){
      this.guest = this.guest.slice(0,-1);
    },
    clear(){
      this.guest = 1;
      this.reset = true;
    },
    done(){
      this.init.resolve(this.guest);
    },
    exit(){
      this.init.reject();
    }
  }
}
</script>

<style scoped>
  .setup{
    background: #fff;
    text-align: center;
  }
  .setup input{
    background: lightgray;
    text-align: center;
    color: #fff;
    width: 275px;
    padding: 5px 0;
    margin: 25px auto;
    font-size: 2.5em;
    border:none;
    outline:none;
    border-bottom: 2px solid gray;
    text-shadow: 0 1px 1px rgba(0,0,0,0.5);
  }
  .setup .inner{
    display: flex;
    padding: 4px 2px 0 4px;
  }
  .inner section.numpad{
    width: 342px;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
  }
  section.numpad div:last-child{
    width: 337px;
  }
  .table{
    float:right;
    border-bottom: 1px dotted #a3d6ff;
  }
</style>
