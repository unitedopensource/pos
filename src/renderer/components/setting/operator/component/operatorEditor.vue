<template>
    <div class="popupMask setting dark center">
        <div class="editor">
            <header>
                <h5>{{$t('title.create')}}</h5>
                <h3>{{$t('title.operator')}}</h3>
            </header>
            <div class="wrap">
                <inputer title="text.name" v-model="name"></inputer>
                <selector title="text.role" v-model="role" :opts="roles"></selector>
            </div>
            <footer>
                <button class="btn" @click="init.reject">{{$t('button.cancel')}}</button>
                <button class="btn">{{$t('button.confirm')}}</button>
            </footer>
        </div>
    </div>
</template>

<script>
import inputer from "../../common/inputer";
import selector from "../../common/selector";
export default {
  props: ["init"],
  components: { inputer, selector },
  data() {
    return {
      name: "",
      role: "",
      roles: [
        {
          label: "type.Manager",
          tooltip: "",
          value: "Manager"
        },
        {
          label: "type.Cashier",
          tooltip: "",
          value: "Cashier"
        },
        {
          label: "type.Waitstaff",
          tooltip: "",
          value: "Waitstaff"
        },
        {
          label: "type.Bartender",
          tooltip: "",
          value: "Bartender"
        },
        {
          label: "type.Worker",
          tooltip: "",
          value: "Worker"
        }
      ]
    };
  },
  created() {
    const op = this.$store.getters.op;

    op.role === "Developer" &&
      this.roles.splice(0, 0, {
        label: "type.Owner",
        tooltip: "",
        value: "Owner"
      });
  }
};
</script>