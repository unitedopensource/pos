<template>
  <transition appear name="fadeUp">
    <div class="option">
      <switches title="text.taxFree" v-model="init.taxFree"></switches>
      <switches title="text.deliveryFree" v-model="init.deliveryFree"></switches>
      <switches title="text.gratuityFree" v-model="init.gratuityFree"></switches>
      <external title="button.setDiscount" :defaultStyle="false" @open="$emit('discount')"></external>
      <external title="text.deliveryFee" :defaultStyle="false" v-if="init.type === 'DELIVERY'"></external>
    </div>
  </transition>
</template>

<script>
import switches from "../../setting/common/switches";
import external from "../../setting/common/external";

export default {
  props: ["init"],
  components: { switches, external },
  data() {
    return {
      componentData: null,
      component: null
    };
  },
  methods: {
  }
};
</script>

<style scoped>
.option {
  position: absolute;
  left: 5px;
  top: 0px;
  background: rgba(250, 250, 250, 0.8);
  width: 220px;
  height: 454px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  color: rgba(0, 0, 0, 0.75);
  padding: 0 15px;
  z-index: 1;
}

.option > div:not(:last-child) {
  border-width: 0px 0px 1px 0px;
  border-style: solid;
  border-image: linear-gradient(
      to left,
      rgba(250, 250, 250, 0.5),
      #607d8b,
      rgba(250, 250, 250, 0.5)
    )
    0 0 100%;
}

.external {
  height: 40px;
}
</style>