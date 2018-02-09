<template>
    <main>
        <switch-type :type.sync="type" @change="setType"></switch-type>
        <header>
            <i class="fa fa-user-circle avatar"></i>
            <div>
                <h3>{{$t('title.customerProfile')}}</h3>
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
    ...mapGetters(["app", "order", "ticket"])
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
    input() {},
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
  width: 700px;
  z-index: 1;
  box-shadow: var(--shadow);
}

header {
  position: relative;
  height: 45px;
  display: flex;
  align-items: center;
  padding-left: 85px;
  border-bottom: 1px solid #eee;
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