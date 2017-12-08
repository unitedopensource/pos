<template>
    <div class="popupMask setting dark center" @click.self="init.reject(false)">
        <div class="editor">
            <header>
                <h5 v-if="init.edit">{{$t('title.edit')}}</h5>
                <h5 v-else>{{$t('title.create')}}</h5>
                <h3>{{$t('title.taxEditor')}}</h3>
            </header>
            <div class="wrap">
                <div class="input">
                    <inputer title="text.alias" v-model="coupon.for"></inputer>
                    <inputer title="text.discount" v-model="coupon.discount"></inputer>
                    <inputer title="thead.expire" v-model="coupon.expire" placeholder="YYYY-MM-DD"></inputer>
                </div>
                <div class="options">
                    
                </div>
            </div>
            <footer>
                <div class="opt">
                    <span class="del" @click="init.reject(true)" v-show="coupon._id">{{$t('button.delete')}}</span>
                </div>
                <button class="btn" @click="confirm">{{$t('button.confirm')}}</button>
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
      coupon: JSON.parse(JSON.stringify(this.init.coupon))
    };
  },
  created() {
    if (this.coupon.expire) {
      this.coupon.expire = moment(this.coupon.expire).format("YYYY-MM-DD");
    }
  },
  methods: {
    confirm() {}
  }
};
</script>

<style scoped>

</style>