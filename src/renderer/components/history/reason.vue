<template>
  <div class="popupMask center dark">
    <div class="reason window">
      <header class="title">{{text('VOID_REASON')}}</header>
      <div class="inner">
        <ul>
          <li class="flag" @click="setReason('REASON_CUST_NO_SHOW',$event)">{{text('REASON_CUST_NO_SHOW')}}</li>
          <li @click="setReason('REASON_CUST_CANCEL',$event)">{{text('REASON_CUST_CANCEL')}}</li>
          <li @click="setReason('REASON_OP_CANCEL',$event)">{{text('REASON_OP_CANCEL')}}</li>
          <li class="flag" @click="setReason('REASON_MALICE_ORDER',$event)">{{text('REASON_MALICE_ORDER')}}</li>
          <li @click="setReason('REASON_INVALID_ORDER',$event)">{{text('REASON_INVALID_ORDER')}}</li>
          <li class="flag" @click="setReason('REASON_PAYMENT_ISSUE',$event)">{{text('REASON_PAYMENT_ISSUE')}}</li>
        </ul>
      </div>
      <footer>
        <button class="btn" :disabled="!reason" @click="confirm">{{text('CONFIRM')}}</button>
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
        time: +new Date,
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
