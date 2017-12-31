<template>
    <div class="popupMask setting dark center" @click.self="init.reject">
        <div class="editor">
            <header>
                <h5>{{$t('title.create')}}</h5>
                <h3>{{$t('title.profile')}}</h3>
            </header>
            <div class="wrap">
                <inputer title="text.phone" v-model="customer.phone" mask="(###) ### - ####"></inputer>
                <inputer title="text.name" v-model="customer.name"></inputer>
                <inputer title="text.address" v-model="customer.address"></inputer>
                <inputer title="text.city" v-model="customer.city"></inputer>
            </div>
            <footer>
                <button class="btn" @click="confirm" :disabled="!valid">{{$t('button.confirm')}}</button>
            </footer>
        </div>
        <div :is="component" :init="componentData"></div>
    </div>
</template>

<script>
import inputer from "../../common/inputer";
import dialoger from "../../../common/dialoger";
export default {
  props: ["init"],
  components: { inputer, dialoger },
  computed: {
    valid() {
      const phone = this.customer.phone.replace(/\D/g, "").toString();
      return phone.length === 10;
    }
  },
  data() {
    return {
      componentData: null,
      component: null,
      customer: this.init.customer
    };
  },
  methods: {
    confirm() {
      this.checkDuplicate()
        .then(this.save)
        .catch(this.saveFailed);
      this.customer.phone = this.customer.phone.replace(/\D/g, "");
      this.init.resolve(this.customer);
    },
    checkDuplicate() {
      return new Promise((next, stop) => {
        const phone = this.customer.phone.replace(/\D/g, "").toString();
        this.$socket.emit("[CUSTOMER] CHECK", phone, exist => {
          exist ? next(phone) : stop();
        });
      });
    },
    save(phone) {
      this.customer.phone = phone;
      this.init.resolve(this.customer);
    },
    saveFailed(){
        const prompt = {
            title:"dialog.createFailed",
            msg:"dialog.duplicateProfile",
            buttons:[{text:"button.confirm",fn:"resolve"}]
        }

        this.$dialog(prompt).then(()=>this.$q());
    }
  }
};
</script>