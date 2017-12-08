<template>
    <div>
        <header class="nav">
          <router-link tag="div" :to="{name:'Setting.promotion'}" class="back">
            <i class="fa fa-chevron-left"></i>
          </router-link>
          <nav>
            <span class="add">{{$t('button.new')}}</span>
          </nav>
        </header>
          <table>
            <thead>
              <tr>
                <th>{{$t('thead.name')}}</th>
                <th>{{$t('thead.discount')}}</th>
                <th>{{$t('thead.expire')}}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(coupon,index) in coupons" :key="index">
                <td>{{coupon.for}}</td>
                <td class="amount">{{coupon.discount}}</td>
                <td>{{coupon.expire | moment('YYYY-MM-DD')}}</td>
                <td class="opt" @click="edit(coupon)">
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
      coupons: []
    };
  },
  created() {
    this.coupons = window.temp;
    delete window.temp;
  },
  methods: {
    edit(coupon) {
      this.$p("editor", { coupon });
    }
  }
};
</script>

<style scoped>
thead th {
  background: #009688;
  color: #fff;
  font-weight: normal;
  padding: 2px 0;
}

tbody td {
  padding: 7px 0;
  text-align: center;
}

tbody tr:nth-child(even) {
  background: #f5f5f5;
}

.opt i {
  width: 25px;
  cursor: pointer;
  color: #3c3c3c;
  padding: 5px 0;
}

.opt i:active {
  background: #eee;
  border-radius: 4px;
}

.amount {
  font-family: "Agency FB";
  font-weight: bold;
  color: #3c3c3c;
}
</style>