<template>
  <li>
    <div class="display">
      <div class="customer">
        <i class="fa fa-check-circle confirm" v-if="reserve.confirm"></i>
        <i class="fa fa-question-circle pending" v-else></i>
        <span class="name">{{reserve.name}}</span>
        <span class="status">{{reserve.status}}</span>
      </div>
      <div class="info">
        <div>
          <span class="text">Reserve Time</span>
          <span clas="value">{{reserve.request}}</span>
        </div>
        <div>
          <span class="text">Arrival Time</span>
          <span clas="value">{{reserve.arrival}}</span>
        </div>
        <div>
          <span class="text">Guest(s)</span>
          <span clas="value">{{reserve.guest}}</span>
        </div>
      </div>
    </div>
    <div class="function">
      <i class="fa fa-3x fa-commenting-o blue" @click="sent"></i>
      <i class="fa fa-3x fa-user-circle blue" @click="seat"></i>
      <i class="fa fa-3x fa-times-circle red" @click="remove"></i>
    </div>
  </li>
</template>

<script>
import {mapGetters} from 'vuex'
export default{
  props:['reserve'],
  data(){
    return{
      disabled:false
    }
  },
  methods:{
    sent(){
      if(this.disabled)return;
      this.disabled = true;
      this.$emit("sent",this.reserve);
    },
    seat(){
      this.$emit("seat",this.reserve)
    },
    remove(){
      this.$emit("remvoe",this.reserve)
    }
  },

}
</script>

<style scoped>
  li {
    padding: 10px 25px;
    display: flex;
    flex-direction: row;
    border-bottom: 1px solid #EEEEEE;
    background: #fff;
  }
  .display {
    flex: 5;
  }
  .function {
    flex: 3;
    text-align: right;
  }
  .customer {
    display: flex;
  }
  .info {
    display: flex;
    flex-direction: row;
  }
  .info > div {
    display: flex;
    flex-direction: column;
    flex: 1;
  }
  .status{
    margin: 0 5px;
    background: #FFC107;
    color: #fcfcfc;
    padding: 1px 10px 0px;
    border-radius: 4px;
    text-shadow: 0 1px 2px rgba(0,0,0,0.5);
  }
  i.confirm{
    color: #66BB6A;
  }
  i.pending{
    color: #FF7043;
  }
  .name {
    width: 135px;
    font-weight: bold;
    font-size: 1.2em;
  }
  .text {
    color: #757575;
  }
  .content {
    height: 555px;
    background: #FAFAFA;
  }
  .function i {
    color: #FAFAFA;
    padding: 3px 5px;
    border-radius: 4px;
    box-shadow:  0 1px 2px rgba(0,0,0,0.4);
    cursor: pointer;
  }
  i.blue{
    background: #2196F3;
  }
  i.red{
    background: #FF7043
  }
  .function i.disabled{
    background: lightgray;
    cursor: not-allowed;
  }
</style>
