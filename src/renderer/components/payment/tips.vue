<template>
  <div class="popupMask center dark" @click.self="init.reject">
    <div class="window">
      <header class="title">
        <span>{{text('SET_TIP')}}</span>
        <i class="fa fa-times" @click="init.reject"></i>
      </header>
      <div class="inner">
          <div class="display">
            <div class="total">
              <span class="due">{{init.payment.due | decimal}}</span>
              <span class="formula">{{formula}}</span>
            </div>
            <div class="wrap">
              <div class="data" @click="setTarget('tip')" :class="{active:target==='tip'}">
                <span class="text">{{text('SET_TIP')}}</span>
                <span class="value">{{tip}}</span>
              </div>
              <div class="data" @click="setTarget('gratuity')" :class="{active:target==='gratuity'}">
                <span class="text">{{text('SET_GRATUITY')}}</span>
                <span class="value">{{gratuity}}</span>
              </div>
            </div>
          </div>
          <div class="wrap">
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
              <div @click="input('00')" class="double">00</div>
            </section>
            <aside class="numpad">
              <div @click="del">&#8592;</div>
              <div @click="switchUnit" v-if="this.currentUnit === '%'">%</div>
              <div @click="switchUnit" v-else>$</div>
              <div @click="enter">&#8626;</div>
            </aside>
          </div>
      </div>
    </div>
  </div>
</template>

<script>
  export default{
    props:['init'],
    mounted(){
      this.tip = this.init.payment.tip ? '$ ' + this.init.payment.tip : '0 %';
      this.gratuity = this.init.payment.gratuity ? '$ ' + this.init.payment.gratuity : '0 %';
      if(this.tip || this.gratuity) this.currentUnit = '$';
    },
    data(){
      return{
        currentUnit:"%",
        target:"tip",
        formula:null,
        gratuity:null,
        tip:null,
      }
    },
    methods:{
      switchUnit(){
        if(this.currentUnit === "$"){
          this[this.target] = "0 %";
          this.currentUnit = "%";
        }else{
          this[this.target] = "$ 0.00";
          this.currentUnit = "$";
        }
        this.formula = null;
      },
      setTarget(name){
        this.target = name;
      },
      getFormula(value){
        let total = this.init.payment.total;
        if(value.includes('%')){
          let result = (total * (parseFloat(value.replace(/D+/,"")) / 100)).toFixed(2);
          this.formula = `${total} * ${value} = ${result}`;
        }
      },
      input(num){
        let value = this[this.target];
        if(value.includes('%')){
          value = ~~(value.replace(/\D+/,"") + num) + " %";
          this.getFormula(value);
          this[this.target] = value;
        }else{
          value = Math.round(parseFloat(value.replace(/\D+/,"")) * 100);
          value = (value ? value+num : num) / 100;
          this[this.target] = "$ " + value.toFixed(2);
        }

      },
      del(){
        let value = this[this.target];
        if(value.includes('%')){
          value = ~~String(value.replace(/\D+/,"")).slice(0,-1) + " %";
          this.getFormula(value);
          this[this.target] = value;
        }else{
          value = value.replace(/\D+/,"").slice(0,-1) / 10;
          this[this.target] = "$ " + value.toFixed(2);
        }
      },
      enter(){
        let tip = this.tip.includes("%") ?
        (this.tip.replace(/\D+/,"") / 100 * this.init.payment.due).round(2):
        ~~this.tip.replace(/\D+/,"");

        let gratuity = this.gratuity.includes("%") ?
        (this.gratuity.replace(/\D+/,"") / 100 * this.init.payment.due).round(2):
        ~~this.gratuity.replace(/\D+/,"");

        this.init.resolve({tip,gratuity});
      }
    }
  }
</script>

<style scoped>
  .inner{
    padding: 0 2px 0 4px;
  }
  .display{
    height: 160px;
    text-align: center;
  }
  .wrap{
    display: flex;
    width: 453px;
  }
  section.numpad {
    flex: 3;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
  }
  span.due {
    font-size: 2em;
    font-weight: bold;
    color: #444;
  }
  .total {
    padding: 10px;
    display: flex;
    flex-direction: column;
  }
  span.formula {
    color: #607D8B;
    height: 25px;
  }
  .data{
    flex: 1;
    box-shadow: 0 1px 4px rgba(0,0,0,0.5);
    margin: 2px;
    display: flex;
    flex-direction: column;
    padding: 8px 12px;
    border-radius: 2px;
    background: #fff;
  }
  .data.active{
    color: #fff;
    background: #5C6BC0;
    text-shadow: 0 2px 3px rgba(0,0,0,0.5);
    font-weight: bold;
  }
  .data .text {
    text-align: left;
    margin-bottom: 20px;
  }
  .data .value {
    text-align: right;
  }
</style>
