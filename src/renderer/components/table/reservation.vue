<template>
  <div class="popupMask center dark" @click.self="init.reject">
    <div class="reservation window">
      <header class="title">
        <span>{{text('RESERVATION')}}</span>
        <span class="date">{{date}}</span>
        <i class="fa fa-times" @click="init.reject"></i>
      </header>
      <div class="inner">
        <section class="dataList">
          <header>
            <span>{{text('WAIT_QUEUE')}}({{list.length}})</span>
            <i class="fa fa-plus-square"></i>
          </header>
          <ul class="content">
            <list :reserve="customer" v-for="(customer,index) in list" @sent="SMS" @seat="seat" @remove="remove" :key="index"></list>
          </ul>
          <footer>
            <span>page 1/3</span>
          </footer>
        </section>
      </div>
    </div>
  </div>
</template>

<script>
import {mapGetters} from 'vuex'
import moment from 'moment'
import nodemailer from 'nodemailer'
import list from './list'
export default{
  props:['init'],
  data(){
    return{
      date:moment().subtract(4,'hours').format('YYYY-MM-DD'),
      page:0
    }
  },
  methods:{
    SMS(customer){
      let mail = {
        from: `"${this.store.name}" <UnitedPOS.service@gmail.com>`,
        to: this.getGateway(customer.alert.phone,customer.alert.carrier),
        subject: 'Reservation✔',
        text: `Hi ${customer.name}, Your Table is Ready. Enjoy😋🍽️`,
        html: `Hi ${customer.name}, Your Table is <b>Ready</b>. Enjoy😋🍽️`
      };

      let transporter = nodemailer.createTransport({
          service: 'Gmail',
          auth: {
              user: 'UnitedPOS.service@gmail.com',
              pass: 'xuewu1515'
              }
        });

      transporter.sendMail(mail, (error, info) => {
        console.log(error || info);
      });
    },
    seat(customer){
      console.log(customer);
    },
    remove(customer){
      console.log(customer);
    },
    getGateway(phone,carrier){
      let email = {
        'att':'@mms.att.net',
        'tmobile':'@tmomail.net',
        'boost':'@myboostmobile.com',
        'cricket':'@mms.cricketwireless.net',
        'metropcs':'@mymetropcs.com',
        'fi':'@msg.fi.google.com',
        'sprint':'@pm.sprint.com',
        'uscellular':'@mms.uscc.net',
        'verizon':'@vzwpix.com',
        'virgin':'@vmpix.com',
        'lyca':'@mms.us.lycamobile.com'
      }
      return phone + email[carrier]
    }
  },
  computed:{
    list(){
      let min = this.page * 7;
      let max = min + 7;
      return this.reservation.slice(min,max) || []
    },
    ...mapGetters(['reservation','store'])
  },
  components:{
    list
  }
}
</script>

<style scoped>
  .reservation{
    width: 800px;
    background: #eee;
  }
  span.date {
    display: inline-block;
    font-size: 0.8em;
    vertical-align: bottom;
    border-bottom: 1px dotted #B3E5FC;
    margin-left: 5px;
    cursor: pointer;
  }
  footer{
    padding: 15px;
    background: #eee;
  }
</style>
