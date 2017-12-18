<template>
    <div class="popupMask dark center">
        <div class="profiles">

        </div>
    </div>
</template>

<script>
export default {
  props: ["init"],
  data() {
    return {
        
    };
  },
  methods: {

  }
};
</script>

<style scoped>
.profiles {
  font-size: initial;
  width: 455px;
  position: absolute;
  top: 10px;
  left: 280px;
  padding: 4px 4px 0;
  border-radius: 4px;
  background: linear-gradient(
    rgba(255, 255, 255, 0.45),
    rgba(255, 255, 255, 0.85)
  );
  color: #263238;
  box-shadow: 0px 4px 8px -1px rgba(0, 0, 0, 0.6);
}
</style>