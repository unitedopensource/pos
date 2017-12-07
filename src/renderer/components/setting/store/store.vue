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
        <!-- <text-input title="text.storeType" v-model="store.storeType"></text-input> -->
        <text-list title="text.storeType" v-model="store.storeType" :opts="types"></text-list>
        <external title="text.openHour">
          <div class="external" @click="editHour">
                <i class="fa fa-caret-right"></i>
            </div>
        </external>
    </div>
</template>

<script>
import external from "../common/external";
import textList from "../common/textList";
import textInput from "../common/textInput";

export default {
  components: { external, textInput, textList },
  data() {
    return {
      store: null,
      types: [
        {
          label: "type.chineseTakeOut",
          tooltip: "",
          value: "chineseTakeOut"
        },
        {
          label: "type.chineseDineIn",
          tooltip: "",
          value: "chineseDineIn"
        },
        {
          label: "type.japaneseDineIn",
          tooltip: "",
          value: "japaneseDineIn"
        },
        {
          label: "type.thaiDineIn",
          tooltip: "",
          value: "thaiDineIn"
        },
        {
          label: "type.vietDineIn",
          tooltip: "",
          value: "vietDineIn"
        },
        {
          label: "type.retail",
          tooltip: "",
          value: "retail"
        },
        {
          label: "type.buffet",
          tooltip: "",
          value: "buffet"
        },
        {
          label: "type.fastFood",
          tooltip: "",
          value: "fastFood"
        }
      ]
    };
  },
  created() {
    this.store = Object.assign({}, this.$store.getters.config.store);
  },
  methods: {
    register() {
      console.log("tatah");
    },
    editHour() {}
  }
};
</script>