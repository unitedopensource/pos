<template>
    <div>
    <toggle title="setting.googleMatrix" true-tooltip="tip.matrixService" false-tooltip="tip.disableMatrix" v-model="store.matrix.enable" :conditionalTooltip="true" @update="updateMatrix">
        <transition name="dropdown">
            <div v-if="store.matrix.enable" class="opt">
                <inputer title="text.api" v-model="store.matrix.api" @blur="updateAPI"></inputer>
            </div>
        </transition>
    </toggle>
    <toggle title="setting.emailService" tooltip="tip.emailService" v-model="store.email.enable" @update="updateEmail">
      <transition name="dropdown">
        <div v-if="store.email.enable" class="opt">
            <inputer title="text.username" v-model="store.email.username" @update="updateUser"></inputer>
            <inputer title="text.password" v-model="store.email.password" @update="updatePassword" type="password"></inputer>
            <switches title="text.autoEmailPromotion" v-model="store.email.coupon" :disabled="true"></switches>
            <switches title="text.emailReceipt" v-model="store.email.receipt" :disabled="true"></switches>
            <switches title="text.autoEmailConfirmation" v-model="store.email.reservation" :disabled="true"></switches>
            <switches title="text.emailReport" v-model="store.email.report" :disabled="true"></switches>
        </div>
      </transition>
    </toggle>
    </div>
</template>

<script>
import toggle from "../common/toggle";
import inputer from "../common/inputer";
import switches from "../common/switches";
export default {
  components: { toggle, switches, inputer },
  data() {
    return {
      store: null
    };
  },
  created() {
    this.store = Object.assign({}, this.$store.getters.store);
  },
  methods: {
    update(data) {
      this.$socket.emit("[UPDATE] CONFIG", data);
    },
    updateMatrix(value) {
      this.update({
        key: "store.matrix.enable",
        value
      });
    },
    updateAPI() {
      let value = this.store.matrix.api;
      this.update({
        key: "store.matrix.api",
        value
      });
    },
    updateEmail(value) {
      this.update({
        key: "store.email.enable",
        value
      });
    },
    updateUser() {
      let value = this.store.email.username;
      this.update({
        key: "store.email.username",
        value
      });
    },
    updatePassword() {
      let value = this.store.email.password;
      this.update({
        key: "store.email.password",
        value
      });
    }
  }
};
</script>