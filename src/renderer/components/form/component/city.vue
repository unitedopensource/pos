<template>
    <div class="field-entry">
        <h4>{{$t('text.city')}}</h4>
        <div class="wrap">
            <i class="fa fa-map-marker icon"></i>
            <input :value="value" @click="$emit('focus','city')" id="city">
        </div>
    </div>
</template>

<script>
export default {
  props: ["value"]
};
</script>