<template>
  <div class="popupMask dark" @click.self="init.resolve">
    <transition appear name="fadeDown">
      <div class="opPanel">
        <div class="list" @click="clockIn" v-if="!op.clockIn">
          <i class="fa fa-2x fa-clock-o"></i>
          <div>
            <h3>{{$t('dock.clockIn')}}</h3>
            <h5>{{time | moment('HH:mm:ss')}}</h5>
          </div>
        </div>
        <div class="list" @click="clockOut" v-else>
          <i class="fa fa-2x fa-clock-o"></i>
          <div class="f1">
            <h3>{{$t('dock.clockOut')}}</h3>
            <h5>{{time | moment('HH:mm:ss')}}
              <span class="pass">{{op.clockIn | fromNow(true)}}</span>
            </h5>
          </div>
        </div>
        <div class="list" @click="giftCard">
          <i class="fa fa-2x fa-credit-card-alt"></i>
          <div>
            <h3>{{$t('dock.giftCard')}}</h3>
            <h5></h5>
          </div>
        </div>
        <div class="list" @click="creditCard">
          <i class="fa fa-2x fa-credit-card"></i>
          <div>
            <h3>{{$t('dock.terminal')}}</h3>
            <h5>{{$t('dock.terminalTip')}}</h5>
          </div>
        </div>
        <div class="list">
          <i class="fa fa-2x fa-desktop"></i>
          <div>
            <h3>{{$t('dock.station')}}</h3>
            <h5>{{$t('dock.stationTip')}}</h5>
          </div>
        </div>
        <div class="list" @click="language">
          <i class="fa fa-2x fa-language"></i>
          <div>
            <h3>{{$t('dock.language')}}</h3>
            <h5>{{$t('dock.languageTip')}}</h5>
          </div>
        </div>
        <div class="list" @click="logout">
          <i class="fa fa-2x fa-sign-out"></i>
          <div>
            <h3>{{$t('dock.logout')}}</h3>
            <h5>{{$t('dock.logoutTip')}}</h5>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import moment from 'moment'
export default {
  props: ['init'],
  methods: {
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
      this.$emit("trigger"), {
        name: "station"
      }
    },
    giftCard() {
      this.$emit("trigger", {
        name: "giftCard"
      })
    },
    creditCard() {
      this.$emit("trigger", {
        name: "creditCard"
      })
    },
    askCashOut() {
      this.$emit("trigger", {
        name: "cashOut"
      })
    },
    language() {
      let language = this.app.language === "usEN" ? "zhCN" : "usEN";
      this.$setLanguage(language);
      this.setApp({ language });
      moment.locale(language === 'usEN' ? 'en' : 'zh-cn');
    },
    logout() {
      this.checkCashOut().then(() => { this.$router.push({ path: '/Login' }) }).catch(() => { this.askCashOut() });
    },
    checkCashOut() {
      let cashDrawer = this.store.stuffBank ? this.op.name : this.station.cashDrawer.name;
      this.$socket.emit("[CASHFLOW] CHECK", { date: today(), cashDrawer, close: false });
      return new Promise((resolve, reject) => {
        this.$options.sockets["CASHFLOW_RESULT"] = (boolean) => { boolean ? reject() : resolve() }
      })
    },
    ...mapActions(['setApp'])
  },
  computed: {
    ...mapGetters(['op', 'app', 'time', 'station', 'store'])
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
