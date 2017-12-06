<template>
    <div class="wrap">
        <label class="label">{{$t(title)}}</label>
        <label class="input-toggle">
            <input type="checkbox" :checked="value" @change="$emit('input',$event.target.checked)">
            <span></span>
        </label>
    </div>
</template>

<script>
export default {
  props: {
    value: Boolean,
    title: String
  }
};
</script>

<style scoped>
.wrap {
  display: flex;
  align-items: center;
  height: 40px;
}

.label {
  flex: 1;
  color: #666;
}
</style>