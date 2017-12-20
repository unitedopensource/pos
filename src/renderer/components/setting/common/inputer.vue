<template>
  <div class="input">
    <label>{{$t(title)}}</label>
    <textarea v-if="type === 'textarea'" :value="value" :maxlength="length" :disabled="disabled" :placeholder="placeholder" @input="$emit('input',$event.target.value)" @blur="$emit('update',$event.target.value)"></textarea>
    <input v-else :type="type" :value="value" :maxlength="length" :disabled="disabled" :placeholder="placeholder" @input="$emit('input',$event.target.value)" @blur="$emit('update',$event.target.value)" ref="input">
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
    value: [String, Number, Array, Object],
    length: [String, Number],
    disabled: {
      type: Boolean,
      default: false
    },
    autoFocus: {
      type: Boolean,
      default: false
    },
    placeholder: String
  },
  mounted(){
    this.autoFocus && this.$refs.input.focus();
  },
};
</script>

<style scoped>
.input {
  display: flex;
  padding: 5px 0;
  align-items: center;
  position: relative;
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

textarea {
  border: 1px solid #eee;
  border-radius: 2px;
  flex: 1;
  resize: none;
  padding: 5px;
  height: 52px;
}
</style>