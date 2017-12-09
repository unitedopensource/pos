<template>
    <div>
        <header class="nav">
          <router-link tag="div" :to="{name:'Setting.promotion'}" class="back">
            <i class="fa fa-chevron-left"></i>
          </router-link>
          <nav>
            <span class="add" @click="create">{{$t('button.new')}}</span>
          </nav>
        </header>
          <table class="setting">
            <thead>
              <tr>
                <th>{{$t('thead.name')}}</th>
                <th>{{$t('thead.discount')}}</th>
                <th>{{$t('thead.expire')}}</th>
                <th>{{$t('thead.count')}}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(coupon,index) in coupons" :key="index">
                <td>{{coupon.for}}</td>
                <td class="amount">{{coupon.discount}}</td>
                <td :class="{expired: (coupon.expire && today > coupon.expire)}">{{format(coupon.expire)}}</td>
                <td>{{coupon.count}}</td>
                <td class="opt" @click="edit(coupon,index)">
                  <i class="fa fa-ellipsis-v"></i>
                </td>
              </tr>
            </tbody>
          </table>
          <div :is="component" :init="componentData"></div>
      </div>
</template>

<script>
import editor from "../component/couponEditor";
export default {
  props: ["init"],
  components: { editor },
  data() {
    return {
      componentData: null,
      component: null,
      coupons: [],
      today: +new Date()
    };
  },
  created() {
    this.coupons = window.temp;
    delete window.temp;
  },
  methods: {
    format(date) {
      return date
        ? moment(date).format("YYYY-MM-DD")
        : this.$t("text.neverExpire");
    },
    create() {
      let coupon = {
        for: "",
        discount: "",
        expire: "",
        count: 0,
        rules: []
      };

      this.edit(coupon);
    },
    edit(coupon, index) {
      new Promise((resolve, reject) => {
        this.componentData = { resolve, reject, coupon, edit: !!coupon._id };
        this.component = "editor";
      })
        .then(_coupon => {
          this.$q();
        })
        .catch(del => {
          del && this.coupons.splice(index, 1);
          this.$q();
        });
    }
  }
};
</script>