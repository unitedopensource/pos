<template>
  <div class="popupMask center dark">
    <div class="reason window">
      <header class="title">{{$t('history.voidNote')}}</header>
      <div class="inner">
        <ul>
          <li class="flag" @click="setReason('Customer No-Show',$event)">{{$t('reason.Customer No-Show')}}</li>
          <li @click="setReason('Cancel By Customer',$event)">{{$t('reason.Cancel By Customer')}}</li>
          <li @click="setReason('operatorCancel',$event)">{{$t('reason.Cancel By Staff')}}</li>
          <li class="flag" @click="setReason('Malice Order',$event)">{{$t('reason.Malice Order')}}</li>
          <li @click="setReason('Invalid Order',$event)">{{$t('reason.Invalid Order')}}</li>
          <li class="flag" @click="setReason('Payment Issue',$event)">{{$t('reason.Payment Issue')}}</li>
          <li class="flag" @click="setReason('Manager Redemption',$event)">{{$t('reason.Manager Redemption')}}</li>
        </ul>
      </div>
      <footer>
        <button class="btn" :disabled="!reason" @click="confirm">{{$t('button.confirm')}}</button>
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
      //add table clear logic here
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
