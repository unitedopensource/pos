<template>
    <div class="popupMask setting dark center">
      <div class="editor">
        <header>
          <h5>{{$t('title.edit')}}</h5>
          <h3>{{$t('title.categoryEditor')}}</h3>
        </header>
        <div class="wrap">
          <inputer title="text.primary" v-model="category.usEN"></inputer>
          <inputer title="text.secondary" v-model="category.zhCN"></inputer>
          <inputer title="text.primary" v-model="category.usEN"></inputer>
          <div class="options">
            <label class="title"></label>
            <div class="inner">

            </div>
          </div>
        </div>
        <footer>
          <button class="btn" @click="confirm">{{$t('button.done')}}</button>
        </footer>
      </div>
    </div>
</template>

<script>
import inputer from "../../common/inputer";
export default {
  props: ["init"],
  components: { inputer },
  data() {
    return {
      categories: [],
      category: JSON.parse(JSON.stringify(this.init.category))
    };
  },
  beforeRouteEnter: (to, from, next) => {
    appSocket.emit("[CATEGORY] LIST", data => {
      next(vm => {
        vm.categories = data;
      });
    });
  },
  methods: {
    confirm() {}
  }
};
</script>

<style scoped>

</style>