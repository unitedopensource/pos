<template>
  <div>
    <phone v-model="customer.phone"></phone>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import phone from "./component/phone";
import street from "./component/address";

export default {
  components: { phone, street },
  computed: {
    ...mapGetters(["customer"])
  },
  data() {
    return {};
  }
};
</script>

<style scoped>
div{
  padding:5px;
}
</style>