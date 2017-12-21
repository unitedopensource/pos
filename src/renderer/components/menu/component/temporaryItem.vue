<template>
  <div class="popupMask center dark" @click.self="init.reject">
    <div class="editor">
      <header class="title">
        <h5></h5>
        <h3>{{$t('text.openFood')}}</h3>
      </header>
      <div class="banner"></div>
      <div class="wrap">
        <inputer v-model="item" title="text.item" :autoFocus="true"></inputer>
        <inputer v-model.number="single" title="text.price" placeholder="0.00" @keydown.enter.native="confirm"></inputer>
        <inputer v-model="comment" title="text.comment" type="textarea"></inputer>
      </div>
      <footer>
        <div class="opt">
          <switches title="text.osk" v-model="keyboard" :disabled="true" :reverse="true"></switches>
        </div>
        <div class="btn" @click="confirm">{{$t('button.confirm')}}</div>
      </footer>
    </div>
  </div>
</template>

<script>
import { mapActions } from "vuex";
import inputer from "../../setting/common/inputer";
import switches from "../../setting/common/switches";

export default {
  props: ["init"],
  components: { inputer,switches },
  data() {
    return {
      item: "",
      single: null,
      keyboard:false,
      comment: ""
    };
  },
  methods: {
    confirm() {
      let item = JSON.parse(JSON.stringify(this.init.item));

      const single = isNumber(this.single) ? this.single : 0;
      const name = this.item
        ? this.item.replace(/\b[a-z]/g, t => t.toUpperCase())
        : "Open Food";

      Object.assign(item, {
        zhCN: `* ${name} *`,
        usEN: `* ${name} *`,
        single,
        price: [single],
        comment: this.comment,
        temporary: true,
        prices: {}
      });

      this.addToOrder(item);
      this.setSides(Array(11).fill({ zhCN: "", usEN: "", disable: true }));
      this.init.resolve();
    },
    ...mapActions(["addToOrder", "setSides"])
  }
};
</script>