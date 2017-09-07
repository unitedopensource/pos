import Vue from 'vue'
import Electron from 'vue-electron'
import Router from 'vue-router'
import VueSocketio from 'vue-socket.io'
import moment from 'moment'
import Net from 'net'
import Ip from 'ip'
import App from './App'
import routes from './routes'
import i18n from './plugin/dict'
import dialog from './plugin/dialog'
import VueBus from './plugin/bus'

Vue.use(Electron)
Vue.use(VueBus)
Vue.use(Router)
Vue.use(dialog)
Vue.use(i18n)

Vue.config.debug = true
window.moment = moment
const ip = Ip.address().split(".").splice(0, 3).join(".") + ".";
let findHost = new Promise((resolve, reject) => {
  const args = require('electron').remote.process.argv.slice(1);
  if (process.env.NODE_ENV === 'development') {
    resolve("127.0.0.1");
    return;
  }
  if (args.includes("-server")) {
    window.server = true;
    resolve("127.0.0.1");
    return;
  }
  let host = args.indexOf("-host");
  if (host !== -1) {
    resolve(args[++host]);
    return;
  }
  let start = 0, end = 255;
  while (start <= end) {
    let target = ip + start;
    (function (target) {
      let scanner = Net.connect({ host: target, port: 27017 }, () => { resolve(target) });
      setTimeout(() => { scanner.destroy() }, 2000);
      scanner.on("error", () => { scanner.destroy() });
    })(target);
    start++;
  }
});

findHost.then(ip => {
  Vue.use(VueSocketio, `http://${ip}:8888`);

  let printScript = document.createElement("script");
  printScript.src = `http://${ip}:8000/CLodopfuncs.js?priority=1`;
  let head = document.head || document.getElementsByTagName("head")[0] || document.documentElement;
  head.insertBefore(printScript, head.firstChild);

  Vue.filter('moment', (time, regEx) => {
    if (!time) return;
    return moment(Number(time)).format(regEx)
  });
  Vue.filter('decimal', (value) => {
    return parseFloat(value).toFixed(2);
  });
  Vue.filter('tel', phone => {
    switch (phone.length) {
      case 10:
        return phone.replace(/^\D?(\d{3})\D?\D?(\d{3})\D?(\d{4})/, "($1)$2-$3")
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
    if (!time) return;
    return moment(Number(time)).fromNow(pass);
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

Array.prototype.last = function () {
  return this[this.length - 1] || null;
}
Array.prototype.remove = function (object) {
  for (var i = 0; i < this.length; i++) {
    if (this[i] === object) {
      this.splice(i, 1);
      break;
    }
  }
};
Array.prototype.getIndexOf = function (array) {
  for (var i = 0; i < this.length; i++) {
    if (this[i] === array) {
      return i;
    }
  }
  return undefined;
};
Array.prototype.getLastInsertIndex = function (array) {
  var index = 0;
  for (var i = 0; i < this.length; i++) {
    if (this[i].key === array.key) {
      index = i;
    }
  }
  return index + 1;
};
String.prototype.toFixed = function (places) {
  return isNumber(this) ? parseFloat(this).toFixed(places) : "0.00";
}
String.prototype.toCapitalCase = function () {
  return this.replace(/\w\S*/g, function (txt) { return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(); });
};
window.ObjectId = (m = Math, d = Date, h = 16, s = s => m.floor(s).toString(h)) => s(d.now() / 1000) + ' '.repeat(h).replace(/./g, () => s(m.random() * h));
window.isNumber = (n => (/^-?[\d.]+(?:e-?\d+)?$/.test(n)));
window.today = function (offset = 0) {
  let d = new Date();
  d = d.setHours(d.getHours() - 4 + (offset * 24));
  d = new Date(d);
  return `${d.getFullYear()}-${("0" + (d.getMonth() + 1)).slice(-2)}-${("0" + d.getDate()).slice(-2)}`;
}
window.line = function (line1, line2) {
  let f = function (data) {
    if (typeof data === 'string') {
      let i = Math.floor(Math.abs(20 - data.length) / 2);
      return (' '.repeat(i) + data + ' '.repeat(i + 10)).slice(0, 20);
    } else {
      let string = data[0];
      let amount = isNumber(data[1]) ? data[1] > 0 ? '$ ' + data[1] : '-$ ' + data[1] : data[1];
      let i = 20 - (string + amount).length;
      i < 0 && (i = 0);
      return (string + ' '.repeat(i) + amount).slice(0, 20);
    }
  }
  return f(line1) + f(line2);
}
window.toggleClass = function (target, className) {
  let dom = target instanceof HTMLElement ? target : document.querySelector(target);
  dom.className.includes(className) ? dom.classList.remove(className) : dom.classList.add(className)
}