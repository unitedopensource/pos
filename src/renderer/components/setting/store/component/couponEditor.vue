<template>
    <div class="popupMask setting dark center" @click.self="init.reject(false)">
        <div class="editor">
            <header>
                <h5 v-if="init.edit">{{$t('title.edit')}}</h5>
                <h5 v-else>{{$t('title.create')}}</h5>
                <h3>{{$t('title.coupon')}}</h3>
            </header>
            <div class="wrap">
                <div class="input">
                    <inputer title="text.alias" v-model="coupon.for"></inputer>
                    <inputer title="thead.expire" v-model="coupon.expire" placeholder="YYYY-MM-DD"></inputer>
                    <inputer title="text.discount" v-model.number="coupon.discount"></inputer>
                    <switches title="text.percentage" v-model="coupon.percentage"></switches>
                    <external title="text.setCondition" :defaultStyle="false"></external>
                </div>
            </div>
            <footer>
                <div class="opt">
                    <span class="del" @click="init.reject(true)" v-show="coupon._id">{{$t('button.delete')}}</span>
                </div>
                <button class="btn" @click="confirm" :disabled="invalid">{{$t('button.confirm')}}</button>
            </footer>
        </div>
        <div :is="component" :init="componentData"></div>
    </div>
</template>

<script>
import inputer from "../../common/inputer";
import external from "../../common/external";
import switches from "../../common/switches";

export default {
  props: ["init"],
  components: { external, inputer, switches },
  data() {
    return {
      condition: false,
      component: null,
      componentData: null,
      coupon: JSON.parse(JSON.stringify(this.init.coupon))
    };
  },
  created() {
    if (this.coupon.expire) {
      this.coupon.expire = moment(this.coupon.expire).format("YYYY-MM-DD");
    }
  },
  computed: {
    invalid() {
      return !this.coupon.for || isNaN(this.coupon.discount);
    }
  },
  methods: {
    confirm() {
      this.init.resolve(this.coupon);
    }
  }
};
</script>

<style scoped>

</style>