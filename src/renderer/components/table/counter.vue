<template>
  <div class="popupMask center dark" @click.self="init.reject">
    <div class="editor">
      <header>
          <h5>{{currentTable.name}}</h5>
          <h3>{{$t("text.setGuest")}}</h3>
      </header>
      <div class="banner"></div>
      <div class="display">
          <input type="text" v-model="guest">
      </div>
      <num-pad v-model="guest" type="number" @enter="enter" :max="999"></num-pad>
    </div>
  </div>
</template>

<script>
import numPad from "../common/numpad";
import { mapGetters, mapActions } from "vuex";
export default {
  props: ["init"],
  components: { numPad },
  data() {
    return {
      guest: 1,
      reset: true
    };
  },
  methods: {
    enter() {
      this.setTicket({ type: "DINE_IN" });
      this.setTableInfo({
        status: 2,
        session: ObjectId(),
        guest: ~~this.guest,
        server: this.op.name,
        time: +new Date(),
        invoice: []
      });
      this.resetMenu();
      this.setApp({ mode: "create" });
      this.$socket.emit("[TABLE] SETUP", this.currentTable);
      this.$router.push({ path: "/main/menu" });
    },
    ...mapActions(["setApp", "resetMenu", "setTicket", "setTableInfo"])
  },
  computed: {
    ...mapGetters(["op", "store", "currentTable"])
  }
};
</script>

<style scoped>
.window {
  background: #fff;
  text-align: center;
}

input {
  background: lightgray;
  text-align: center;
  color: #fff;
  width: 275px;
  padding: 5px 0;
  margin: 25px auto;
  font-size: 2.5em;
  border: none;
  outline: none;
  border-bottom: 2px solid gray;
  text-shadow: 0 1px 1px rgba(0, 0, 0, 0.5);
}

.table {
  float: right;
  border-bottom: 1px dotted #a3d6ff;
}
</style>
