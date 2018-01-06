<template>
  <div class="popupMask dark center" @click.self="init.reject">
    <div class="editor">
      <header>
        <h5>{{template.name}}</h5>
        <h3>{{$t('title.template')}}</h3>
      </header>
      <div class="banner"></div>
      <div class="wrap">
        <ul>
          <li v-for="(page,i) in template.contain" @click="index = i">
            <span>{{page.name}}</span>
            <i class="fa fa-caret-right"></i>
          </li>
        </ul>
        <div class="items">
          <div class="item" v-for="(item,index) in items" :key="index" @click="moreQty(item)">
            <span>{{item[language]}}</span>
            <span class="qty" @click.stop="resetQty(item,index)" v-show="item.qty > 0">{{item.qty}}</span>
          </div>
        </div>
      </div>
      <footer>
        <div class="opt">
          <checkbox title="text.insert" v-model="insert"></checkbox>
        </div>
        <button class="btn" @click="confirm">{{$t('button.confirm')}}</button>
      </footer>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import checkbox from "../../setting/common/checkbox";

export default {
  props: ["init"],
  components: { checkbox },
  computed: {
    ...mapGetters(["templates", "language"])
  },
  data() {
    return {
      template: {},
      saved: [],
      items: [],
      index: 0,
      insert: false,
      max: Infinity
    };
  },
  created() {
    const { template, max } = this.init.side;
    this.template = this.templates.find(t => t.name === template);
    this.insert = this.template.insert;
    this.initialItems();
  },
  methods: {
    initialItems(index) {
      index = index || this.index;
      const saved = this.saved[index];
      this.items = this.template.contain[index].contain.map(item => {
        if (saved) {
          const _item = saved.find(i => i.key === item.key);
          return _item ? _item : Object.assign({}, item, { qty: 0 });
        } else {
          return Object.assign({}, item, { qty: 0 });
        }
      });
      this.max =
        this.init.side.max || this.template.contain[index].max || Infinity;
    },
    saveItems(index) {
      this.saved[index] = this.items.filter(i => i.qty > 0);
    },
    moreQty(item) {
      const { autoJump } = this.template;
      let qty = this.items.map(i => i.qty).reduce((a, b) => a + b, 0);

      if (qty < this.max) item.qty++;

      qty = this.items.map(i => i.qty).reduce((a, b) => a + b, 0);

      if (autoJump && qty === this.max) {
        const maxPage = this.template.contain.length - 1;
        this.index < maxPage ? this.index++ : this.confirm();
      }
    },
    resetQty(item, index) {
      item.qty = 0;
      this.items.splice(index, 1, item);
    },
    confirm() {
      this.saveItems(this.index);
      !this.insert && this.emptyChoiceSet();

      const { skip, ignore } = this.init.side;

      this.alterItemOption({
        side: this.init.side,
        index: this.init.index,
        function: true
      });
      let items = [].concat.apply([], this.saved);
      items.forEach(item => {
        let { zhCN, usEN, qty, price, print } = item;
        qty = qty || 1;

        const content = {
          qty,
          zhCN,
          usEN,
          print,
          single: parseFloat(price),
          price: (price * qty).toFixed(2)
        };

        this.setChoiceSet(content);
      });

      this.init.resolve();
    },
    ...mapActions([
      "addChoiceSet",
      "setChoiceSet",
      "emptyChoiceSet",
      "alterItemOption"
    ])
  },
  watch: {
    index(n, o) {
      this.saveItems(o);
      this.initialItems(n);
    }
  }
};
</script>

<style scoped>
.wrap {
  display: flex;
  align-items: flex-start;
  padding: 0px;
  height: 400px;
}

.items {
  display: flex;
  flex-wrap: wrap;
  width: 496px;
}

.items .item {
  width: 120px;
}

.item .qty {
  position: absolute;
  top: 0px;
  right: 0;
  font-family: "Agency FB";
  font-weight: bold;
  font-size: 22px;
  width: 35px;
  height: 30px;
  line-height: 30px;
  display: block;
  color: #fff;
  text-shadow: 0 1px 1px #333;
}

.qty:before {
  content: "x";
}

ul {
  width: 150px;
}

li {
  padding: 15px 20px 15px 15px;
  display: flex;
  border-bottom: 1px solid #eee;
}

li span {
  flex: 1;
}
</style>