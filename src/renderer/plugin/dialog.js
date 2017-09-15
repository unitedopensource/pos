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
        resolveHandler && resolveHandler(result);
        this.$q();
      }).catch((result) => {
        rejectHandler && rejectHandler(result);
        this.$q();
      });
    }
    // Vue.prototype._p = function (component, args) {
    //   let vm = this;
    //   let promise = new Promise((resolve, reject) => {
    //     this.componentData = Object.assign({ resolve, reject }, args);
    //     this.component = component;
    //   })
    //   let proxy = new Proxy(promise, {
    //     get: (target, prop, receiver) => {
    //       console.log(prop)
    //       if (prop === 'then') {
    //         console.log(target,prop)
    //         return target.then.bind(target)
    //       } else {
    //         return target.catch.bind(target)
    //       }
    //     }
    //   })
    //   return proxy
    // }
    Vue.prototype.$dialog = function (args) {
      return new Promise((resolve, reject) => {
        this.componentData = {
          type: args.type || "alert",
          title: args.title,
          msg: args.msg,
          timeout: args.hasOwnProperty('timeout') ?
            {
              duration: args.timeout.duration || 15000,
              fn: args.timeout.fn === 'resolve' ? resolve : reject
            } : null,
          buttons: [],
          resolve, reject
        };
        args.hasOwnProperty('buttons') ?
          args.buttons.forEach(button => { this.componentData.buttons.push({ text: button.text, fn: button.fn === 'resolve' ? resolve : reject }) }) :
          this.componentData.buttons = [{ text: 'button.cancel', fn: reject }, { text: 'button.confirm', fn: resolve }]
        this.component = "dialoger";
      });
    }
    Vue.prototype.$denyAccess = function (manager) {
      let buttons = manager ? [{ text: 'button.code', fn: 'resolve' }, { text: 'button.cancel', fn: 'reject' }] : [{ text: 'button.confirm', fn: 'reject' }];
      this.$dialog({ type: 'warning', title: 'dialog.accessDenied', msg: 'dialog.accessDeniedTip', timeout: { duration: 10000 }, buttons }).then(() => { this.$q() }).catch(() => { this.$q() })
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
