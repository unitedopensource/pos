<template>
    <div class="popupMask dark center">
        <div class="editor">
            <header>
                <h5></h5>
                <h3>{{$t('title.creditVault')}}</h3>
            </header>
            <div class="banner"></div>
            <div class="wrap">
                <ul class="profiles">
                    <li></li>
                </ul>
                <div class="entryWrap">
                    <div class="inner">
                        <input type="text" v-model="entry">
                    </div>
                    <num-pad v-model="entry" type="number"></num-pad>
                </div>
            </div>
            <footer>
                <button class="btn" @click="init.resolve">{{$t('button.confirm')}}</button>
            </footer>
        </div>
        <div :is="component" :init="componentData"></div>
    </div>
</template>

<script>
import numPad from "../numpad";
import dialoger from "../dialoger";
export default {
  props: ["init"],
  components: { numPad, dialoger },
  data() {
    return {
      componentData: null,
      component: null,
      entry:""
    };
  },
  methods: {}
};
</script>

<style scoped>

</style>

