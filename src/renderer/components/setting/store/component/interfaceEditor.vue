<template>
    <div class="popupMask setting center dark" @click.self="init.reject">
        <div class="editor">
            <header>
                <h5></h5>
                <h3>{{$t('title.interface')}}</h3>
            </header>
            <div class="wrap">
                <inputer v-model="grid.head" title="text.title"></inputer>
                <inputer v-model="grid.subhead" title="text.subtitle"></inputer>
                <selector title="text.function" v-model="grid.route" :opts="routers"></selector>
                <selector title="text.icon" v-model="grid.icon" :opts="icons"></selector>
                <switches v-model="grid.password" title="text.password"></switches>
            </div>
            <footer>
                <div class="opt">
                    <switches v-model="grid.enable" title="text.enable" :reverse="true"></switches>
                </div>
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
      grid: JSON.parse(JSON.stringify(this.init.grid)),
      routers: [
        {
          label: "type.sales",
          tooltip: "",
          value: "sale"
        },
        {
          label: "type.WALK_IN",
          tooltip: "",
          value: "order"
        },
        {
          label: "type.PICK_UP",
          tooltip: "",
          value: "pickup"
        },
        {
          label: "type.DELIVERY",
          tooltip: "",
          value: "delivery"
        },
        {
          label: "type.DINE_IN",
          tooltip: "",
          value: "table"
        },
        {
          label: "type.buffet",
          tooltip: "",
          value: "buffet"
        },
        {
          label: "type.thirdParty",
          tooltip: "",
          value: "thirdParty"
        },
        {
          label: "text.history",
          tooltip: "",
          value: "history"
        },
        {
          label: "text.pickupList",
          tooltip: "",
          value: "list"
        },
        {
          label: "text.setting",
          tooltip: "",
          value: "setting"
        },
        {
          label: "text.cashDrawer",
          tooltip: "",
          value: "cashDrawer"
        },
        {
          label: "text.lock",
          tooltip: "",
          value: "lock"
        }
      ],
      icons: [
        {
          label: "User",
          tooltip: "",
          plainText: true,
          value: "fa-user"
        },
        {
          label: "Phone",
          tooltip: "",
          plainText: true,
          value: "fa-phone"
        },
        {
          label: "Card",
          tooltip: "",
          plainText: true,
          value: "fa-card"
        },
        {
          label: "Cutlery",
          tooltip: "",
          plainText: true,
          value: "fa-cutlery"
        },
        {
          label: "List",
          tooltip: "",
          plainText: true,
          value: "fa-list"
        },
        {
          label: "Inbox",
          tooltip: "",
          plainText: true,
          value: "fa-inbox"
        },
        {
          label: "Cog",
          tooltip: "",
          plainText: true,
          value: "fa-cog"
        },
        {
          label: "Lock",
          tooltip: "",
          plainText: true,
          value: "fa-lock"
        }
      ]
    };
  },
  methods: {}
};
</script>

<style scoped>

</style>