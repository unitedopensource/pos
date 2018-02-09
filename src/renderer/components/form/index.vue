<template>
  <main :class="{form:keyboard}">
    <switch-type :type.sync="type" @change="setType"></switch-type>
    <header>
      <i class="fa fa-user-circle avatar"></i>
      <div>
        <span>{{$t('title.customerProfile')}}</span>
      </div>
    </header>
    <router-view></router-view>
    <keyboard :display="keyboard" @input="input" @cancel="cancel"></keyboard>
  </main>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import keyboard from "./component/keyboard";
import switchType from "./component/switchType";

export default {
  components: { switchType, keyboard },
  computed: {
    ...mapGetters(["app", "order", "ticket", "customer"])
  },
  data() {
    return {
      type: null,
      keyboard: true
    };
  },
  created() {
    this.type = this.app.newTicket ? this.ticket.type : this.order.type;
  },
  methods: {
    setType(type) {
      this.type = type;
      this.setTicket({ type });
    },
    input(char) {
      console.log(char);
      this.customer.phone += char;
    },
    cancel() {
      this.resetMenu();
      this.resetDashboard();
      this.$router.push({ path: "/main" });
    },
    ...mapActions(["setTicket", "resetMenu", "resetDashboard"])
  }
};
</script>

<style scoped>
main {
  position: relative;
  background: #fff;
  width: 668px;
  z-index: 1;
  box-shadow: var(--shadow);
}

main.form {
  margin-bottom: 200px;
}

header {
  position: relative;
  height: 45px;
  display: flex;
  align-items: center;
  padding-left: 85px;
  border-bottom: 1px solid #eee;
  background: #607d8b;
  color: #fff;
}

i.avatar {
  position: absolute;
  font-size: 4em;
  background: #fff;
  border-radius: 50%;
  border: 3px solid #fff;
  color: #2196f3;
  text-shadow: 0 1px 1px #3c3c3c;
  box-shadow: 0 1px 1px #788e98;
  top: -34px;
  left: 10px;
}
</style>