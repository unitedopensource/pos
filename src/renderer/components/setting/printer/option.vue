<template>
    <div>
        <header class="nav">
            <router-link tag="div" :to="{name:'Setting.printer.config',params:{printer}}" class="back">
                <i class="fa fa-chevron-left"></i>
            </router-link>
        </header>
        <checkbox v-for="(opt,index) in opts" :key="opt" v-model="print" :val="opt.value" :label="opt.label" :multiple="true" class="list"></checkbox>
    </div>
</template>

<script>
import checkbox from "../common/checkbox";

export default {
  props: ["printer", "obj"],
  components: { checkbox },
  data() {
    return {
      opts: [
        {
          label: "type.WALK_IN",
          value: "WALK_IN"
        },
        {
          label: "type.PICK_UP",
          value: "PICK_UP"
        },
        {
          label: "type.DELIVERY",
          value: "DELIVERY"
        },
        {
          label: "type.DINE_IN",
          value: "DINE_IN"
        },
        {
          label: "type.BAR",
          value: "BAR"
        },
        {
          label: "type.BUFFET",
          value: "BUFFET"
        },
        {
          label: "type.SALES",
          value: "SALES"
        },
        {
          label: "type.TO_GO",
          value: "TO_GO"
        }
      ],
      print: []
    };
  },
  created() {
    console.log(this.printer, this.obj);
    this.print = this.$store.getters.config.printers[this.printer][this.obj];
  },
  beforeDestroy() {
    Object.assign(this.$store.getters.config.printers[this.printer], {
      [this.obj]: this.print
    });
    
    this.$socket.emit("[CONFIG] UPDATE", {
      key: `printers.${this.printer}.${this.obj}`,
      value: this.print
    });
  }
};
</script>

<style scoped>
.checkbox.list {
  border-bottom: 1px solid #eee;
  margin: 0;
  height: 40px;
  padding-left: 30px;
}
</style>