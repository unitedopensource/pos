<template>
  <div class="outer">
    <section>
      <phone v-model="customer.phone"></phone>
      <extension v-model="customer.extension"></extension>
      <name v-model="customer.name"></name>
    </section>
    <section>
      <street v-model="customer.address"></street>
      <city v-model="customer.city"></city>
    </section>
    <section>
      <note v-model="customer.note"></note>
    </section>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import phone from "./component/phone";
import street from "./component/street";
import extension from "./component/extension";
import name from "./component/name";
import city from "./component/city";
import note from "./component/note";

export default {
  components: { phone, street, extension, name, city, note },
  computed: {
    ...mapGetters(["customer"])
  },
  data() {
    return {};
  }
};
</script>

<style scoped>
.outer {
  padding: 5px 10px;
  background: #fafafa;
}

section{
  display:flex;
}
</style>