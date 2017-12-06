<template>
    <div class="wrap">
        <div class="inner">
            <label>{{$t(title)}}</label>
            <span class="tooltip">{{$t(tooltip)}}</span>
        </div>
        <slot></slot>
    </div>
</template>

<script>
export default {
  props: {
    title: String,
    tooltip: String
  }
};
</script>

<style scoped>
.wrap {
  display: flex;
  align-items: center;
  min-height: 40px;
  padding: 5px 0 5px 15px;
  border-bottom: 1px solid #eee;
}

.inner {
  flex: 1;
  display: flex;
  flex-direction: column;
}
</style>