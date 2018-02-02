<template>
    <div>
        <header class="nav">
            <div class="back" @click="$router.push({ name: 'Setting.store.payment' })">
                <i class="fa fa-chevron-left"></i>
            </div>
            <div class="title">{{$t('title.deliveryRelated')}}</div>
            <nav>
                <span>{{$t('button.create')}}</span>
            </nav>
        </header>
        <toggle title="setting.deliveryTax" tooltip="tip.deliveryTax" v-model="tax.deliveryTax" @update="updateDeliveryTax"></toggle>
        <toggle title="setting.deliveryCharge" true-tooltip="tip.deliveryCharge" false-tooltip="tip.deliveryFree" v-model="store.deliver.charge" :conditionalTooltip="true" @update="updateDelivery">
            <transition name="dropdown">
                <div class="opt" v-if="store.deliver.charge">
                    <inputer title="text.amount" v-model.number="store.deliver.baseFee" @update="updateDeliveryFee"></inputer>
                </div>
            </transition>
        </toggle>
        <toggle title="setting.deliverySurcharge" v-model="store.deliver.surcharge" :disabled="true">
            <transition name="dropdown">
                <div v-if="store.delivery.surcharge">
                    <table class="setting">
                        <thead>
                            <tr>
                                <th>{{$t('thead.condition')}}</th>
                                <th>{{$t('thead.amount')}}</th>
                                <th></th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(rule,index) in store.deliver.rules" :key="index">
                                <td class="guest">{{$t('text.distance',rule.distance)}}</td>
                                <td class="amount">$ {{rule.fee | decimal}}</td>
                                <td @click="edit(rule,index)" class="opt" colspan="2">
                                    <i class="fa fa-pencil-square"></i>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </transition>
        </toggle>
        <div :is="component" :init="componentData"></div>
    </div>
</template>

<script>
import { mapGetters } from "vuex";
import toggle from "../../common/toggle";
import inputer from "../../common/inputer";

export default {
  components: { toggle, inputer },
  computed: {
    ...mapGetters(["config", "tax"])
  },
  data() {
    return {
      store: null,
      component: null,
      componentData: null
    };
  },
  created() {
    this.store = Object.assign({}, this.config.store);
  },
  methods: {
    update(data) {
      this.$socket.emit("[CONFIG] UPDATE", data);
    },
    updateDelivery(value) {
      this.update({
        key: "store.deliver.charge",
        value
      });
    },
    updateDeliveryFee(value) {
      this.update({
        key: "store.deliver.baseFee",
        value:parseFloat(value)
      });
    },
    updateDeliveryTax(value) {
      this.update({
        key: "tax.deliveryTax",
        value
      });
    },
    create() {},
    edit() {}
  }
};
</script>