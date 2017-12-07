<template>
    <div class="input">
        <label>{{$t(title)}}</label>
        <input type="text" :value="value" @change="$emit('input',$event.target.value)">
    </div>
</template>

<script>
export default {
  props: {
    title: String,
    value: [String, Number]
  }
};
</script>

<style scoped>
.input {
  display: flex;
  padding: 5px 0;
  align-items: center;
}

input {
  flex: 1;
  border: 1px solid #eee;
  border-radius: 2px;
  padding: 5px;
}

label {
  min-width: 80px;
}
</style>