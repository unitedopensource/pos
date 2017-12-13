<template>
    <div class="external" :class="{style:defaultStyle}">
        <div class="inner">
            <label>{{$t(title)}}</label>
            <span class="tooltip">{{$t(tooltip)}}</span>
        </div>
        <slot>
            <div class="icon" @click="$emit('open')">
                <i class="fa fa-caret-right"></i>
            </div>
        </slot>
    </div>
</template>

<script>
export default {
  props: {
    title: String,
    tooltip: String,
    defaultStyle: {
      type: Boolean,
      default: true
    }
  }
};
</script>

<style scoped>
.external {
  display: flex;
  align-items: center;
}

.external.style {
  min-height: 40px;
  padding: 5px 0 5px 20px;
  border-bottom: 1px solid #eee;
}

.inner {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.style .icon{
  margin: 0 10px;
}

.icon {
  padding: 10px 25px;
  color: #555;
  cursor: pointer;
}

.icon:hover {
  background: #eee;
  border-radius: 4px;
}
</style>