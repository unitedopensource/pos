<template>
  <div class="popupMask center dark" @dblclick.self="exit">
    <div class="dialog" :class="[init.type]">
      <i class="fa"></i>
      <h3>{{title}}</h3>
      <h5>{{msg}}</h5>
      <footer>
        <div class="btn" v-for="(button,index) in init.buttons" @click="trigger(button)" :key="index">{{$t(button.text)}}</div>
      </footer>
    </div>
  </div>
</template>

<script>
export default {
  props: ['init'],
  data() {
    return {
      title: "",
      msg: ""
    }
  },
  created() {
    this.title = typeof this.init.title === 'string' ? this.$t(this.init.title) : this.$t(...this.init.title);
    this.msg = typeof this.init.msg === 'string' ? this.$t(this.init.msg) : this.$t(...this.init.msg);
  },
  mounted() {
    if (this.init.timeout) this.timeout = setTimeout(() => { this.init.timeout.fn() }, this.init.timeout.duration);
  },
  methods: {
    trigger(button) {
      clearTimeout(this.timeout);
      typeof button.fn === "function" ?
        button.fn() :
        eval(button.fn);
    },
    exit() {
      clearTimeout(this.timeout);
      this.init.resolve() || this.$parent.$q();
    }
  }
}
</script>

<style scoped>
.dialog {
  width: 550px;
  height: 320px;
  background: #fff;
  position: relative;
  text-align: center;
}

.dialog.alert {
  border-top: 2px solid #FF9800;
}

.dialog.warning {
  border-top: 2px solid #F44336;
}

.dialog.success {
  border-top: 2px solid #13ce66;
}

.dialog.question {
  border-top: 2px solid #8BC34A;
}

.dialog.info {
  border-top: 2px solid #FFA726;
}

.dialog.error {
  border-top: 2px solid #f51900;
}

i {
  font-size: 96px;
  text-shadow: 0 1px 1px rgba(0, 0, 0, 0.3);
  margin: 20px 0 35px;
}

.alert i::before {
  content: '\F06a';
  color: #FFCA28;
}

.question i::before {
  content: '\F059';
  color: #8BC34A;
}

.warning i::before {
  content: '\F071';
  color: #F44336;
}

.success i::before {
  content: '\F05d';
  color: #13ce66;
}

.info i::before {
  content: '\F05a';
  color: #FFA726;
}

.error i::before {
  content: '\f12a';
  color: #f51900;
}

footer {
  background: #f5f5f5;
  display: flex;
  position: absolute;
  bottom: 0;
  width: 100%;
}

footer .btn {
  flex: 1;
  margin: 10px;
}

h3 {
  font-size: 32px;
  color: #333;
  text-shadow: none;
}

h5 {
  color: #666;
  margin-top: 5px;
  font-size: 13.3px;
  text-shadow: none;
  font-weight: normal;
}
</style>
