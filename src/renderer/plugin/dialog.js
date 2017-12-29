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
          this.componentData.buttons = [
            { text: 'button.cancel', fn: reject, load: false },
            { text: 'button.confirm', fn: resolve, load: false }
          ];
        this.component = "dialoger";
      });
    }
    Vue.prototype.$denyAccess = function (login) {
      if (login) {
        //allow operator enter access pin
        return new Promise((resolve, reject) => {
          this.componentData = { resolve, reject };
          this.component = 'unlock';
        })
      } else {
        this.$dialog({
          type: 'warning',
          title: 'dialog.permissionDenied',
          msg: 'dialog.permissionDeniedTip',
          timeout: { duration: 10000, fn: "reject" },
          buttons: [{ text: 'button.confirm', fn: 'reject' }]
        }).then(() => this.$q()).catch(() => this.$q())
      }
    }
    Vue.prototype.$checkPermission = function (credential, permit) {
      let approve = false;
      const { role, restrict } = this.op;
      const permission = this.op[credential];

      approve = (role === 'Developer' || role === 'Owner') ? true : permission.includes(permit);

      return new Promise((authorized, unauthorized) => {
        if (approve) {
          authorized();
        } else if (restrict) {
          this.$accessDenied();
          unauthorized();
        } else {
          new Promise((resolve, reject) => {
            this.componentData = { resolve, reject };
            this.component = "unlock"
          }).then((operator) => {
            let _approve = false;
            const _permission = operator[credential];
            _approve = (operator.role === 'Developer' || operator.role === 'Owner') ? true : _permission.includes(permit);

            if (_approve) {
              this.$q();
              authorized();
              this.$socket.emit("[SYS] RECORD", { type: "Software", event: "grantPermission", status: 1, cause: "Authorized", data: operator })
            } else {
              this.$accessDenied();
              unauthorized();
              this.$socket.emit("[SYS] RECORD", { type: "Software", event: "grantPermission", status: 0, cause: "Unauthorized", data: operator })
            }
          }).catch(() => {
            this.$accessDenied();
            unauthorized();
          })
        }
      })
    }
    Vue.prototype.$accessDenied = function (prompt) {
      prompt = prompt || {
        title: 'dialog.permissionDenied',
        msg: 'dialog.permissionDeniedTip',
        timeout: { duration: 10000, fn: "reject" },
        buttons: [{ text: 'button.confirm', fn: 'reject' }]
      };

      this.$dialog(prompt).catch(() => this.$q());
    }
    Vue.prototype.$q = function () {
      this.component = null;
      this.componentData = null;
    }
  }
}
export default dialog;