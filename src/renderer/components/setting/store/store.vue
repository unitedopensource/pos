<template>
    <div>
        <text-input title="text.storeName" v-model="store.name" :disabled="true">
            <div class="change" @click="register">
                <span>{{$t('button.register')}}</span>
            </div>
        </text-input>
        <text-input title="text.address" v-model="store.address"></text-input>
        <text-input title="text.city" v-model="store.city"></text-input>
        <text-input title="text.state" v-model="store.state"></text-input>
        <text-input title="text.zipCode" v-model="store.zipCode"></text-input>
        <text-input title="text.contactInfo" v-model="store.contact"></text-input>
        <text-input title="text.timezone" v-model="store.timeZone"></text-input>
        <text-input title="text.storeType" v-model="store.storeType"></text-input>
        <external title="text.openHour">
          <div class="external" @click="editHour">
                <i class="fa fa-caret-right"></i>
            </div>
        </external>
    </div>
</template>

<script>
import external from "../common/external";
import textInput from "../common/textInput";
export default {
  components: { external, textInput },
  data() {
    return {
      store: null
    };
  },
  created() {
    this.store = Object.assign({}, this.$store.getters.config.store);
  },
  methods: {
    register() {
      console.log("tatah");
    },
    editHour(){
      
    }
  }
};
</script>