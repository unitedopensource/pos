<template>
    <div>
        <header class="nav">
            <div class="back" @click="save">
            <i class="fa fa-chevron-left"></i>
            </div>
            <nav>
                <span class="add" @click="create">{{$t('button.new')}}</span>
            </nav>
        </header>
          <table class="setting">
            <thead>
              <tr>
                <th>{{$t('thead.name')}}</th>
                <th>{{$t('thead.taxRate')}}</th>
                <th>{{$t('thead.default')}}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(tax,index) in taxes" :key="index">
                <td>{{tax.alias}}</td>
                <td class="amount">{{tax.rate}} %</td>
                <td v-if="tax.default">
                    <i class="fa fa-check-circle"></i>
                </td>
                <td v-else class="clickable" @click="setDefault(tax)">
                    <i class="fa fa-check-o"></i>
                </td>
                <td class="opt" @click="edit(tax,index)">
                  <i class="fa fa-ellipsis-v"></i>
                </td>
              </tr>
            </tbody>
          </table>
        <div :is="component" :init="componentData"></div>
    </div>
</template>

<script>
import editor from "../component/taxEditor";
export default {
  components: { editor },
  data() {
    return {
      componentData: null,
      component: null,
      taxes: []
    };
  },
  created() {
    this.taxes = Object.assign({}, this.$store.getters.tax.class);
  },
  methods: {
    create() {
      let tax = {
        alias: "",
        rate: 0,
        default: false,
        apply: {
          WALK_IN: true,
          PICK_UP: true,
          DELIVERY: true,
          DINE_IN: true,
          TO_GO: true,
          SALES: true,
          BAR: true,
          BUFFET: true
        }
      };

      this.$p("editor", { tax, edit: false });
    },
    edit(tax, name) {
      new Promise((resolve, reject) => {
        this.componentData = { resolve, reject, tax, edit: true };
        this.component = "editor";
      })
        .then(_tax => {
          Object.assign(this.taxes[name], _tax);
          this.$q();
        })
        .catch(del => {
          del && this.$delete(this.taxes, name);
          this.$q();
        });
    },
    setDefault(tax) {
      Object.keys(this.taxes).forEach(
        name => (this.taxes[name].default = false)
      );
      tax.default = true;
    },
    save() {
      this.$socket.emit("[UPDATE] CONFIG", {
        key: "tax.class",
        value: this.taxes
      });
      this.$router.push({ name: "Setting.store.payment" });
    }
  }
};
</script>

<style scoped>
.fa-check-circle {
  color: var(--green);
}
</style>