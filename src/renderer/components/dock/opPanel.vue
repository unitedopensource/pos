<template>
  <div class="popupMask dark" @click.self="exit">
    <div class="opPanel">
      <div class="list" @click="clockIn" v-if="!op.clockIn">
        <i class="fa fa-2x fa-clock-o"></i>
        <div>
          <h3>{{text('CLOCK_IN')}}</h3>
          <h5>{{time | moment('HH:mm:ss')}}</h5>
        </div>
      </div>
      <div class="list" @click="clockOut" v-else>
        <i class="fa fa-2x fa-clock-o"></i>
        <div class="f1">
          <h3>{{text('CLOCK_OUT')}}</h3>
          <h5>{{time | moment('HH:mm:ss')}}
            <span class="pass">{{op.clockIn | fromNow(true)}}</span>
          </h5>
        </div>
      </div>
      <div class="list">
        <i class="fa fa-2x fa-desktop"></i>
        <div>
          <h3>{{text('STATION')}}</h3>
          <h5>Change Station Setting</h5>
        </div>
      </div>
      <div class="list" @click="giftCard">
        <i class="fa fa-2x fa-credit-card-alt"></i>
        <div>
          <h3>{{text('GIFT_CARD')}}</h3>
          <h5></h5>
        </div>
      </div>
      <div class="list" @click="language">
        <i class="fa fa-2x fa-language"></i>
        <div>
          <h3>Language</h3>
          <h5>Switch Language</h5>
        </div>
      </div>
      <div class="list" @click="logout">
        <i class="fa fa-2x fa-sign-out"></i>
        <div>
          <h3>{{text('LOGOUT')}}</h3>
          <h5>Complete Sign Out</h5>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import moment from 'moment'
export default {
  props: ['init'],
  methods: {
    exit() {
      this.$emit("exit")
    },
    clockIn() {
      this.$emit("trigger", {
        name: "clockIn"
      })
    },
    clockOut() {
      this.$emit("trigger", {
        name: "clockOut"
      })
    },
    station() {

    },
    giftCard() {

    },
    language() {
      let language = this.app.language === "usEN" ? "zhCN" : "usEN";
      this.$setLanguage(language);
      this.setApp({ language });
      moment.locale(language === 'usEN' ? 'en' : 'zh-cn');
    },
    logout() {
      this.$router.push({ path: '/Login' });
    },
    ...mapActions(['setApp'])
  },
  computed: {
    ...mapGetters(['op', 'app', 'time', 'station'])
  }
}
</script>

<style scoped>
.opPanel {
  width: 250px;
  position: absolute;
  top: 10px;
  right: 90px;
  padding: 4px 4px 0;
  background: rgba(255, 255, 255, 0.8);
  text-shadow: none;
  color: #263238;
  box-shadow: -2px 4px 12px rgba(0, 0, 0, 0.4);
}

.list {
  background: #fff;
  margin-bottom: 5px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.5);
  display: flex;
  padding: 10px;
  align-items: center;
}

.list:active {
  background: #eee;
}

i {
  margin: 0 13px 0 7px;
  color: #363636;
  width: 50px;
  text-align: center;
}

h3 {
  font-weight: normal;
}

h5 {
  font-weight: normal;
  color: #757575;
  font-size: 14px;
  line-height: 12px;
}

h5 .pass {
  color: #009688;
  float: right;
  font-size: 14px;
}
</style>
