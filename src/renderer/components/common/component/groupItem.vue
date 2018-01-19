<template>
    <ul>
        <li></li>
    </ul>
</template>

<script>
export default {
  props: ["items"],
  data() {
    return {};
  },
  created() {
    console.log(this.items);
  }
};
</script>