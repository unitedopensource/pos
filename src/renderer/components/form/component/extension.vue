<template>
    <div class="field-entry f1">
        <h4>{{$t('text.extension')}}</h4>
        <div class="wrap">
            <i class="fa fa-fax icon"></i>
            <input :value="value" @click="$emit('focus','extension')" id="extension">
        </div>
    </div>
</template>

<script>
export default {
  props: ["value"]
};
</script>