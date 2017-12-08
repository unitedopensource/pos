<template>
    <div class="wrap">
        <div class="inner">
            <label>{{$t(title)}}</label>
            <span class="tooltip">{{$t(tooltip)}}</span>
        </div>
        <slot>
            <div class="external" @click="$emit('open')">
                <i class="fa fa-caret-right"></i>
            </div>
        </slot>
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
  padding: 5px 0 5px 20px;
  border-bottom: 1px solid #eee;
}

.inner {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.external {
  margin: 0 10px;
  padding: 10px 25px;
  color: #555;
  cursor: pointer;
}

.external:hover {
  background: #eee;
  border-radius: 4px;
}
</style>