<template>
  <div class="popupMask setting dark center" @click.self="init.reject(false)">
    <div class="editor">
      <header>
        <div>
          <h5>{{$t('title.edit')}}</h5>
          <h3>{{$t('title.category')}}</h3>
        </div>
        <nav class="tabs">
          <div>
            <input type="radio" v-model="tab" value="basic" name="tab" id="basic">
            <label for="basic">{{$t('setting.basic')}}</label>
          </div>
          <div>
            <input type="radio" v-model="tab" value="print" name="tab" id="print" :disabled="!Array.isArray(category.contain)">
            <label for="print">{{$t('setting.print')}}</label>
          </div>
        </nav>
      </header>
      <template v-if="tab === 'basic'">
        <div class="wrap">
          <inputer title="text.primary" v-model.trim="category.usEN" length="19"></inputer>
          <inputer title="text.secondary" v-model.trim="category.zhCN" length="19"></inputer>
          <inputer title="text.contain" v-model="category.contain" v-if="manual"></inputer>
          <div class="checkboxes" v-else>
            <checkbox :title="name" v-model="category.contain" :val="name" v-for="(name,index) in categories" :key="index" :multiple="true" :translate="false"></checkbox>
          </div>
        </div>
      </template>
      <template v-else>
        <div class="wrap">
          <div v-for="(category,index) in category.contain" :key="index">
            <h3>{{category}}</h3>
            <div class="checkboxes">
              <checkbox v-model="print[index]" v-for="(printer,idx) in printers" :title="printer" :val="printer" :key="idx" :multiple="true"></checkbox>
            </div>
          </div>
        </div>
      </template>
      <footer>
        <div class="opt">
          <switches title="text.manualInput" v-model="manual" :reverse="true"></switches>
        </div>
        <button class="btn" @click="confirm" v-if="tab === 'basic'">{{$t('button.done')}}</button>
        <button class="btn" @click="update" v-else>{{$t('button.apply')}}</button>
      </footer>
    </div>
  </div>
</template>

<script>
import inputer from "../../common/inputer";
import checkbox from "../../common/checkbox";
import switches from "../../common/switches";

export default {
  props: ["init"],
  components: { inputer, checkbox, switches },
  data() {
    return {
      tab: "basic",
      manual: false,
      categories: this.init.categories,
      category: JSON.parse(JSON.stringify(this.init.category)),
      printers: Object.keys(this.$store.getters.config.printers),
      print: []
    };
  },
  methods: {
    confirm() {
      !Array.isArray(this.category.contain) &&
        (this.category.contain = this.category.contain.split(","));

      this.category.item = [];
      this.init.resolve(this.category);
    },
    update() {
      this.tab = "basic";
      const printers = this.print;
      const categories = this.category.contain;

      this.$socket.emit("[CATEGORY] PRINTER", { categories, printers });
    }
  }
};
</script>

<style scoped>
header {
  flex-direction: row;
  justify-content: flex-start;
}
</style>