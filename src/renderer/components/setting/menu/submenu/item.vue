<template>
    <div>
        <div class="items">
            <div v-for="(item,index) in items" @click="edit(item)">{{item[language]}}</div>
            <div class="add" @click="create">
                <i class="fa fa-plus"></i>
            </div>
        </div>
        <div :is="component" :init="componentData"></div>
    </div>
</template>

<script>
import editor from "./editor";

export default {
  props: ["group"],
  components: { editor },
  data() {
    return {
      language: this.$store.getters.language,
      componentData: null,
      component: null,
      items: []
    };
  },
  created() {
    this.items = this.$store.getters.submenu[this.group] || [];
  },
  methods: {
    create() {
      const item = {
        zhCN: "",
        usEN: "",
        subItem: true,
        print: Object.keys(this.$store.getters.config.printers)
      };
      new Promise((resolve, reject) => {
        this.componentData = { resolve, reject, item, edit: false };
        this.component = "editor";
      })
        .then(_item => {
          this.items.push(_item);
          this.$q();
        })
        .catch(() => this.$q());
    },
    edit(item, index) {
      new Promise((resolve, reject) => {
        this.componentData = { resolve, reject, item, edit: true };
        this.component = "editor";
      })
        .then(_item => {
          this.$q();
        })
        .catch(() => this.$q());
    }
  }
};
</script>

<style scoped>

</style>