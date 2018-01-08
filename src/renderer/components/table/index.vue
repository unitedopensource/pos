<template>
    <div class="main">
        <section class="layout">
            <aside class="column">
                <div class="sections column">
                    <button class="section btn" v-for="(section,index) in tables" @click="switchSection(index)" :key="index">{{section[language]}}</button>
                </div>
                <div class="column">
                    <button class="btn" @click="openReservation">
                        <i class="fa fa-book"></i>
                        <span class="text">{{$t('button.reservation')}}</span>
                    </button>
                    <button class="btn" @click="viewDineInList">
                        <i class="fa fa-list-alt"></i>
                        <span class="text">{{$t('button.viewList')}}</span>
                    </button>
                </div>
            </aside>
            <div class="tables">
                <div class="table" v-for="(table,index) in viewSection" @click="tap(table)" @contextmenu="resetTable(table)" :key="index" :class="getTableStatus(table.status)">
                    <span :class="[table.shape]" class="icon"></span>
                    <span class="name">{{table.name}}</span>
                    <span class="staff" v-show="table.server">{{table.server}}</span>
                </div>
            </div>
        </section>
        <div class="ticket">
            <div class="wrap">
                <order-list layout="display" :display="true"></order-list>
                <buttons class="grid"></buttons>
            </div>
        </div>
        <div :is="component" :init="componentData"></div>
    </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import orderList from "../common/orderList";
import dialoger from "../common/dialoger";
import counter from "./component/counter";
import unlock from "../common/unlock";
import buttons from "./buttons";

export default {
  props: ["reserved"],
  components: { orderList, dialoger, counter, unlock, buttons },
  computed: {
    viewSection() {
      return this.tables[this.view] ? this.tables[this.view].item : [];
    },
    ...mapGetters([
      "op",
      "sync",
      "dinein",
      "tables",
      "language",
      "history",
      "customer"
    ])
  },
  data() {
    return {
      componentData: null,
      component: null,
      view: 0
    };
  },
  created() {
    this.checkSync();
  },
  methods: {
    checkSync() {
      this.$socket.emit("[SYNC] POS", time => {
        time !== this.sync && this.$socket.emit("[SYNC] TABLE_LIST");
      });
    },
    switchSection(index) {
      this.view = index;
    },
    getTableStatus(status) {
      return {};
    },
    tap(table) {
      table.status === 1
        ? this.checkTableStatus(table)
            .then(this.checkReservation)
            .then(this.checkAccessPin)
            .then(this.countGuest)
            .then(this.createTable.bind(null, table))
            .catch(this.createTableFailed)
        : this.checkPermission(table)
            .then(this.viewTicket)
            .catch(this.exceptionHandler);
    },
    checkPermission(table) {
      return new Promise((next, stop) => {
        table.server === this.op.name
          ? next(table)
          : this.$checkPermission("view", "tables")
              .then(() => next(table))
              .catch(() => stop("UNABLE_VIEW_OTHER_TABLE"));
      });
    },
    checkTableStatus(table) {
      return new Promise((next, stop) => {
        next(table);
      });
    },
    checkReservation(table) {
      return new Promise((next, stop) => {
        next(table);
      });
    },
    checkAccessPin() {
      return new Promise((next, stop) => {
        if (this.dinein.passwordRequire) {
          new Promise((resolve, reject) => {
            this.componentData = { resolve, reject };
            this.component = "unlock";
          })
            .then(_operator => {
              this.$q();

              if (_operator._id === this.op._id) {
                next();
              } else {
                const prompt = {
                  type: "question",
                  title: "dialog.switchOperator",
                  msg: [
                    "dialog.switchCurrentOperator",
                    this.op.name,
                    _operator.name
                  ]
                };

                this.$dialog(prompt)
                  .then(() => {
                    this.$q();
                    const language = _operator.language || "usEN";
                    moment.locale(language === "usEN" ? "en" : "zh-cn");
                    this.$setLanguage(language);
                    this.setApp({ language, newTicket: true });
                    this.setOp(_operator);
                    next();
                  })
                  .catch(() => stop("PASSWORD_MISMATCH"));
              }
            })
            .catch(() => stop("PASSWORD_REQUIRED"));
        } else {
          next();
        }
      });
    },
    countGuest() {
      return new Promise((next, stop) => {});
    },
    viewTicket(table) {
      const invoice = this.history.find(i => i._id === table.invoice[0]);
      const prompt = {
        title: "dialog.invoiceNotFound",
        msg: "dialog.actionProcess",
        buttons: [
          { text: "button.resetTable", fn: "reject" },
          { text: "button.sync", fn: "resolve" }
        ]
      };

      invoice
        ? this.setViewOrder(invoice)
        : this.$dialog(prompt)
            .then(() => {
              this.$socket.emit("[SYNC] ORDER_LIST");
              this.$q();
            })
            .catch(() => {
              this.$socket.emit("[TABLE] RESET", { _id: table._id });
              this.$q();
            });
    },
    createTable(table) {},
    createTableFailed(reason) {
      this.$q();
      let prompt;
      switch (reason) {
        case "PASSWORD_REQUIRED":
          prompt = {
            title: "dialog.unableAccess",
            msg: "dialog.permissionDeniedTip",
            buttons: [{ text: "button.confirm", fn: "resolve" }]
          };
          break;
        case "PASSWORD_MISMATCH":
          prompt = {
            title: "dialog.unableAccess",
            msg: "dialog.accessPinNotMatch",
            buttons: [{ text: "button.confirm", fn: "resolve" }]
          };
          break;
        case "TABLE_RESERVED":
          prompt = {
            title: "dialog.unableAccess",
            msg: "dialog.tableReserved",
            buttons: [{ text: "button.confirm", fn: "resolve" }]
          };
          break;
      }

      this.$dialog(prompt).then(() => this.$q());
    },
    exceptionHandler(error) {
      switch (error) {
        case "UNABLE_VIEW_OTHER_TABLE":
          console.log("trigger");
          break;
      }
    },
    openReservation() {},
    viewDineInList() {},
    ...mapActions(["setViewOrder"])
  }
};
</script>

<style scoped>
.main {
  display: flex;
  flex-direction: row;
  height: 771px;
  width: 1024px;
  padding-top: 63px;
  background: url(../../assets/image/floor.png) #ebeff1;
}

.layout {
  width: 740px;
  display: flex;
}

.column {
  display: flex;
  flex-direction: column;
}

aside {
  padding: 5px;
  height: 733px;
}

.sections {
  text-align: center;
  flex: 1;
}

.grid {
  padding: 3px 3px 0;
}

.tables {
  padding: 3px 0;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: flex-start;
  align-items: flex-start;
  height: 737px;
}

.table {
  height: 81px;
  width: 83px;
  display: flex;
  position: relative;
  align-items: center;
  justify-content: space-around;
  flex-direction: column;
  border-radius: 6px;
  border-top: 1px solid #f3f3f3;
  background: linear-gradient(
    135deg,
    rgb(245, 247, 250) 0%,
    rgb(195, 207, 226) 110%
  );
  margin: 4px;
  text-shadow: 0 1px 1px #fff;
  box-shadow: 0 1px 3px #607d8b;
}

.icon {
  font-size: 4em;
  width: 64px;
  height: 64px;
}

.staff {
  position: absolute;
  background: #03a9f4;
  color: #fff;
  text-shadow: 0 1px 1px #333;
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.5), inset 0 1px 1px #badefb;
  width: 100%;
  text-align: center;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}

.ticket {
  width: 285px;
}
</style>