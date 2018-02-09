<template>
  <div class="field-entry f1">
    <h4>{{$t('text.phone')}}</h4>
    <div class="wrap">
      <i class="fa fa-phone icon"></i>
      <input type="text" :value="value" @click="focus" v-mask="'### ### ####'" @input="$emit('input',$event.target.value)">
    </div>
    <template v-if="dropdown === 'list'">
      <ul class="history" v-outer-click="close">
        <li v-for="(log,index) in logs" :class="{new:log.new}" @click="get(log)">
          <h4>{{log.phone | phone}}
            <!-- <span class="time">{{log.time | fromNow}}</span> -->
          </h4>
          <div class="customer" v-if="log.customer">
            <span>{{log.customer.address}}</span>
          </div>
        </li>
      </ul>
    </template>
    <template v-else>

    </template>
  </div>
</template>

<script>
import { mapActions } from "vuex";

export default {
  props: ["value"],
  data() {
    return {
      logs: [],
      dropdown: null
    };
  },
  created() {
    this.$socket.emit("[CALL] LAST", logs => {
      this.logs = logs;
      console.log(logs);
    });
  },
  methods: {
    focus() {
      this.$emit("focus", "phone");

      if (!this.value) this.dropdown = "list";
    },
    close() {
      this.dropdown = null;
    },
    get(log) {
      if (log.customer) {
        this.setCustomer(log.customer);
        this.dropdown = null;
      }
    },
    ...mapActions(["setCustomer"])
  }
};
</script>

<style scoped>
ul.history {
  position: absolute;
  background: #fff;
  width: 100%;
  box-shadow: var(--shadow);
  z-index: 1;
}

ul.history li {
  padding: 5px;
  height: 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  cursor: pointer;
  position: relative;
}

ul.history li:nth-child(even) {
  background: #fafafa;
}

li h4 {
  color: #3c3c3c;
}

li .customer {
  color: #a23900;
}
</style>