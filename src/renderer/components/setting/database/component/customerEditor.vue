<template>
  <div class="popupMask dark center">
      <div class="info">
        <header>
            <h3>{{$t(title)}}</h3>
            <h5></h5>
        </header>
        <section class="info">
            <div class="field double">
                <label>{{$t("text.phone")}}</label>
                <div class="input">
                    <i class="fa fa-phone"></i>
                    <input type="text" v-model="customer.phone">
                </div>
            </div>
            <div class="field double">
                <label>{{$t("text.extension")}}</label>
                <div class="input">
                    <i class="fa fa-fax"></i>
                    <input type="text" v-model="customer.extension">
                </div>
            </div>
        </section>
        <footer>
            <div class="f1">
                <span class="del" v-if="customer._id" @click="deleteConfirm">{{$t("button.delete")}}</span>
            </div>
            <button class="btn" @click="update">{{$t("button.update")}}</button>
        </footer>
      </div>
      <div :is="component" :init="componentData"></div>
  </div>
</template>

<script>
import dialoger from "../../../common/dialoger";
export default {
  props: ["init"],
  components: { dialoger },
  data() {
    return {
      title: "",
      customer: null,
      component: null,
      componentData: null
    };
  },
  created() {
    this.title = this.init.customer.new
      ? "title.newCustomer"
      : "title.editCustomer";

    this.customer = Object.assign({}, this.init.customer);
  },
  methods: {
    deleteConfirm() {
      let data = {
        title: "dialog.removeClient",
        msg: ["dialog.removeClientTip", this.customer.phone]
      };

      this.$dialog(data)
        .then(() => {
          this.$emit("remove", this.customer);
          this.$q();
        })
        .catch(() => {
          this.$q();
        });
    },
    update() {
      this.$emit("update", this.customer);
    }
  }
};
</script>

<style scoped>
.info {
  background: #fff;
}
footer {
  display: flex;
}
</style>
