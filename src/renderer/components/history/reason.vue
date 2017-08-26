<template>
  <div class="popupMask center dark">
    <div class="reason window">
      <header class="title">{{$t('history.voidNote')}}</header>
      <div class="inner">
        <ul>
          <li class="flag" @click="setReason('customerNoShow',$event)">{{$t('reason.customerNoShow')}}</li>
          <li @click="setReason('customerCancel',$event)">{{$t('reason.customerCancel')}}</li>
          <li @click="setReason('operatorCancel',$event)">{{$t('reason.operatorCancel')}}</li>
          <li class="flag" @click="setReason('maliceOrder',$event)">{{$t('reason.maliceOrder')}}</li>
          <li @click="setReason('invalidOrder',$event)">{{$t('reason.invalidOrder')}}</li>
          <li class="flag" @click="setReason('paymentIssue',$event)">{{$t('reason.paymentIssue')}}</li>
          <li class="flag" @click="setReason('managerRedemption',$event)">{{$t('reason.managerRedemption')}}</li>
        </ul>
      </div>
      <footer>
        <button class="btn" :disabled="!reason" @click="confirm">{{$('button.confirm')}}</button>
      </footer>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
  props: ['init'],
  data() {
    return {
      reason: null
    }
  },
  methods: {
    setReason(note, e) {
      let dom = document.querySelector('.reason li.set');
      dom && dom.classList.remove('set');
      e.currentTarget.classList.add('set');
      this.reason = note;
    },
    confirm() {
      let order = Object.assign({}, this.order);
      order.status = 0;
      order.void = {
        by: this.op.name,
        time: +new Date(),
        note: this.reason
      };
      this.$socket.emit("[UPDATE] INVOICE", order);
      this.init.resolve();
    }
  },
  computed: {
    ...mapGetters(['op', 'order'])
  }
}
</script>

<style scoped>
.reason {
  width: 350px;
  background: #eee;
}

.reason li {
  list-style-type: none;
  padding: 15px 10px;
  margin: 10px;
  background: #fff;
  text-indent: 1.5em;
  border-bottom: 1px solid #ccc;
}

.reason .inner {
  padding: 10px 10px;
}

li.flag {
  position: relative;
}

li.flag:before {
  content: '\F024';
  font-family: FontAwesome;
  position: absolute;
  left: -12px;
  color: #F44336;
}

li.set {
  background: #FFD54F;
  border-bottom: 1px solid #795548;
  font-weight: bold;
}

footer button.btn {
  margin: 5px 10px;
  flex: 1;
}
</style>
