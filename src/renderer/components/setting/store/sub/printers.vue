<template>
    <div>
        <header class="nav">
            <div class="back" @click="save">
            <i class="fa fa-chevron-left"></i>
            </div>
            <nav></nav>
        </header>
        <ul class="multiple">
            <li v-for="(printer,index) in printers" :key="index">
                <checkbox :val="printer" :multiple="true" :label="printer" v-model="devices"></checkbox>
            </li>
        </ul>
    </div>
</template>

<script>
import checkbox from "../../common/checkbox";
export default {
  components: { checkbox },
  data() {
    return {
      printers: Object.keys(this.$store.getters.config.printers).filter(
        name => !/cashier/i.test(name)
      ),
      devices: []
    };
  },
  methods: {
    save() {
      this.$socket.emit("[UPDATE] STATION", {
        _id: this.$store.getters.station._id,
        key: "printers",
        value: this.devices
      });
      this.$router.push({ name: "Setting.station" });
    }
  }
};
</script>

<style scoped>
li {
  display: flex;
  border-bottom: 1px solid #eee;
}
</style>