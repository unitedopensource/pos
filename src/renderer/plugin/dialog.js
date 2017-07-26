const dialog = {
  install(Vue, options) {
    Vue.mixin({
      methods: {
        approval(credential, permit) {
          return this.op.role === 'Admin' ? true :credential.includes(permit);
        }
      }
    });
    Vue.prototype.$dialog = function (args) {
      let dialog = new Promise((resolve, reject) => {
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
          args.buttons.forEach(button => {
            this.componentData.buttons.push({
              text: button.text, fn: button.fn === 'resolve' ? resolve : reject
            })
          }) :
          this.componentData.buttons = [{ text: 'CANCEL', fn: reject }, { text: 'CONFIRM', fn: resolve }]
        this.component = "dialoger";
      });
      return dialog;
    }
    Vue.prototype.$denyAccess = function (manager) {
      let buttons = manager ? [{
        text: this.text('MANAGER_CODE'),
        fn: 'resolve'
      }, {
        text: this.text('CONFIRM'),
        fn: 'reject'
      }] : [{
        text: this.text('CONFIRM'),
        fn: 'reject'
      }];
      this.$dialog({
        type: 'warning',
        title: this.text('PD_ACCESS'),
        msg: this.text('TIP_PD_ACCESS'),
        timeout: {
          duration: 10000
        },
        buttons
      }).then(() => {
        this.$exitComponent();
      }).catch(() => {
        this.$exitComponent();
      })
    }
    Vue.prototype.$exitComponent = function () {
      this.component = null;
      this.componentData = null;
    }
  }
}
export default dialog;
