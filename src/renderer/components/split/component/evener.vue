<template>
    <div class="evener">
        <div>
            hello world
            <span @click="init.resolve">okay</span>
        </div>
    </div>
</template>

<script>
export default {
    props: ["init"],
    data() {
        return {};
    },
    methods: {}
};
</script>

<style scoped>
.evener {
  position: absolute;
  left: 0px;
  top: 0;
  background: rgba(33, 33, 33, 0.26);
  width: 250px;
  height: 490px;
  margin: 5px;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1;
}
</style>