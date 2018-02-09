<template>
    <div class="field-entry f1">
        <h4>{{$t('text.name')}}</h4>
        <div class="wrap">
            <i class="fa fa-id-card-o icon"></i>
            <input :value="value" @click="$emit('focus','name')" id="name">
        </div>
    </div>
</template>

<script>
export default {
  props: ["value"]
};
</script>