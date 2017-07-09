<template>
  <div class="popupMask center dark" @click.self="init.reject">
    <div class="wrap">
      <div class="type" @click="init.resolve('WALK_IN')" v-if="init.type !== 'WALK_IN'">
        <i class="fa fa-user"></i>
        <span>{{text('WALK_IN')}}</span>
      </div>
      <div class="type" @click="init.resolve('PICK_UP')" v-if="init.type !== 'PICK_UP'">
        <i class="fa fa-phone"></i>
        <span>{{text('PICK_UP')}}</span>
      </div>
      <div class="type" @click="init.resolve('DELIVERY')" v-if="init.type !== 'DELIVERY'">
        <i class="fa fa-car"></i>
        <span>{{text('DELIVERY')}}</span>
        <span class="require" v-show="init.lack">{{text('LACK_INFO')}}</span>
      </div>
      <div class="type" @click="init.resolve('DINE_IN')" v-if="init.type !== 'DINE_IN'">
        <i class="fa fa-cutlery"></i>
        <span>{{text('DINE_IN')}}</span>
      </div>
    </div>
  </div>
</template>

<script>
export default{
  props:['init']
}
</script>

<style scoped>
  .wrap{
    position: absolute;
    top: 0px;
    left: 45px;
    border: 2px solid #607d8b;
    box-shadow: 0 3px 4px rgba(0,0,0,0.5);
  }
  .type{
    background: #fff;
    padding: 18px 10px 18px 15px;
    color: #555;
    width: 191px;
    text-shadow: none;
    border-bottom: 1px solid #ddd;
  }
  .type:nth-child(2n) {
    background: #F5F5F5;
  }
  .type i {
    display: inline-block;
    width: 20px;
    text-align: center;
  }
  .require {
    background: #FF5722;
    color: #fcfcfc;
    padding: 0px 5px;
    border-radius: 4px;
    float: right;
    font-size: 0.7em;
    font-weight: lighter;
  }
</style>
