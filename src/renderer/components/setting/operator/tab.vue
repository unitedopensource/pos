<template>
  <div>
    <ul class="tabs">
      <router-link tag="li" class="tab" :to="{name:'Setting.operator'}">{{$t('nav.list')}}</router-link>
      <template v-if="operator">
        <router-link tag="li" class="tab" :to="{name:'Setting.operator.config',params:{operator}}">{{$t('nav.permission')}}</router-link>
      </template>
    </ul>
    <transition name="slide" mode="out-in">
      <router-view class="tab-content" @set="setOperator"></router-view>
    </transition>
  </div>
</template>

<script>
export default {
  data() {
    return {
      operator: null
    };
  },
  methods: {
    setOperator(name) {
      this.operator = name;
      this.$router.push({
        name: "Setting.operator.config",
        params: { operator: name }
      });
    }
  }
};
</script>