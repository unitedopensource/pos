<template>
    <div class="external">
        <div class="wrap">
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
.external {
  display: flex;
  align-items: center;
  min-height: 40px;
  padding: 5px 0 5px 15px;
  border-bottom: 1px solid #eee;
}
.wrap {
  flex: 1;
  display: flex;
  flex-direction: column;
}
</style>