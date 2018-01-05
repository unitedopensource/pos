<template>
  <ul>
    <li v-for="(opt,index) in opts" :key="index">
      <input type="radio" name="range" v-model="select" :value="index" :id="'opt'+index" @change="$emit('update',opts[$event.target.value])">
      <label :for="'opt'+index">{{$t('thead.'+opt)}}</label>
    </li>
  </ul>
</template>

<script>
export default {
  data() {
    return {
      opts: [
        "currentWeek",
        "lastWeek",
        "currentMonth",
        "lastMonth",
        "monthly",
        "quarterly"
      ],
      select: 2
    };
  }
};
</script>

<style scoped>
ul {
  display: flex;
  background: #fff;
  border-bottom: 1px solid #BDBDBD;
}

li {
  flex: 1;
  text-align: center;
}

label {
  padding: 10px;
  display: block;
  cursor: pointer;
  color: rgba(0, 0, 0, 0.45);
  border-bottom: 2px solid transparent;
}

input:checked + label {
  color: #333;
  font-weight: bold;
  border-bottom: 2px solid #ff5722;
}
</style>
