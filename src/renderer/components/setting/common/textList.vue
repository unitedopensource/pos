<template>
    <div class="list">
        <div class="wrap" @click="isDisplay = !isDisplay">
            <label>{{$t(title)}}</label>
            <p>{{$t(label)}}</p>
        </div>
        <transition class="menu">
            <ul v-show="isDisplay">
                <li v-for="(option,index) in opts" :key="index">
                    <input type="radio" :checked="option.value === value" @change="pick(option.value)" :id="id+index">
                    <label :for="id+index">
                        <span class="label">{{$t(option.label)}}</span>
                        <span class="tooltip">{{$t(option.tooltip)}}</span>
                    </label>
                </li>
            </ul>
        </transition>
    </div>
</template>

<script>
export default {
  props: {
    title: String,
    value: [String, Number],
    opts: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      id: Math.random()
        .toString(36)
        .substring(3, 6),
      isDisplay: false,
      label: null
    };
  },
  created() {
    this.getLabel();
  },
  methods: {
    getLabel(value = this.value) {
      let label = this.opts.find(opt => opt.value === value);
      this.label = label ? label.label : "";
    },
    pick(value) {
      this.$emit("input", value);
      this.getLabel(value);
      this.isDisplay = false;
    }
  }
};
</script>

<style scoped>
.list {
  position: relative;
  display: flex;
  padding: 5px 0;
  align-items: center;
  min-height: 40px;
  border-bottom: 1px solid #eee;
  cursor: pointer;
}

.list .wrap {
  display: flex;
  flex: 1;
  flex-direction: column;
  padding: 0px 20px;
}

.wrap label {
  cursor: pointer;
  color: #656565;
}

ul {
  position: absolute;
  left: 1px;
  background: #fff;
  width: calc(100% - 4px);
  border: 1px solid #eee;
  box-shadow: 0 4px 16px -3px rgba(0, 0, 0, 0.7);
}

li {
  display: flex;
}

li:nth-child(even) {
  background: #eee;
}

li label {
  padding: 15px 20px;
  flex: 1;
  cursor: pointer;
}
</style>