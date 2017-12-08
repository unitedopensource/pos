<template>
    <div class="popupMask setting center dark" @click.self="init.reject(false)">
        <div class="editor">
            <header>
                <h5 v-if="init.edit">{{$t('title.create')}}</h5>
                <h5 v-else>{{$t('title.edit')}}</h5>
                <h3>{{$t('title.taxEditor')}}</h3>
            </header>
            <div class="wrap">
                <div class="input">
                    <inputer title="text.alias" v-model="tax.alias"></inputer>
                    <inputer title="text.taxRate" v-model.number="tax.rate"></inputer>
                </div>
                <div class="options">
                    <label class="title">{{$t('text.apply')}}</label>
                    <div class="inner">
                        <checkbox v-model="tax.apply.WALK_IN" label="type.WALK_IN"></checkbox>
                        <checkbox v-model="tax.apply.PICK_UP" label="type.PICK_UP"></checkbox>
                        <checkbox v-model="tax.apply.DELIVERY" label="type.DELIVERY"></checkbox>
                        <checkbox v-model="tax.apply.DINE_IN" label="type.DINE_IN"></checkbox>
                        <checkbox v-model="tax.apply.BUFFET" label="type.BUFFET"></checkbox>
                        <checkbox v-model="tax.apply.TO_GO" label="type.TO_GO"></checkbox>
                        <checkbox v-model="tax.apply.BAR" label="type.BAR"></checkbox>
                        <checkbox v-model="tax.apply.SALES" label="type.SALES"></checkbox>
                    </div>
                </div>
            </div>
            <footer>
                <div class="opt">
                    <span class="del" @click="init.reject(true)">{{$t('button.delete')}}</span>
                </div>
                <button class="btn" @click="confirm" :disabled="invalid">{{$t('button.confirm')}}</button>
            </footer>
        </div>
    </div>
</template>

<script>
import inputer from "../../common/inputer";
import checkbox from "../../common/checkbox";
export default {
  props: ["init"],
  components: { inputer, checkbox },
  data() {
    return {
      tax: JSON.parse(JSON.stringify(this.init.tax))
    };
  },
  computed: {
    invalid() {
      return !this.tax.alias || isNaN(this.tax.rate);
    }
  },
  methods: {
    confirm() {
      this.init.resolve(this.tax);
    }
  }
};
</script>

<style scoped>
.options {
  display: flex;
  flex-wrap: wrap;
  padding: 5px 0;
  align-items: center;
}

.options > div {
  width: 120px;
}

label.title {
  min-width: 80px;
}

.inner {
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  border: 1px solid #eee;
  padding: 5px 0;
  background: #fff;
  border-radius: 4px;
}

.inner > div {
  width: 114px;
}
</style>