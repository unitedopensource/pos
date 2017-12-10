<template>
    <div class="switches">
        <label class="label">{{$t(title)}}</label>
        <label class="input-toggle">
            <input type="checkbox" :checked="value" @change="$emit('input',$event.target.checked)" :disabled="disabled">
            <span></span>
        </label>
    </div>
</template>

<script>
export default {
  props: {
    value: Boolean,
    title: String,
    disabled: {
      type: Boolean,
      default: false
    }
  }
};
</script>

<style scoped>
.switches {
  display: flex;
  align-items: center;
  height: 40px;
}

.label {
  flex: 1;
}
</style>