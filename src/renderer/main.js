import Vue from 'vue'
import Electron from 'vue-electron'
import Router from 'vue-router'
import VueSocketio from 'vue-socket.io'
import VueTouch from 'vue-touch'
import { VueMaskDirective } from 'v-mask'
import moment from 'moment'
import Net from 'net'
import Ip from 'ip'
import App from './App'
import routes from './routes'
import i18n from './plugin/dict'
import util from "./plugin/util"
import VueBus from './plugin/bus'
import Trend from "vuetrend"
import Bars from 'vuebars'


Vue.use(Electron)
Vue.use(VueBus)
Vue.use(Trend)
Vue.use(Bars)
Vue.use(VueTouch, { name: 'v-touch' })
Vue.use(Router)
Vue.use(util)
Vue.use(i18n)

Vue.directive('mask', VueMaskDirective);

Vue.directive('outer-click', {
  bind: function (el, binding, vNode) {
    if (typeof binding.value !== 'function') {
      const component = vNode.context.name;
      let warn = `[Vue-outer-click:] provided expression '${binding.expression}' is not a function.`
      if (component) {
        warn += `Found in component '${component}'`
      }
      console.warn(warn)
    }
    const bubble = binding.modifiers.bubble
    const handler = (e) => {
      if (bubble || (!el.contains(e.target) && el !== e.target)) {
        binding.value(e)
      }
    }
    el.__vueOuterClick__ = handler
    document.addEventListener('click', handler)
  },

  unbind: function (el, binding) {
    document.removeEventListener('click', el.__vueOuterClick__)
    el.__vueOuterClick__ = null
  }
});


Vue.config.debug = true
window.moment = moment

//change moment default text
moment.updateLocale('en', {
  relativeTime: {
    future: "in %s",
    past: "%s ago",
    s: 'few sec',
    ss: '%d sec',
    m: "a min",
    mm: "%d mins",
    h: "an hr",
    hh: "%d hrs",
    d: "a day",
    dd: "%d days",
    M: "a month",
    MM: "%d months",
    y: "a year",
    yy: "%d years"
  }
});

const ip = Ip.address().split(".").splice(0, 3).join(".") + ".";

new Promise((resolve, reject) => {
  const args = require('electron').remote.process.argv.slice(1);
  
  if (process.env.NODE_ENV === 'development') {
    resolve("127.0.0.1");
    return;
  }
  if (args.includes("server")) {
    window.isServer = true;
    resolve("127.0.0.1");
    return;
  }
  let host = args.indexOf("host");

  if (host !== -1) {
    resolve(args[++host]);
    return;
  }

  let start = 0, end = 255;

  while (start <= end) {
    let target = ip + start;
    (function (target) {
      let scanner = Net.connect({
        host: target,
        port: 8888
      }, () => {
        scanner.destroy();
        resolve(target)
      });

      setTimeout(() => { scanner.destroy() }, 2000);
      scanner.on("error", () => scanner.destroy());
    })(target);
    start++;
  }
}).then(ip => {
  Vue.use(VueSocketio, `http://${ip}:8888`);

  let printScript = document.createElement("script");
  printScript.src = `http://${ip}:8000/CLodopfuncs.js?priority=1`;
  let head = document.head || document.getElementsByTagName("head")[0] || document.documentElement;
  head.insertBefore(printScript, head.firstChild);

  Vue.filter('moment', (time, regEx) => {
    return time ? moment(Number(time)).format(regEx) : "";
  });
  Vue.filter('decimal', (value) => {
    return parseFloat(value).toFixed(2);
  });
  Vue.filter('tel', phone => {
    if(!phone) return "";

    switch (phone.length) {
      case 10:
        return phone.replace(/^\D?(\d{3})\D?\D?(\d{3})\D?(\d{4})/, "($1) $2-$3")
      case 0:
        return 'PRIVATE NUMBER'
      default:
        return phone;
    }
  });
  Vue.filter('phone', number => {
    return (number && number.length === 10) ? number.replace(/^\D?(\d{3})\D?\D?(\d{3})\D?(\d{4})/, "($1) $2-$3") : number;
  });
  Vue.filter('fromNow', (time, pass) => {
    return time ? moment(Number(time)).fromNow(pass) : "";
  });

  const router = new Router({
    scrollBehavior: () => ({
      y: 0
    }),
    routes
  })

  new Vue({
    router,
    ...App
  }).$mount('#app');
})