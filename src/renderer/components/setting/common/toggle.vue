<template>
    <div class="toggle">
      <div class="wrap">
        <label class="label">
            <span class="title">{{$t(title)}}</span>
            <span class="tooltip" v-if="tooltip">{{$t(tooltip)}}</span>
            <span class="tooltip" v-else-if="conditionalTooltip">{{$t(dynamicTooltip)}}</span>
        </label>
        <label class="input-toggle">
            <input type="checkbox" :checked="value" @change="$emit('input',$event.target.checked)">
            <span></span>
        </label>
      </div>
      <slot></slot>
    </div>
</template>

<script>
export default {
  props: {
    value: Boolean,
    title: String,
    tooltip: String,
    trueTooltip: String,
    falseTooltip: String,
    conditionalTooltip: Boolean
  },
  data() {
    return {
      dynamicTooltip: ""
    };
  },
  created() {
    if (this.conditionalTooltip)
      this.dynamicTooltip = this.value ? this.trueTooltip : this.falseTooltip;
  },
  watch: {
    value(n) {
      if (this.conditionalTooltip)
        this.dynamicTooltip = n ? this.trueTooltip : this.falseTooltip;
    }
  }
};
</script>

<style scoped>
.toggle {
  border-bottom: 1px solid #eee;
}
.wrap {
  display: flex;
  justify-content: center;
  min-height: 50px;
}

.label {
  display: flex;
  flex-direction: column;
  justify-content: center;
  flex: 1;
  padding: 5px 20px;
}

.input-toggle {
  width: 80px;
}
</style>