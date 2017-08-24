<template>
  <div class="popupMask center dark" @click.self="exit">
    <div class="dialog">
      <header class="title">{{text("SET_TABLE")}}<i class="fa fa-retweet" @click="reset"></i></header>
        <div class="tables">
          <h5>{{text("SET_GUEST")}}</h5>
          <div v-for="(table,index) in init.tables" class="table" :key="index">
            <span class="name">{{table.stats.name}}</span>
            <span :class="table.stats.shape" class="icon" :style="{color:table.current.color}" @click="addCustomer(table)"></span>
            <span>{{table.current.guest}}</span>
          </div>
          <div v-if="init.tables.length > 1">
            <h5 class="intro">{{text("PICK_COLOR")}}</h5>
            <div class="colors">
              <span class="color black" @click="setColor('#000000')"></span>
              <span class="color blue" @click="setColor('#03A9F4')"></span>
              <span class="color red" @click="setColor('#EF5350')"></span>
              <span class="color purple" @click="setColor('#BA68C8')"></span>
              <span class="color green" @click="setColor('#66BB6A')"></span>
              <span class="color yellow" @click="setColor('#FFCA28')"></span>
              <span class="color brown" @click="setColor('#8D6E63')"></span>
            </div>
          </div>
        </div>
      <div v-if="init.assign" class="tables">
        <h5>{{text("ASSIGN_WAITER")}}</h5>
        <div class="cashier">
          <div v-for="i in 10">
            No.{{i}} Waiter
          </div>
        </div>
      </div>
      <footer>
        <button class="btn" @click="exit">{{$t('button.exit')}}</button>
        <button class="btn" @click="confirm">{{$t("button.confirm")}}</button>
      </footer>
    </div>
  </div>
</template>

<script>
export default {
  props:['init'],
  data(){
    return {

    }
  },
  methods:{
    addCustomer(table){
      let seats = table.stats.seats;
      table.current.guest = table.current.guest < seats ? table.current.guest + 1 : 0;
    },
    setColor(hex){
      this.init.tables.forEach(table=>{
        table.current.color = hex;
      })
    },
    reset(){
      this.$emit("reset");
    },
    confirm(){
      let checkGuest = true;
      this.init.tables.forEach(table=>{
        if(table.current.guest === 0)checkGuest = false;
        table.current.time = +new Date();
      });
      if(!checkGuest){
        console.error("guest can't be zero");
        return;
      }
      this.$emit("placed",this.init.tables);
      this.$emit("exit");
    },
    exit(){
      this.$emit("exit");
    }
  }
}
</script>

<style scoped>
  .dialog{
    border:2px solid #fff;
    background: #eee;
    width: 600px;
    margin-bottom: 50px;
    box-shadow: 0 1px 4px rgba(0,0,0,0.4);
  }
  .tables {
    text-align: center;
  }
  .dialog h5 {
    color: #607D8B;
    font-size: 1.15em;
    font-weight: lighter;
    margin: 10px auto 5px;
    padding-bottom: 5px;
    width: 89%;
    border-bottom: 1px dashed #ccc;
  }
  .tables .table {
    display: inline-flex;
    flex-direction: column;
    margin: 5px;
    text-align: center;
    align-items: center;
    transition: background 0.2s linear;
  }
  .tables div .icon {
    font-size: 5em;
    margin-top: -10px;
    text-shadow: 2px 2px 1px rgba(0,0,0,0.4);
  }
  .tables .name {
    padding: 0 5px;
    background: #90A4AE;
    display: inline-block;
    width: 35px;
    border-radius: 6px;
    color: #fcfcfc;
  }
  .colors,.cashier {
    display: flex;
    justify-content: center;
  }
  .color {
    height: 40px;
    width: 40px;
    border-radius: 10px;
    margin: 5px 15px;
  }
  .color.black{
    background: #000000;
  }
  .color.blue{
    background: #03A9F4;
  }
  .color.red{
    background: #EF5350;
  }
  .color.purple{
    background: #BA68C8;
  }
  .color.green{
    background: #66BB6A;
  }
  .color.yellow{
    background: #FFCA28;
  }
  .color.brown{
    background: #8D6E63;
  }
  .dialog footer{
    text-align: center;
    margin:20px auto 10px;
  }
  .dialog footer .btn{
    width: 150px;
    margin:0 30px;
  }
  .dialog .table:active {
    background: #fff;
  }
</style>
