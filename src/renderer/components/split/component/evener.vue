<template>
    <div class="option">
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
.option {
  position: absolute;
  left: 0px;
  top: 0;
  background: rgba(33, 33, 33, 0.26);
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1;
}
</style>