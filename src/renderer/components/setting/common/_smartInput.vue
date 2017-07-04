<template>
  <div class="input">
    <label>{{text(label)}}</label>
    <input type="text" v-model="model" :class="[validator,detect]" @blur="update" v-if="filed==='text'" @change="$emit('input',$event.target.value)">
    <label class="input-toggle" v-else-if="filed==='checkbox'">
      <input type="checkbox" v-model="model" @change="update">
      <span></span>
    </label>
    <label class="input-range" v-else-if="filed==='range'">
      <input type="range" v-model="model" @change="update" :min="min" :max="max" :step="step">
      <span>{{model}}</span>
    </label>
    <select v-model="model" @change="update" v-else-if="filed==='tax'">
      <option :value="key" v-for="(option,key) in options">{{option.alies}} : {{option.rate}}%</option>
    </select>
    <select v-model="model" @change="update" v-else>
      <option :value="option" v-for="option in options">{{option}}</option>
    </select>
    <i class="fa fa-level-down" @click="getMore" v-if="more"></i>
    <i class="fa" :class="[validator,detect]" v-if="filed === 'text'"></i>
  </div>
</template>

<script>
export default {
  props: ['type', 'options', 'label', 'name', 'value', 'reg', 'min', 'max', 'step', 'more'],
  mounted() {
    this.filed = this.type || 'text';
    this.$nextTick(() => {
      this.model = this.value
    });
  },
  data() {
    return {
      model: null,
      filed: 'text'
    }
  },
  methods: {
    update() {
      if (this.detect === 'changed' && this.validator === 'valid') {
        this.$emit("change", this.name, this.model);
      }
    },
    getMore(){
      this.$emit("extra");
    }
  },
  computed: {
    validator() {
      if (!this.reg) return "valid";
      let regEx = new RegExp(this.reg);
      return regEx.test(this.model) ? "valid" : "invalid";
    },
    detect() {
      return this.value === this.model ? "unchange" : "changed";
    }
  },
  watch: {
    value(n) {
      this.model = n;
    }
  }
}
</script>

<style scoped>
.input label {
  display: inline-block;
  color: #424242;
  text-indent: 1em;
  width: 145px;
}

.input input[type="text"] {
  border: none;
  padding: 7px 0;
  font-size: 1em;
  flex: 6;
}

input.changed {
  color: #03A9F4;
}

input.invalid {
  color: red;
}

.input i {
  width: 65px;
  text-align: center;
}

i.valid.unchange {
  color: #4CAF50;
}

i.valid.changed {
  color: #9E9E9E;
}

i.valid::before {
  content: '\f05d';
}

i.invalid {
  color: #F44336;
}

i.invalid::before {
  content: '\f05c'
}

.input select {
  padding: 7px 0;
  border: none;
  font-size: 1em;
  flex: 1;
  outline: none;
  -webkit-appearance: none;
}

label.input-range {
  padding: 6.5px;
  display: inline-flex;
  flex: 6;
}

label.input-range span {
  border: 1px solid #ccc;
  text-align: center;
  text-indent: 0;
  padding: 0 10px;
  margin-left: 12px;
  border-radius: 4px;
  background: #ECEFF1;
  color: #333;
  width: 50px;
}

input[type="range"] {
  width: 500px;
  -webkit-appearance: none;
}

input[type="range"]:focus {
  outline: none;
}

input[type=range]::-webkit-slider-runnable-track {
  width: 100%;
  height: 5px;
  cursor: pointer;
  background: #B3E5FC;
  border-radius: 10px;
  transition: background 0.22s linear;
}

input[type=range]:focus::-webkit-slider-runnable-track {
  background: #03A9F4;
}

input[type=range]::-webkit-slider-thumb {
  border: 5px solid #fff;
  height: 21px;
  width: 21px;
  border-radius: 50%;
  background: #fff;
  cursor: pointer;
  -webkit-appearance: none;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
  margin-top: -7px;
}
</style>
