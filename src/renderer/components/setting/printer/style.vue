<template>
    <div>
        <header class="nav">
            <router-link tag="div" :to="{name:'Setting.printer.config',params:{printer}}" class="back">
                <i class="fa fa-chevron-left"></i>
            </router-link>
            <nav>
                <span class="add">{{$t('button.default')}}</span>
            </nav>
        </header>

    </div>
</template>

<script>
export default {
  props: ["printer"],
  data() {
    return {
      style: {}
    };
  },
  created() {
    this.style = this.$store.getters.config.printers[this.printer].style;

  },
  methods: {}
};
</script>

<style scoped>

</style>