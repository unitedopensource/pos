<template>
    <div class="input">
        <div class="wrap">
            <label>{{$t(title)}}</label>
            <input type="text" :value="value" :disabled="disabled">
        </div>
        <slot></slot>
    </div>
</template>

<script>
export default {
  props: {
    label: String,
    title: String,
    value: [String, Number, Array],
    disabled: Boolean
  }
};
</script>

<style scoped>
.input {
  display: flex;
  padding: 8px 0;
  align-items: center;
  border-bottom: 1px solid #eee;
}

.input .wrap {
  display: flex;
  flex: 1;
  flex-direction: column;
  padding: 0px 20px;
}

.change {
  margin: 0 10px;
  border-left: 1px solid #fff;
}

.change span {
  display: block;
  padding: 10px;
  border-left: 1px solid #fff;
  cursor: pointer;
}

input {
  border: none;
  font-family: "Yuanti-SC";
  font-size: 18px;
  outline: none;
  margin-top: 4px;
}

label {
  color: #656565;
}
</style>