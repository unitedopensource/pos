<template>
    <div class="popupMask setting dark center" @click.self="init.reject(false)">
        <div class="editor">
            <header>
              <div>
                <h5 v-if="init.edit">{{$t('title.edit')}}</h5>
                <h5 v-else>{{$t('title.create')}}</h5>
                <h3>{{$t('title.coupon')}}</h3>
              </div>
              <nav class="tabs">
                <div>
                  <input type="radio" v-model="tab" value="basic" name="tab" id="basic">
                  <label for="basic">{{$t('setting.basic')}}</label>
                </div>
                <div>
                  <input type="radio" v-model="tab" value="condition" name="tab" id="condition">
                  <label for="condition">{{$t('setting.condition')}}</label>
                </div>
              </nav>
            </header>
            <template v-if="tab === 'basic'">
              <div class="wrap">
                <div class="input">
                    <selector title="text.type" v-model="coupon.type" :opts="opts"></selector>
                    <inputer title="text.alias" v-model="coupon.alias"></inputer>
                    <inputer title="text.amount" v-model.number="coupon.discount"></inputer>
                    <switches title="text.percentage" v-model="coupon.percentage"></switches>
                    <switches title="text.couponStack" v-model="coupon.stack"></switches>
                    <toggle v-model="coupon.expire.enable" title="text.expiration" :defaultStyle="false">
                      <transition name="dropdown">
                        <div class="opt" v-if="coupon.expire.enable">
                          <inputer title="thead.count" v-model.number="coupon.expire.count"></inputer>
                          <inputer title="thead.expire" v-model="coupon.expire.date" placeholder="YYYY-MM-DD"></inputer>
                        </div>
                      </transition>
                    </toggle>
                </div>
            </div>
            </template>
            <template v-else-if="tab === 'condition'">
              <div class="wrap wide">
                  
              </div>
            </template>
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
import toggle from "../../common/toggle";
import inputer from "../../common/inputer";
import external from "../../common/external";
import switches from "../../common/switches";
import selector from "../../common/selector";

export default {
  props: ["init"],
  components: { external, inputer, switches, toggle, selector },
  data() {
    return {
      tab: "basic",
      condition: false,
      component: null,
      componentData: null,
      coupon: JSON.parse(JSON.stringify(this.init.coupon)),
      opts: [{
        label: this.$t('type.subtraction'),
        tooltip: 'tip.coupon.subtraction',
        value: 'subtraction'
      }, {
        label: this.$t('type.giveaway'),
        tooltip: 'tip.coupon.giveaway',
        value: 'giveaway'
      }, {
        label: this.$t('type.voucher'),
        tooltip: 'tip.coupon.voucher',
        value: 'voucher'
      }, {
        label: this.$t('type.discount'),
        tooltip: 'tip.coupon.discount',
        value: 'discount'
      }, {
        label: this.$t('type.complimentary'),
        tooltip: 'tip.coupon.complimentary',
        value: 'complimentary'
      }]
    };
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
header {
  flex-direction: row;
}

.wrap.wide {
  width: 650px;
}
</style>