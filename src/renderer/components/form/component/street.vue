<template>
  <div class="field-entry f3">
    <h4>{{$t('text.address')}}</h4>
    <div class="wrap">
      <i class="fa fa-location-arrow icon"></i>
      <input :value="value" @click="$emit('focus','address')" id="address">
    </div>
  </div>
</template>

<script>
export default {
  props:['value']
};
</script>