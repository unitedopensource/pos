<template>
    <div>   
        <header>
            <nav>
                <h3><i class="fa fa-users"></i><span>{{$t('title.addressList')}}</span></h3>
            </nav>
        </header>
        <table>
            <thead>
                <tr>
                    <th>{{$t('thead.street')}}</th>
                    <th>{{$t('thead.city')}}</th>
                    <th>{{$t('thead.zipcode')}}</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(address,index) in addresses" :key="index">
                    <td>{{address.street}}</td>
                    <td>{{address.city}}</td>
                    <td>{{address.zipcode}}</td>
                </tr>
            </tbody>
            <tfooter>
                <tr>
                    <td colspan="2">total Address: {{totalAddress}}</td>
                    <td>

                    </td>
                </tr>
            </tfooter>
        </table>
        <div :is="component" :init="componentData" @update="initialData"></div>
    </div>
</template>

<script>
import editor from "./component/addressEditor";
export default {
  props: ["init"],
  components: { editor },
  data() {
    return {
      page: 0,
      totalPage: 0,
      totalAddress: 0,
      addresses: [],
      component: null,
      componentData: null
    };
  },
  created() {
    this.initialData();
  },
  mounted() {
    window.addEventListener("keydown", this.entry, false);
  },
  beforeDestroy() {
    window.removeEventListener("keydown", this.entry, false);
  },
  methods: {
    initialData() {
      this.$socket.emit("[ADDRESS] COUNT", total => {
        this.totalAddress = total;
        this.totalPage = Math.ceil(total / 30);
      });
      this.$socket.emit("[ADDRESS] LIST", this.page);
    },
    entry(e) {
      switch (e.key) {
        case "F1":
          break;
        case "Escape":
          break;
      }
    }
  },
  watch: {
    page(n) {
      this.$socket.emit("[ADDRESS] LIST", n);
    }
  },
  sockets: {
    ADDRESS_LIST(data) {
      this.addresses = data;
    }
  }
};
</script>