<template>
        <div class="popupMask center dark" @click.self="init.reject">
        <div class="editor">
            <header>
                <h2>Time Session Verify</h2>
                <h4></h4>
            </header>
            <div class="inner">
                <div class="input">
                    <label>{{$t('text.wage')}}</label>
                    <input v-model.number="wage" placeholder="0.00">
                </div>
            </div>
            <footer>
                <button class="btn" @click="confirm" :disabled="!valid">{{$t('button.confirm')}}</button>
            </footer>
        </div>
    </div>
</template>

<script>
//import checkbox from 'checkbox'
import { mapGetters } from "vuex";
export default {
  props: ["init"],
  data() {
    return {
      wage: 0
    };
  },
  created() {
    this.wage = this.init.log.hasOwnProperty("wage")
      ? this.init.log.wage
      : this.init.profile.wage || 0;
  },
  methods: {
    confirm() {
      let timecard = Object.assign({}, this.init.log, {
        verified: true,
        wage: this.wage,
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
      return isNumber(this.wage);
    },
    ...mapGetters(["op"])
  }
};
</script>