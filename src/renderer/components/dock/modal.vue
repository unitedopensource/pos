<template>
  <transition name="scale">
    <div class="modal" v-show="this.$route.name === 'Dashboard'">
      <div class="wrap">
        <section v-if="!init.type" @click.stop="go">
          <div class="phone">
            <h3>{{init.phone | tel}}</h3>
            <h5 class="lastTime">{{init.extra.lastDate | fromNow}}</h5>
          </div>
          <div class="address">
            <span>{{init.address}}</span>
            <span>{{init.city}}</span>
          </div>
          <i class="fa fa-map-marker map" v-show="init.address" @click.stop="getMap"></i>
          <i class="fa fa-phone phone icon"></i>
        </section>
        <section v-else>
          <div class="top online">
            <h3>{{init.name}}</h3>
            <h5></h5>
          </div>
          <div class="bottom"></div>
          <i class="fa"></i>
        </section>
      </div>
    </div>
  </transition>
</template>

<script>
import {mapActions} from 'vuex'
  export default {
    props:['init'],
    methods:{
      go(){
        this.setCustomer(this.init);
        this.setTicket({type:'DELIVERY'});
        this.$router.push({name:'Information'});
        this.exit();
      },
      getMap(){
        console.log("trigger");
      },
      exit(){
        this.$emit("exit")
      },
      ...mapActions(['setCustomer','setTicket'])
    }
}
</script>

<style scoped>
  .modal{
    width: 290px;
    position: fixed;
    top: 80px;
    left: 100px;
    background: #fff;
    color: #555;
    border-radius: 4px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.3);
  }
  .wrap{
    position: relative;
  }
  .modal section{
    padding: 5px 10px;
  }
  div.phone{
    display: flex;
  }
  i.icon {
    position: absolute;
    right: -20px;
    top: -20px;
    width: 55px;
    height: 55px;
    line-height: 58px;
    text-align: center;
    background: #FF9800;
    color: #fff;
    border-radius: 50%;
    font-size: 2em;
    border: 2px solid #fff;
    text-shadow: 0 2px 2px rgba(0,0,0,0.4);
    box-shadow: 0px 3px 18px -3px rgba(0,0,0,0.65);
    animation: scale 0.5s linear forwards;
  }
  @keyframes scale {
    0%{
      transform: scale(0);
      opacity: 0
    }
    70%{
      transform: scale(1.1);
      opacity: 1
    }
    100%{
      transform: scale(1);
      opacity: 1
    }
  }
  span.lastTime {
    position: absolute;
    bottom: 0;
  }
  .phone h3 {
    font-size: 1.3em;
    margin: 5px 0 0;
    font-family: "Agency FB";
  }
  .modal .address {
    display: flex;
    flex-direction: column;
    font-size: 0.8em;
    width: 210px;
    margin-left: 7px;
    text-shadow: none;
    color: gray;
  }
  .phone h5 {
    font-size: 0.75em;
    font-weight: normal;
    text-shadow: none;
    padding-top: 15px;
    width: 105px;
    text-align: right;
    color: burlywood;
  }
  i.map {
    position: absolute;
    right: 25px;
    bottom: 11px;
    font-size: 1.3em;
    color: #fff;
    text-shadow: 0 1px 2px rgba(0,0,0,0.5);
  }
  i.map:after {
    content: '';
    width: 27px;
    height: 27px;
    background: #9E9E9E;
    position: absolute;
    left: -6px;
    top: -1px;
    z-index: -1;
    transform: rotate(45deg);
    border-radius: 6px;
    box-shadow: 0 0px 3px rgba(0,0,0,0.3);
  }
  .scale-enter-active, .scale-leave-active {
    transition: opacity .3s ease;
  }
  .scale-enter, .scale-leave-active {
    opacity: 0;
  }
</style>
