<template>
    <div>
        <div v-html="ticket" class="receipt" @click="fn"></div>
        <button class="btn print" @click="print">{{$t('button.print')}}</button>
    </div>
</template>

<script>
export default {
  props: ["init"],
  created() {
    this.ticket = Printer.preview(this.init.ticket);
  },
  data() {
    return {
      ticket: null
    };
  },
  methods: {
    fn() {
      this.init.exit && this.init.resolve();
    },
    print() {
      Printer.setTarget("Receipt").print(this.init.ticket);
    }
  }
};
</script>

<style scoped>
.receipt {
  background: #fff;
  width: 280px;
  padding: 35px 20px 5px;
  box-shadow: 0 1px 8px rgba(0, 0, 0, 0.5);
}

.print {
  position: fixed;
  left: 0;
  right: 0;
  margin: auto;
  padding: 15px;
  bottom: 30px;
}
</style>