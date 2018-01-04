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
  border: 1px solid #eee;
  margin: 10px 20px;
  border-radius: 4px;
}

li {
  flex: 1;
  text-align: center;
}

label {
  padding: 10px;
  display: block;
  cursor: pointer;
  margin: 4px;
  color: rgba(0, 0, 0, 0.45);
}

input:checked + label {
  background: #03a9f4;
  color: #fff;
  border-radius: 4px;
  box-shadow: 0 1px 2px #1652af;
}
</style>
