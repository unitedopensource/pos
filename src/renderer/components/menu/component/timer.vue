<template>
    <div class="popupMask center dark" @click.self="init.reject">
        <div class="window">
            <header class="title">
                <span>{{$t('title.timer')}}</span>
            </header>
            <div class="inner">
                <div class="timer">
                    <div class="wrap">
                        <i class="fa fa-angle-up" @click="addHour(10)"></i>
                        <span class="time">{{time[0]}}</span>
                        <i class="fa fa-angle-down" @click="subHour(10)"></i>
                    </div>
                    <div class="wrap">
                        <i class="fa fa-angle-up" @click="addHour(1)"></i>
                        <span class="time">{{time[1]}}</span>
                        <i class="fa fa-angle-down" @click="subHour(1)"></i>
                    </div>
                    <div class="blink">:</div>
                    <div class="wrap">
                        <i class="fa fa-angle-up" @click="addMin(10)"></i>
                        <span class="time">{{time[2]}}</span>
                        <i class="fa fa-angle-down" @click="subMin(10)"></i>
                    </div>
                    <div class="wrap">
                        <i class="fa fa-angle-up" @click="addMin(1)"></i>
                        <span class="time">{{time[3]}}</span>
                        <i class="fa fa-angle-down" @click="subMin(1)"></i>
                    </div>
                </div>
            </div>
            <footer>
                <div class="f1">
                    <checkbox v-model="ahead" title="text.tenMinuteAhead"></checkbox>
                </div>
                <div class="btn" @click="init.reject">{{$t('button.cancel')}}</div>
                <div class="btn" @click="confirm">{{$t('button.confirm')}}</div>
            </footer>
        </div>
        <div :is="component" :init="componentData"></div>
    </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import dialoger from "../../common/dialoger";
import checkbox from "../../setting/common/checkbox";


export default {
  props: ["init"],
  components: { dialoger, checkbox },
  data() {
    return {
      timer: moment(),
      ahead: true,
      time: null,
      componentData: null,
      component: null,
      current: +new Date()
    };
  },
  created() {
    this.time = this.timer.format("HHmm").split("");
  },
  methods: {
    addHour(t) {
      this.timer.add(t, "hours");
      this.time = this.timer.format("HHmm").split("");
    },
    subHour(t) {
      this.timer.subtract(t, "hours");
      this.time = this.timer.format("HHmm").split("");
    },
    addMin(t) {
      this.timer.add(t, "minutes");
      this.time = this.timer.format("HHmm").split("");
    },
    subMin(t) {
      this.timer.subtract(t, "minutes");
      this.time = this.timer.format("HHmm").split("");
    },
    confirm() {
      let hour = Number(String(this.time[0]) + String(this.time[1]));
      let minute = Number(String(this.time[2]) + String(this.time[3]));
      let schedule = moment()
        .hour(hour)
        .minute(minute);
      this.ahead && schedule.subtract(10, "minutes");
      schedule > this.current ? this.confirmTime(schedule) : this.timeError();
    },
    timeError() {
      this.$dialog({
        title: "dialog.scheduleError",
        msg: "dialog.scheduleErrorTip",
        buttons: [{ text: "button.confirm", fn: "resolve" }]
      }).then(() => {
        this.$q();
      });
    },
    confirmTime(schedule) {
      let now = moment();
      let duration = moment.duration(schedule.diff(now)).humanize();
      this.$dialog({
        title: "dialog.scheduleConfirm",
        msg: ["dialog.scheduleConfirmTip", schedule.format("hh:mm a"), duration]
      })
        .then(() => {
          this.submit(schedule);
        })
        .catch(() => {
          this.$q();
        });
    },
    submit(schedule) {
      this.$q();
      delete this.customer.extra;
      if (this.app.mode === "create") {
        Object.assign(this.order, {
          customer: this.customer,
          type: this.ticket.type,
          number: this.ticket.number,
          modify: 0,
          time: +new Date,
          delay: +schedule,
          status: 1,
          date: today(),
          timer: true,
          schedule: +schedule,
          source: this.op.role !== "ThirdParty" ? "POS" : this.op.name,
          print: false,
          content: this.order.content.map(item => {
            item.pending = true;
            return item;
          })
        });
        this.$socket.emit("[SAVE] INVOICE", this.order, false, content => {
          this.delayPrint(content);
          this.resetAll();
          this.setApp({ opLastAction: new Date(), mode: "create" });
          this.$router.push({ path: "/main" });
        });
      } else {
        Object.assign(this.order, {
          customer: this.customer,
          type: this.ticket.type,
          lastEdit: +new Date,
          editor: this.op.name,
          schedule: +schedule,
          modify: isNumber(this.order.modify) ? this.order.modify + 1 : 1
        });
        this.$socket.emit("[UPDATE] INVOICE", this.order);
        this.delayPrint(this.order);
        this.resetAll();
        this.setApp({ opLastAction: new Date(), mode: "create" });
        this.$router.push({ path: "/main" });
      }
    },
    ...mapActions(["setApp", "delayPrint", "resetAll"])
  },
  computed: {
    ...mapGetters(["op", "app", "order", "ticket", "customer", "language"])
  }
};
</script>

<style scoped>
.inner {
  width: 400px;
}

.timer {
  display: flex;
  justify-content: center;
}

.blink {
  line-height: 185px;
  font-size: 5em;
  animation: blinker 1s infinite;
}

@keyframes blinker {
  50% {
    opacity: 0;
  }
}

.timer .wrap {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  margin: 5px 10px;
}

span.time {
  padding: 10px;
  font-family: "Agency FB";
  font-weight: bold;
  color: #fff;
  background: #333;
  font-size: 3em;
  width: 50px;
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
}

.wrap i {
  padding: 10px 29px;
  background: linear-gradient(#fefefe, #cfd0d3);
  margin: 8px 0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
}

.wrap i:active {
  background: linear-gradient(#e2e3e4, #aaadb4);
}

.f1 {
  display: flex;
  align-items: center;
}
</style>
