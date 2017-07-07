<template>
  <div class="request">
    <section class="content">
      <div class="category">
        <div v-for="category in request" @click="getItems(category)">{{category[language]}}</div>
      </div>
      <div class="prefix">
        <div v-for="(action,index) in actions" @click="getPrefix(action,$event)" :key="index">{{action[language]}}</div>
      </div>
      <div class="item">
        <div v-for="item in items" @click="setChoice(item)" :class="{disable:!item.clickable}">{{item[language]}}</div>
      </div>
      <div class="shortCut">
        <div @click="setPrice(0.50)">$0.50</div>
        <div @click="setPrice(0.75)">$0.75</div>
        <div @click="setPrice(1.00)">$1.00</div>
        <div @click="setPrice(1.25)">$1.25</div>
        <div @click="setPrice(1.50)">$1.50</div>
        <div @click="setPrice(1.75)">$1.75</div>
        <div @click="setPrice(2.00)">$2.00</div>
        <div @click="setPrice(2.50)">$2.50</div>
        <div @click="setPrice(3.00)">$3.00</div>
        <div @click="setPrice(4.00)">$4.00</div>
        <div @click="setPrice()">{{text('SELF_INPUT_PRICE')}}</div>
      </div>
    </section>
    <div :is="component" :init="componentData"></div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import modify from './modify'
export default {
  mounted() {
    this.items = [].concat.apply([], this.request[0].item);
  },
  data() {
    return {
      items: [],
      prefix: null,
      component: null,
      componentData: null
    }
  },
  methods: {
    getItems(category) {
      this.items = [].concat.apply([], category.item);
    },
    getPrefix(action, e) {
      let dom = document.querySelector('.acting');
      dom && dom.classList.remove('acting');
      this.prefix = action;
      e.currentTarget.classList.add("acting");

    },
    setChoice(item) {
      if (!item.clickable) return;

      let content = {
        qty: 1,
        zhCN: this.prefix ? this.prefix.zhCN + item.zhCN : item.zhCN,
        usEN: this.prefix ? this.prefix.usEN + " " + item.usEN : item.usEN,
        single: parseFloat(item.price),
        price: item.price
      }
      this.prefix = null;
      this.setChoiceSet(content);
      let dom = document.querySelector('.acting');
      dom && dom.classList.remove('acting');
    },
    setPrice(total) {
      total ?
        this.setPriceForChoiceSet({ total }) :
        new Promise((resolve, reject) => {
          this.componentData = {
            name: this.text('SELF_INPUT_PRICE'),
            qty: 1,
            single: "0.00",
            discount: "0.00",
            total: "0.00",
            resolve, reject
          };
          this.component = "modify";
        }).then(resolve => {
          this.setPriceForChoiceSet({
            single: resolve.single,
            total: resolve.total,
            qty: resolve.qty
          });
          this.exitComponent();
        }).catch(reject => {
          this.exitComponent();
        })
    },
    exitComponent() {
      this.component = null;
      this.componentData = null;
    },
    exit() {
      this.$emit("exit");
    },
    redo() {
      this.$emit("redo");
    },
    ...mapActions(['setChoiceSet', 'setPriceForChoiceSet', 'setChoiceSetTarget'])
  },
  computed: {
    ...mapGetters(['request', 'language', 'actions'])
  },
  components: {
    modify
  }
}
</script>

<style scoped>
.request {
  display: flex;
  flex-direction: row;
  position: absolute;
  left: 0;
}

.request .content {
  background: url(../../assets/image/grid.png) #fcfcfc;
  display: flex;
  flex-direction: row;
  width: 739px;
}

div.category,
div.prefix {
  width: 142px;
}

.category div,
div.prefix div {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  margin: 1px;
  vertical-align: top;
  font-size: 1.15em;
  height: 62.5px;
  width: 138px;
}

.category div {
  border: 1px solid #2196F3;
  background: #29B6F6;
}

.prefix div {
  border: 1px solid #A1887F;
  background: rgba(66, 58, 55, 0.3);
}

.prefix div.acting {
  background: #FFB74D;
  color: #fff;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
}

div.item {
  width: 342px;
}

div.item div:hover {
  transition: background 0.22s linear;
}

div.item div:active {
  background: rgba(166, 195, 201, 0.55);
}

div.item div {
  display: inline-flex;
  flex-wrap: nowrap;
  justify-content: center;
  align-items: center;
  height: 62.5px;
  width: calc(33% - 3px);
  border: 1px solid #78909c;
  background: #92aaaf;
  margin: 1px;
  vertical-align: top;
  font-size: 1.15em;
  text-align: center;
}

.item .disable {
  background: rgba(166, 195, 201, 0.55);
}

div.shortCut {
  width: 114px;
}

div.shortCut div {
  display: inline-flex;
  width: 111px;
  height: 62.5px;
  margin: 1px;
  vertical-align: top;
  font-size: 1.15em;
  border: 1px solid gray;
  background: rgba(206, 206, 206, 0.66);
  justify-content: center;
  align-items: center;
}
</style>
