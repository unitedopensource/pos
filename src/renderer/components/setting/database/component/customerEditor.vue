<template>
  <div class="popupMask dark center" @click.self="init.resolve">
      <div class="customer">
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
            <div class="field single">
                <label>{{$t("text.address")}}</label>
                <div class="input">
                    <i class="fa fa-map-marker"></i>
                    <input type="text" v-model="customer.address">
                </div>
            </div>
            <div class="field double">
                <label>{{$t("text.dob")}}</label>
                <div class="input">
                    <i class="fa fa-calendar"></i>
                    <input type="text" v-model="customer.extra.dob">
                </div>
            </div>
            <div class="field double">
                <label>{{$t("text.email")}}</label>
                <div class="input">
                    <i class="fa fa-envelope"></i>
                    <input type="text" v-model="customer.extra.email">
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
.customer {
  background: #fff;
  width: 650px;
}

header {
  display: flex;
  border-bottom: 1px solid #eee;
}

h3 {
  padding: 15px 0 15px 15px;
  width: 100%;
}

.info {
  height: 400px;
  display: flex;
  flex-wrap: wrap;
  background: #fafafa;
}

.double {
  width: 50%;
  height: 60px;
  display: inline-flex;
  flex-direction: column;
}

.single {
  width: 100%;
}
input {
  border: none;
  outline: none;
  background: transparent;
  width: 90%;
  font-size: 20px;
}

.input {
  border: 1px solid #eee;
  width: 90%;
  padding: 8px;
  font-size: 20px;
  color: #3c3c3c;
  background: #fff;
}

.field {
  height: 60px;
  display: inline-flex;
  flex-direction: column;
}
footer {
  display: flex;
  align-items: center;
}
</style>
