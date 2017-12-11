<template>
    <div class="popupMask setting dark center" @click.self="init.reject(false)">
      <div class="editor">
        <header>
          <h5>{{$t('title.edit')}}</h5>
          <h3>{{$t('title.categoryEditor')}}</h3>
        </header>
        <div class="wrap">
          <inputer title="text.primary" v-model="category.usEN" length="19"></inputer>
          <inputer title="text.secondary" v-model="category.zhCN" length="19"></inputer>
          <inputer title="text.contain" v-model="category.contain" v-if="manual"></inputer>
          <div class="options" v-else>
            <checkbox :label="name" v-model="category.contain" :val="name" v-for="(name,index) in categories" :key="index" :multiple="true"></checkbox>
          </div>
        </div>
        <footer>
          <div class="opt">
            <switches title="text.manualInput" v-model="manual" :reverse="true"></switches>
          </div>
          <button class="btn" @click="confirm">{{$t('button.done')}}</button>
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
      manual: false,
      categories: this.init.categories,
      category: JSON.parse(JSON.stringify(this.init.category))
    };
  },
  methods: {
    confirm() {
      !Array.isArray(this.category.contain) &&
        (this.category.contain = this.category.contain.split(","));

      this.category.item = [];
      this.$socket.emit(
        "[CATEGORY] UPDATE",
        {
          category: this.category,
          index: this.init.index
        },
        () => {
          this.init.resolve();
        }
      );
    }
  }
};
</script>

<style scoped>
.options {
  margin-top: 5px;
  border: 1px solid #eee;
  background: #fff;
  border-radius: 2px;
  width: 540px;
  display: flex;
  flex-wrap: wrap;
  padding: 5px;
}

.options .checkbox {
  width: 170px;
}
</style>