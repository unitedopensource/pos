<template>
    <div class="dashboard">
    <div class="cardWrap" v-if="station" :class="{enlarge:station.enlargeTitle}">
        <div class="card" v-for="(grid,index) in station.interface" @click="go(grid)" :class="{disable:!grid.enable}" :key="index">
            <i class="fa" :class="[grid.icon]"></i>
            <h1>{{grid.head}}</h1>
            <h4>{{grid.subhead}}</h4>
        </div>
    </div>
    <div class="clock">
        <div class="time">{{time | moment('hh:mm')}}</div>
        <div class="date">{{time | moment('dddd MMM D')}}</div>
    </div>
    <toast></toast>
    <div :is="component" :init="componentData"></div>
</div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import dialoger from "../common/dialoger";
import unlock from "../common/unlock";
import toast from "./toast";
import Preset from "../preset";
import MAC from "getmac";

export default {
  components: { dialoger, counter, toast, unlock },
  data() {
    return {
      componentData: null,
      component: null
    };
  },
  mounted() {
    this.checkActivation()
      .then(this.getTicketNumber)
      .then(this.checkTimeCard)
      .then(this.checkCashCtrl)
      .then(this.initialized)
      .catch(this.checkFailed);
  },
  methods: {
    checkActivation() {
      return new Promise((registered, unregistered) => {
        this.station ? registered() : new Promise((resolve, reject) => {
            
        });
      });
    }
  }
};
</script>