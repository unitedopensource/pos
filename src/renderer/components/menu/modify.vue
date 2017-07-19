<template>
  <div class="popupMask center dark" @click.self="init.reject">
    <div class="modify window">
      <header class="title">
        <span>{{text("MODIFY")}}</span>
        <span>{{init[language]}}</span>
        <i class="fa fa-times" @click="init.reject"></i>
      </header>
      <section class="display">
        <div class="column target" @click="setPointer('single',$event)">
          <h5>{{text("SINGLE")}}</h5>
          <div>
            <span>$</span>
            <span class="value">{{init.single}}</span>
          </div>
        </div>
        <div class="column" @click="setPointer('qty',$event)">
          <h5>{{text("QTY")}}</h5>
          <div>
            <span class="value">{{init.qty}}</span>
          </div>
        </div>
        <div class="column" @click="setPointer('discount',$event)">
          <h5>{{text("DISCOUNT")}}</h5>
          <div>
            <span>$</span>
            <span class="value">{{init.discount}}</span>
          </div>
        </div>
        <div class="column" @click="setPointer('total',$event)">
          <h5>{{text("TOTAL")}}</h5>
          <div>
            <span>$</span>
            <span class="value">{{init.total}}</span>
          </div>
        </div>
      </section>
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
          <div @click="input('00')">00</div>
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
import {mapGetters} from 'vuex'
export default {
  props:['init'],
  created(){
    console.log(this.init)
  },
  data(){
    return{
      target:"single",
      reset:true
    }
  },
  methods:{
    input(num){
      switch(this.target){
        case "single":
          if(this.init.single > 100) return;
          if(this.reset){
            this.init.single = (parseFloat(num) / 100).toFixed(2);
          }else{
            let single = Math.round(parseFloat(this.init.single) * 100);
                single = (single ? single+num : num) / 100;
                this.init.single = single.toFixed(2);
          }
          this.init.total = (parseFloat(this.init.single) * parseFloat(this.init.qty) - parseFloat(this.init.discount)).toFixed(2);
          break;
        case "qty":
          if(this.reset && num === '0' || num === '00')return;
          if(this.init.qty+num > 99)return;
          this.init.qty = this.reset ? num: String(this.init.qty) + num;
          this.init.total = (parseFloat(this.init.single) * parseFloat(this.init.qty) - parseFloat(this.init.discount)).toFixed(2);
          break;
        case "discount":
          if(this.init.discount > 100)return;
          if(this.reset){
            this.init.discount = (parseFloat(num) / 100).toFixed(2);
          }else{
            let discount = Math.round(parseFloat(this.init.discount) * 100);
                discount = (discount ? discount+num : num) / 100;
                if(parseFloat(this.init.single)*parseFloat(this.init.qty) - discount < 0)return;
                this.init.discount = discount.toFixed(2);
          }
          this.init.total = (parseFloat(this.init.single) * parseFloat(this.init.qty) - parseFloat(this.init.discount)).toFixed(2);
          break;
        case "total":
          if(this.init.total > 100)return;
          if(this.reset){
            this.init.total = (parseFloat(num) / 100).toFixed(2);
          }else{
            let total = Math.round(parseFloat(this.init.total) * 100);
                total = (total ? total+num : num) / 100;
                this.init.total = total.toFixed(2);
          }
          this.init.single = (parseFloat(this.init.total) / parseFloat(this.init.qty) - parseFloat(this.init.discount)).toFixed(2);
            break;
          }
        this.reset = false;

    },
    setPointer(target,e){
      document.querySelector(".target").classList.remove("target");
      e.currentTarget.classList.add("target");
      this.target = target;
      this.reset = true;
    },
    del(){
      switch (this.target) {
        case "single":
          let single = this.init.single.slice(0,-1) / 10;
              this.init.single = single.toFixed(2);
          break;
        case "qty":
          this.init.qty = ~~String(this.init.qty).slice(0,-1);
          break;
        case "discount":
          let discount = this.init.discount.slice(0,-1) / 10;
              this.init.discount = discount.toFixed(2);
          break;
        case "total":
          let total = this.init.total.slice(0,-1) / 10;
              this.init.total = total.toFixed(2);
              this.init.single = (this.init.total / this.init.qty).toFixed(2);
          break;
      }
      this.init.total = (this.init.single * this.init.qty).toFixed(2);
    },
    clear(){
      switch(this.target){
        case "single":
        this.init.single = "0.00";
        this.init.total = (this.init.single * this.init.qty - this.init.discount).toFixed(2);
          break;
        case "qty":
        this.init.qty = 1;
        this.init.total = this.init.single;
          break;
        case "discount":
        this.init.discount = "0.00";
        this.init.total = (this.init.single * this.init.qty).toFixed(2);
          break;
        case "total":
        this.init.total = "0.00";
        this.init.single = "0.00";
          break;
      }
      this.reset = true;
    },
    done(){
      this.init.single = parseFloat(this.init.single);
      this.init.qty = ~~this.init.qty;
      this.init.discount = parseFloat(this.init.discount);
      this.init.resolve(this.init);
    }
  },
  computed:{
    ...mapGetters(['language'])
  }
}
</script>

<style scoped>
  .modify{
    width: 459px;
    transform: translateY(-41px);
  }
  .inner {
    display: flex;
    padding: 0 2px 0 2px;
  }
  .display{
    height: 90px;
    padding: 2px;
    display: flex;
  }
  section.numpad {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    flex: 3;
    justify-content: center;
    align-items: center;
    text-align: center;
    padding-left: 2px;
  }
  section.numpad div:last-child{
    width: 223px;
  }
  .column {
    flex: 1;
    background: #fff;
    box-shadow: 0 1px 4px rgba(0,0,0,0.5);
    margin:4px 3px;
    border-radius: 2px;
    color:#666;
    font-weight: lighter;
  }
  .column.target{
    color: #fff;
    background: #5C6BC0;
    text-shadow: 0 2px 3px rgba(0,0,0,0.5);
    font-weight: bold;
  }
  .column h5 {
    padding: 10px 5px 15px;
    font-size: 1.35em;
    font-weight: lighter;
  }
  .column > div {
    text-align: right;
    padding-right: 5px;
    font-size: 1.25em;
  }
  .target .value{
    position: relative;
  }
  .target .value:after{
    height: 2px;
    width: 100%;
    background: #fff;
    content:' ';
    position: absolute;
    left: 0;
    bottom:-3px;
    animation:flash 1.5s ease infinite;
  }
  @keyframes flash {
    0%{
      opacity: 0
    }
    50%{
        opacity: 1
      }
    100%{
      opacity: 0
    }
  }
</style>
