<template>
    <transition name="pop">
        <div class="caller" v-show="this.$route.name === 'Dashboard'" @click="go">
            <header>
                <span class="f1">{{$t('title.incomingCall')}}</span>
                <span class="lastUpdate">{{customer.extra.lastDate | fromNow}}</span>
            </header>
            <div class="wrap">
                <i class="fa fa-3x fa-phone icon"></i>
                <div class="info">
                    <div class="phone">{{customer.phone | tel}}</div>
                    <div class="address">
                        <span>{{customer.address}}</span>
                        <span class="city">{{customer.city}}</span>
                    </div>
                </div>
            </div>
            <div class="tags">
                <span class="tag" v-for="(tag,index) in customer.extra.tags" :key="index">{{$t('tag.'+tag)}}</span>
            </div>
        </div>
    </transition>
</template>

<script>
import { mapActions } from "vuex";
export default {
  props: ["init"],
  data() {
    return {
      customer: {}
    };
  },
  created() {
    this.customer = this.init.customer;
  },
  methods: {
    go() {
      this.setCustomer(this.customer);
      this.setTicket({ type: "DELIVERY" });
      this.$router.push({ name: "Information" });
      this.init.resolve();
    },
    ...mapActions(["setCustomer", "setTicket"])
  }
};
</script>

<style scoped>
.caller {
  min-width: 290px;
  max-width: 330px;
  position: fixed;
  top: 65px;
  left: 100px;
  background: #fff;
  color: #555;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

header {
  padding: 5px 10px;
  border-bottom: 1px solid #eeeeee;
  background: #03a9f4;
  color: #fff;
  display: flex;
  align-items: center;
  font-size: 14px;
  text-shadow: 0 1px 1px #333;
}

.wrap {
  display: flex;
  padding: 5px;
}

.address {
  display: flex;
  padding: 2px 0px;
}

.city {
  margin-left: 5px;
  color: #9e9e9e;
}

i {
  padding: 0 10px 0 5px;
  color: #009688;
  text-shadow: 0 1px 1px #607d8b;
}

.tags {
  display: flex;
  background: #eceff1;
  align-items: center;
  flex-wrap: wrap;
}

.tag {
  font-size: 14px;
  margin: 4px 0px 4px 4px;
  background: #ff9800;
  color: #fff;
  text-shadow: 0 1px 1px #333;
  padding: 3px 4px;
  border-radius: 2px;
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.6);
}
</style>