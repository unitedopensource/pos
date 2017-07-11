<template>
  <transition name="scale">
    <div class="modal" v-show="this.$route.name === 'Dashboard'">
      <div class="wrap">
        <section v-if="!init.type" @click.stop="go">
          <div class="phone">
            <h3>{{init.phone | tel}}</h3>
            <h5 class="lastTime">{{init.extra.lastDate | fromNow}}</h5>
          </div>
          <div class="address">
            <span>{{init.address}}</span>
            <span>{{init.city}}</span>
          </div>
          <div v-if="init.extra.tag" class="tags">
            <span class="tag" v-for="tag in init.extra.tag">{{text(tag)}}</span>
          </div>
          <i class="fa fa-phone phone icon"></i>
        </section>
        <section v-else>
          <div class="top online">
            <h3>{{init.name}}</h3>
            <h5></h5>
          </div>
          <div class="bottom"></div>
          <i class="fa"></i>
        </section>
      </div>
    </div>
  </transition>
</template>

<script>
import { mapActions } from 'vuex'
export default {
  props: ['init'],
  methods: {
    go() {
      this.setCustomer(this.init);
      this.setTicket({ type: 'DELIVERY' });
      this.$router.push({ name: 'Information' });
      this.exit();
    },
    getMap() {
      console.log("trigger");
    },
    exit() {
      this.$emit("exit")
    },
    ...mapActions(['setCustomer', 'setTicket'])
  }
}
</script>

<style scoped>
.modal {
  width: 290px;
  position: fixed;
  top: 80px;
  left: 100px;
  background: #fff;
  color: #555;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

.wrap {
  position: relative;
}

.modal section {
  padding: 5px 10px;
}

div.phone {
  display: flex;
  height: 30px;
}

i.icon {
  position: absolute;
  right: -30px;
  top: -30px;
  width: 55px;
  height: 55px;
  line-height: 58px;
  text-align: center;
  background: #FF9800;
  color: #fff;
  border-radius: 50%;
  font-size: 2em;
  border: 2px solid #fff;
  text-shadow: 0 2px 2px rgba(0, 0, 0, 0.4);
  box-shadow: 0px 3px 18px -3px rgba(0, 0, 0, 0.65);
  animation: scale 0.5s linear forwards;
}

@keyframes scale {
  0% {
    transform: scale(0);
    opacity: 0
  }
  70% {
    transform: scale(1.1);
    opacity: 1
  }
  100% {
    transform: scale(1);
    opacity: 1
  }
}

span.lastTime {
  position: absolute;
  bottom: 0;
}

.phone h3 {
  font-size: 1.3em;
  margin: 5px 0 0;
  font-family: "Agency FB";
}

.modal .address {
  display: flex;
  flex-direction: column;
  font-size: 0.8em;
  width: 210px;
  margin-left: 7px;
  text-shadow: none;
  color: gray;
}

.phone h5 {
  font-size: 0.75em;
  font-weight: normal;
  text-shadow: none;
  padding: 9px 10px 0 0;
  flex: 1;
  text-align: right;
  color: burlywood;
}

.tags {
  border-top: 1px dashed #eee;
  margin-top: 5px;
  height: 25px;
  line-height: 25px;
}

.address span {
  height: 20px;
}

span.tag {
  font-size: 14px;
  background: #FF9800;
  color: #fff;
  text-shadow: 0 1px 1px #333;
  padding: 2px 5px;
  border-radius: 4px;
}

.scale-enter-active,
.scale-leave-active {
  transition: opacity .3s ease;
}

.scale-enter,
.scale-leave-active {
  opacity: 0;
}
</style>
