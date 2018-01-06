<template>
  <div class="popupMask center dark" @click.self="init.reject">
    <div class="editor">
      <header class="title">
        <h5>{{$t('title.create')}}</h5>
        <h3>{{$t('text.openFood')}}</h3>
      </header>
      <div class="banner"></div>
      <div class="wrap">
        <inputer v-model="item" title="text.item" :autoFocus="true"></inputer>
        <inputer v-model.number="single" title="text.price" placeholder="0.00" @keydown.enter.native="confirm"></inputer>
        <inputer v-model="comment" title="text.comment" type="textarea"></inputer>
        <div class="printers">
          <label>{{$t('text.printer')}}</label>
          <div class="inner">
            <checkbox v-model="printer" v-for="(device,index) in printers" :val="device" :multiple="true" :key="index" :title="device"></checkbox>
          </div>
        </div>
      </div>
      <footer>
        <div class="opt">
          <switches title="text.osk" v-model="keyboard" :disabled="true" :reverse="true"></switches>
        </div>
        <button class="btn" @click="confirm" :disabled="!item">{{$t('button.confirm')}}</button>
      </footer>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import inputer from "../../setting/common/inputer";
import switches from "../../setting/common/switches";
import checkbox from "../../setting/common/checkbox";

export default {
  props: ["init"],
  components: { inputer, switches, checkbox },
  computed: {
    ...mapGetters(["config"])
  },
  data() {
    return {
      item: "",
      single: null,
      keyboard: false,
      printers: [],
      printer: [],
      comment: ""
    };
  },
  created() {
    const printers = Object.keys(this.config.printers).filter(
      d => !/cashier/i.test(d)
    );

    this.printers = printers.slice();
    this.printer = printers.slice();
  },
  methods: {
    confirm() {
      let item = JSON.parse(JSON.stringify(this.init.item));

      const single = isNumber(this.single) ? this.single : 0;
      const name = this.item
        ? this.item.replace(/\b[a-z]/g, t => t.toUpperCase())
        : "Open Food";

      let printer = {};

      Object.keys(this.config.printers)
        .filter(d => /cashier/i.test(d))
        .forEach(name => this.printer.push(name));

      this.printer.forEach(name => {
        printer[name] = {
          replace: false,
          zhCN: "",
          usEN: ""
        };
      });

      Object.assign(item, {
        zhCN: `* ${name} *`,
        usEN: `* ${name} *`,
        single,
        price: [single],
        comment: this.comment,
        temporary: true,
        printer,
        prices: {},
        choiceSet: []
      });

      this.comment.split(String.fromCharCode(10)).forEach(line => {
        line &&
          item.choiceSet.push({
            qty: 1,
            zhCN: line,
            usEN: line,
            single: 0,
            price: "0.00",
            key: Math.random()
              .toString(36)
              .substr(2, 6)
          });
      });

      this.addToOrder(item);
      this.setSides(Array(11).fill({ zhCN: "", usEN: "", disable: true }));
      this.init.resolve();
    },
    ...mapActions(["addToOrder", "setSides"])
  }
};
</script>