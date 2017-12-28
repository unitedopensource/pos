const dialog = {
  install(Vue, options) {
    Vue.mixin({
      methods: {
        approval(credential, permit) {
          let approve = false;

          try {
            approve = (this.op.role === 'Developer' || this.op.role === 'Owner') ? true : credential.includes(permit)
          } catch (e) { }

          return approve
        }
      }
    });
    Vue.prototype.$p = function (component, args, resolveHandler, rejectHandler) {
      return new Promise((resolve, reject) => {
        this.componentData = Object.assign({
          resolve,
          reject
        }, args);
        this.component = component;
      }).then((result) => {
        resolveHandler && resolveHandler(result);
        this.$q();
      }).catch((result) => {
        rejectHandler && rejectHandler(result);
        this.$q();
      });
    }
    Vue.prototype.$dialog = function (args) {
      return new Promise((resolve, reject) => {
        this.componentData = {
          type: args.type || "alert",
          title: args.title,
          msg: args.msg,
          timeout: args.hasOwnProperty('timeout') ? {
            duration: args.timeout.duration || 15000,
            fn: args.timeout.fn === 'resolve' ? resolve : reject
          } : null,
          buttons: [],
          resolve,
          reject
        };
        args.hasOwnProperty('buttons') ?
          args.buttons.forEach(button => {
            this.componentData.buttons.push({
              text: button.text,
              fn: button.fn === 'resolve' ? resolve : reject,
              load: !!button.load
            })
          }) :
          this.componentData.buttons = [{
            text: 'button.cancel',
            fn: reject,
            load: false
          }, {
            text: 'button.confirm',
            fn: resolve,
            load: false
          }]
        this.component = "dialoger";
      });
    }
    Vue.prototype.$denyAccess = function (login) {
      if (login) {
        //allow operator enter access pin
        return new Promise((resolve, reject) => {
          this.componentData = {
            resolve,
            reject
          };
          this.component = 'unlock';
        })
      } else {
        this.$dialog({
          type: 'warning',
          title: 'dialog.accessDenied',
          msg: 'dialog.accessDeniedTip',
          timeout: {
            duration: 10000
          },
          buttons: [{
            text: 'button.confirm',
            fn: 'reject'
          }]
        }).then(() => {
          this.$q()
        }).catch(() => {
          this.$q()
        })
      }
    }
    Vue.prototype.$accessDenied = function (restriction) {
      if (restriction) {
        //No login allowed

        this.$dialog({
          type: 'warning',
          title: 'dialog.accessDenied',
          msg: 'dialog.accessDeniedTip',
          timeout: {
            duration: 10000
          },
          buttons: [{
            text: 'button.confirm',
            fn: 'resolve'
          }]
        }).then(() => {
          this.$q()
        }).catch(() => {
          this.$q()
        })
      } else {
        //allow operator to access

        return new Promise((resolve, reject) => {
          this.componentData = {
            resolve,
            reject
          };
          this.component = 'unlock'
        })
      }
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