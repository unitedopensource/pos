const dialog = {
  install(Vue, options) {
    Vue.mixin({
      methods: {
        approval(credential, permit) {
          let approve = false;

          try {
            approve = (this.op.role === 'Developer' || this.op.role === 'Owner') ? true : credential.includes(permit)
          } catch (error) {
            this.$log({
              eventID: 1205,
              type: "bug",
              cause: error,
              source: "plugin/dialog.js",
              note: `An error occurred when try to determine operator's permission. Most likely need to reset operator's setting.`
            })
          }

          return approve
        },
        $log(event) {
          const { eventID, type, note, cause, data, source = "CLIENT" } = event;
          this.$socket.emit("[SYS] LOG", { eventID, type, note, cause, data, source });
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
        const prompt = {
          type: 'warning',
          title: 'dialog.permissionDenied',
          msg: 'dialog.permissionDeniedTip',
          timeout: { duration: 10000, fn: "reject" },
          buttons: [{ text: 'button.confirm', fn: 'reject' }]
        };

        this.$dialog(prompt).then(() => this.$q()).catch(() => this.$q())
      }
    }
    Vue.prototype.$checkPermission = function (credential, permit) {
      let approve = false;
      const { name, role, restrict } = this.op;
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
            this.componentData = { resolve, reject, grant: true };
            this.component = "unlock"
          }).then((operator) => {
            let _approve = false;
            const _permission = operator[credential];
            _approve = (operator.role === 'Developer' || operator.role === 'Owner') ? true : _permission.includes(permit);

            if (_approve) {
              this.$q();
              authorized();
              this.$log({ eventID: 1203, type: "success", source: "plugin/dialog.js", note: `${name} has granted ${permit} permission from ${operator.name}` });
            } else {
              this.$accessDenied();
              unauthorized();
              const note = `${name} attempted to grant ${permit} permission from ${operator.name} but neither has ${permit} permission.`;
              this.$log({ eventID: 1204, type: "failure", source: "plugin/dialog.js", note });
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
        type: 'warning',
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