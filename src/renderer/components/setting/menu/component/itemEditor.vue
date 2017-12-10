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
        <div class="wrap">
          
        </div>
        <footer>
          <div class="opt">
            <span class="del" v-show="init.edit">{{$t('button.delete')}}</span>
          </div>
          <button class="btn" @click="confirm" :disabled="invalid">{{$t('button.done')}}</button>
        </footer>
      </div>
    </div>
</template>

<script>
export default {
  props: ["init"],
  computed: {
    invalid() {
      return true;
    }
  },
  data() {
    return {
      mode: "basic",
      language: this.$store.getters.language,
      item: JSON.parse(JSON.stringify(this.init.item))
    };
  },
  created() {
    console.log(this.init.item);
  },
  methods: {
    confirm() {}
  }
};
</script>

<style scoped>
.editor {
  width: 800px;
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
  border-bottom: 3px solid #03a9f4;
  font-weight: bold;
  color: #0f1e29;
}
</style>