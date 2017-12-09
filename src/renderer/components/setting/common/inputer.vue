<template>
    <div class="input">
        <label>{{$t(title)}}</label>
        <input :type="type" :value="value" @input="$emit('input',$event.target.value)" @blur="$emit('update',$event.target.value)" :placeholder="placeholder">
    </div>
</template>

<script>
export default {
  props: {
    type: {
      type: String,
      default: "text"
    },
    title: String,
    value: [String, Number],
    placeholder: String
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