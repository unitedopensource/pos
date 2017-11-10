<template>
        <div class="popupMask center dark" @click.self="init.reject">
        <div class="editor">
            <header>
                <h2>{{$t('title.timeSession')}}</h2>
                <h4></h4>
            </header>
            <div class="inner">
                <div class="input">
                    <label>{{$t('text.date')}}</label>
                    <input v-model="log.date" :placeholder="log.date">
                </div>
                <div class="input">
                    <label>{{$t('text.clockIn')}}</label>
                    <input v-model="log.clockIn" placeholder="YYYY-MM-DD HH:mm:ss">
                </div>
                <div class="input">
                    <label>{{$t('text.clockOut')}}</label>
                    <input v-model="log.clockOut" placeholder="YYYY-MM-DD HH:mm:ss">
                </div>
                <div class="input">
                    <label>{{$t('text.wage')}}</label>
                    <input v-model.number="wage">
                </div>
                <div class="default">
                  <checkbox v-model="log.verified" label="text.verify"></checkbox>
                </div>
            </div>
            <footer>
              <div class="f1">
                <checkbox v-model="lock" label="text.lock"></checkbox>
              </div>
                <button class="btn" @click="confirm" :disabled="!valid">{{$t('button.confirm')}}</button>
            </footer>
        </div>
    </div>
</template>

<script>
import { mapGetters } from "vuex";
import checkbox from "../../common/checkbox";

export default {
  props: ["init"],
  components: { checkbox },
  data() {
    return {
      log: {},
      wage: 0,
      lock: false
    };
  },
  created() {
    this.log = Object.assign({}, this.init.log);

    if (this.log.clockIn) {
      this.log.clockIn = moment(this.log.clockIn).format("YYYY-MM-DD HH:mm:ss");
    }

    if (this.log.clockOut) {
      this.log.clockOut = moment(this.log.clockOut).format(
        "YYYY-MM-DD HH:mm:ss"
      );
    }

    this.wage = this.init.log.hasOwnProperty("wage")
      ? this.init.log.wage
      : this.init.profile.wage || 0;
  },
  methods: {
    confirm() {
      let timecard = Object.assign({}, this.init.log, {
        valid: true,
        verifier: this.op.name,
        verifyDate: +new Date()
      });

      this.$socket.emit("[TIMECARD] VERIFY", timecard, () => {
        this.$emit("refresh");
        this.init.resolve();
      });
    }
  },
  computed: {
    valid() {
      return (
        isNumber(this.wage) &&
        moment(this.log.clockIn, "YYYY-MM-DD HH:mm:ss", true).isValid() &&
        moment(this.log.clockOut, "YYYY-MM-DD HH:mm:ss", true).isValid()
      );
    },
    ...mapGetters(["op"])
  }
};
</script>