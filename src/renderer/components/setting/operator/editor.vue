<template>
    <div class="popupMask center dark" @click.self="init.reject">
        <div class="editor">
            <header>
                <h2>Time Editor</h2>
                <h4></h4>
            </header>
            <div class="inner">
                <div class="input">
                    <label>{{$t('text.time')}}</label>
                    <input v-model="origin" :disabled="true">
                </div>
                <div class="input">
                    <label>{{$t('text.newTime')}}</label>
                    <input v-model="time" placeholder="MM/DD/YY HH:mm:ss">
                </div>
            </div>
            <footer>
                <button class="btn" @click="confirm" :disabled="!valid">{{$t('button.confirm')}}</button>
            </footer>
        </div>
    </div>
</template>

<script>
import { mapGetters } from "vuex";
export default {
  props: ["init"],
  data() {
    return {
      origin: undefined,
      time: ""
    };
  },
  created() {
    if (this.init.hasOwnProperty("clockIn")) {
      this.origin = moment(this.init.log.clockIn).format("MM/DD/YY HH:mm:ss");
    } else {
      this.origin = this.init.log.clockOut
        ? moment(this.init.log.clockOut).format("MM/DD/YY HH:mm:ss")
        : "";
    }
  },
  methods: {
    confirm() {
      let clockOut, clockIn, timecard;
      if (this.init.hasOwnProperty("clockIn")) {
        clockIn = +moment(this.time, "MM/DD/YY HH:mm:ss");
        timecard = {
          _id: this.init.log._id,
          clockIn,
          editor: this.op.name,
          edit: +new Date()
        };
        this.$socket.emit("[TIMECARD] UPDATE_CLOCK_IN", timecard, () => {
          this.$emit("refresh");
          this.init.resolve();
        });
      } else {
        clockOut = +moment(this.time, "MM/DD/YY HH:mm:ss");
        timecard = {
          _id: this.init.log._id,
          clockOut,
          editor: this.op.name,
          edit: +new Date()
        };
        this.$socket.emit("[TIMECARD] UPDATE_CLOCK_OUT", timecard, () => {
          this.$emit("refresh");
          this.init.resolve();
        });
      }
    }
  },
  computed: {
    valid() {
      return moment(this.time, "MM/DD/YY HH:mm:ss", true).isValid();
    },
    ...mapGetters(["op"])
  }
};
</script>