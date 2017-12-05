<template>
    <div>
        <text-input title="text.storeName" v-model="store.name" :disabled="true" label="button.register">
            <div class="change" @click="register">
                <span>{{$t('button.register')}}</span>
            </div>
        </text-input>
        <text-input title="text.address" v-model="store.address"></text-input>
        <text-input title="text.city" v-model="store.city"></text-input>
        <text-input title="text.state" v-model="store.state"></text-input>
        <text-input title="text.zipCode" v-model="store.zipCode"></text-input>
        <text-input title="text.contactInfo" v-model="store.contact"></text-input>
        <text-input title="text.area" v-model="store.timeZone"></text-input>
        <text-input title="text.storeType" v-model="store.storeType"></text-input>
        <text-input title="text.openHour" v-model="store.openHour"></text-input>
    </div>
</template>

<script>
import { mapGetters } from "vuex";
import textInput from "../common/textInput";
export default {
  components: { textInput },
  computed: {
    ...mapGetters(["config"])
  },
  data() {
    return {
      store: null
    };
  },
  created() {
    this.store = Object.assign({}, this.config.store);
  },
  methods: {
      register(){
          console.log("tatah")
      }
  }
};
</script>