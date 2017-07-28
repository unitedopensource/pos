const dialog = {
  install(Vue, options) {
    Vue.mixin({
      methods: {
        approval(credential, permit) {
          return this.op.role === 'Admin' ? true : credential.includes(permit);
        }
      }
    });
    Vue.prototype.$p = function (component, args, resolveHandler, rejectHandler) {
      return new Promise((resolve, reject) => {
        this.componentData = Object.assign({ resolve, reject }, args);
        this.component = component;
      }).then((result) => {
        this.$q();
        resolveHandler && resolveHandler();
      }).catch((result) => {
        this.$q();
        rejectHandler && rejectHandler();
      });
    }
    Vue.prototype.$dialog = function (args) {
      return new Promise((resolve, reject) => {
        this.componentData = {
          type: args.type || "alert",
          title: args.title,
          msg: args.msg,
          timeout: args.hasOwnProperty('timeout') ?
            {
              duration: args.timeout.duration || 15000,
              fn: args.timeout.hasOwnProperty('fn') ? eval(args.timeout.fn) : reject
            } : null,
          buttons: [],
          resolve, reject
        };
        args.hasOwnProperty('buttons') ?
          args.buttons.forEach(button => { this.componentData.buttons.push({ text: button.text, fn: button.fn === 'resolve' ? resolve : reject }) }) :
          this.componentData.buttons = [{ text: 'CANCEL', fn: reject }, { text: 'CONFIRM', fn: resolve }]
        this.component = "dialoger";
      });
    }
    Vue.prototype.$denyAccess = function (manager) {
      let buttons = manager ? [{ text: 'MANAGER_CODE', fn: 'resolve' }, { text: 'CONFIRM', fn: 'reject' }] : [{ text: 'CONFIRM', fn: 'reject' }];
      this.$dialog({ type: 'warning', title: 'PD_ACCESS', msg: 'TIP_PD_ACCESS', timeout: { duration: 10000 }, buttons }).then(() => { this.$q() }).catch(() => { this.$q() })
    }
    Vue.prototype.$q = function () {
      this.component = null;
      this.componentData = null;
    }
    Vue.prototype.$exitComponent = function () {
      this.component = null;
      this.componentData = null;
    }
  }
}
export default dialog;
