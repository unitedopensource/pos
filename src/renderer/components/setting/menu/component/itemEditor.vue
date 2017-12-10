<template>
    <div class="popupMask setting dark center">
      <div class="editor">
        <header>
          <div>
            <h5 v-if="init.edit">{{$t('title.edit')}}</h5>
            <h5 v-else>{{$t('title.create')}}</h5>
            <h3>{{item[language]}}</h3>
          </div>
          <nav>
            <div>
              <input type="radio" v-model="mode" value="basic" name="tab" id="basic">
              <label for="basic">{{$t('text.itemInfo')}}</label>
            </div>
            <div>
              <input type="radio" v-model="mode" value="advance" name="tab" id="advance">
              <label for="advance">{{$t('text.advance')}}</label>
            </div>
          </nav>
        </header>
        <template v-if="mode === 'basic'">
          <div class="wrap">
            <div class="item">
              <inputer title="text.menuID" v-model="item.menuID"></inputer>
              <selector title="text.category" v-model="item.category" :opts="init.categories" :ediable="false"></selector>
              <inputer title="text.primary" v-model="item.usEN"></inputer>
              <inputer title="text.secondary" v-model="item.zhCN"></inputer>
              <inputer title="text.basePrice" v-model.number="item.price" @keydown.native="save"></inputer>
              <selector title="text.taxClass" v-model="item.taxClass" :opts="taxes" :ediable="false"></selector>
            </div>
            <div class="side">

            </div>
          </div>
        </template>
        <template v-else>
          <div class="wrap">

          </div>
        </template>
        <footer>
          <div class="opt">
            <span class="del" v-show="init.edit" @click="init.reject(true)">{{$t('button.delete')}}</span>
            <p v-if="deprecated"><i class="fa fa-warning"></i>{{$t('tip.deprecated.priceArray')}}</p>
          </div>
          <button class="btn" @click="init.reject(false)">{{$t('button.back')}}</button>
          <button class="btn" @click="save" :disabled="invalid">{{$t('button.save')}}</button>
        </footer>
      </div>
    </div>
</template>

<script>
import inputer from "../../common/inputer";
import selector from "../../common/selector";
export default {
  props: ["init"],
  components: { inputer, selector },
  computed: {
    invalid() {
      return true;
    }
  },
  data() {
    return {
      mode: "basic",
      deprecated: false,
      language: this.$store.getters.language,
      item: JSON.parse(JSON.stringify(this.init.item)),
      taxes: Object.keys(this.$store.getters.tax.class).map(name => ({
        label: this.$store.getters.tax.class[name].alies,
        tooltip: this.$store.getters.tax.class[name].rate + " %",
        plainText: true,
        value: name
      }))
    };
  },
  created() {
    Array.isArray(this.init.item.price) && (this.deprecated = true);
    this.initialData();
  },
  methods: {
    initialData() {},
    save() {
      console.log("trigger")
    }
  }
};
</script>

<style scoped>
.editor {
  width: 700px;
}

header {
  flex-direction: row;
  justify-content: flex-start;
}

nav {
  display: flex;
  height: 45px;
  flex: 1;
  justify-content: flex-end;
  align-items: center;
}

nav label {
  padding: 13px;
  min-width: 60px;
  display: flex;
  margin: 0 5px;
  justify-content: center;
  cursor: pointer;
  color: #656565;
  border-bottom: 3px solid transparent;
}

input:checked + label {
  border-bottom: 3px solid #ff9800;
  font-weight: bold;
  color: #0f1e29;
}

.wrap {
  display: flex;
}

p {
  margin-left: 2em;
}

p i {
  color: #ff9800;
  margin-right: 5px;
}
</style>