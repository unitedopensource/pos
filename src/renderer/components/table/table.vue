<template>
    <div class="dineIn">
        <div class="blueprint">
            <aside>
                <div class="sections">
                    <div class="section btn" v-for="(section,index) in tables" @click="switchSection(index)" :key="index">
                        <span>{{section[language]}}</span>
                    </div>
                </div>
                <div class="functions">
                    <div class="btn" @click="reservation">
                        <i class="fa fa-user-o"></i>
                        <span class="text">{{$t('button.reservation')}}</span>
                    </div>
                    <div class="btn" @click="list">
                        <i class="fa fa-list-alt"></i>
                        <span class="text">{{$t('button.viewList')}}</span>
                    </div>
                </div>
            </aside>
            <div class="tables">
                <div class="table" v-for="(table,index) in viewSection" @click="selectTable(table,$event)" @contextmenu="tableOption(table,$event)" :key="index" :class="{occupy:table.status === 2,prePay:table.status === 3,paid:table.status === 4}">
                    <span :class="[table.shape]" class="icon"></span>
                    <span class="name">{{table.name}}</span>
                    <span class="staff" v-show="table.server">{{table.server}}</span>
                </div>
            </div>
        </div>
        <div class="side">
            <div class="wrap">
                <order-list layout="display" :display="true"></order-list>
                <buttons class="grid" @switch="switchTable" :transfer="queue.length === 0"></buttons>
            </div>
        </div>
        <div :is="component" :init="componentData" @seat="place"></div>
    </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import reservation from "../reservation/index";
import orderList from "../common/orderList";
import dialoger from "../common/dialoger";
import unlock from "../common/unlock";
import counter from "./counter";
import buttons from "./buttons";
import list from "./list";
export default {
  components: { buttons, counter, unlock, dialoger, orderList, list, reservation },
  data() {
    return {
      componentData: null,
      component: null,
      reserved: null,
      queue: [],
      view: 0
    };
  },
  created() {
    this.checkSync();
    this.$bus.on("seat", this.place);
  },
  beforeDestroy() {
    this.$bus.off("seat", this.place);
  },
  methods: {
    checkSync() {
      this.$socket.emit("[SYNC] POS", time => {
        time !== this.sync && console.log("SYNC REQUIRED");
        time !== this.sync && this.$socket.emit("[SYNC] TABLE_LIST");
      });
    },
    switchSection(index) {
      this.view = index;
    },
    //new logic flow methods
    // tap(table) {
    //   table.status === 1
    //     ? this.checkOperation()
    //         .then(this.checkPermission)
    //         .then(this.countGuest)
    //         .then(this.createTable.bind(null, table))
    //         .then(this.checkOccupy)
    //         .catch(this.createTableFailed)
    //     : this.checkPermission()
    //         .then(this.checkTicket)
    //         .catch(this.viewTicketFailed);
    // },
    // checkOccupy() {
    //   return new Promise((resolve, reject) => {});
    // },
    // checkPermission() {
    //   return new Promise((resolve, reject) => {});
    // },
    // countGuest() {
    //   return new Promise((resolve, reject) => {});
    // },
    // createTableFailed(error) {
    //   let { type, reason } = error;
    //   switch (type) {
    //     case "viewTicket":
    //       break;
    //   }
    // },

    //end
    selectTable(table, e) {
      if (!table._id) return;

      if (this.queue.length === 1) {
        this.addToQueue(table);
        return;
      }
      this.setCurrentTable(table);
      switch (table.status) {
        case 0:
          break;
        case 2:
        case 3:
        case 4:
          if (table.invoice.length) {
            let invoice = this.history.find(
              ticket => ticket._id === table.invoice[0]
            );
            invoice
              ? this.setViewOrder(JSON.parse(JSON.stringify(invoice)))
              : this.$dialog({
                  title: "dialog.invoiceNotFound",
                  msg: "dialog.actionProcess",
                  buttons: [
                    { text: "button.resetTable", fn: "reject" },
                    { text: "button.sync", fn: "resolve" }
                  ]
                })
                  .then(() => {
                    this.$socket.emit("[SYNC] ORDER_LIST");
                    this.$q();
                  })
                  .catch(() => {
                    this.$socket.emit("[TABLE] RESET", { _id: table._id });
                    this.$q();
                  });
          } else {
            this.resetMenu();
          }
          break;
        default:
          this.reserved
            ? this.createTableForReserved()
            : this.dinein.passwordRequire
              ? this.unlockTable()
              : this.dinein.guestCount
                ? this.$p("counter")
                : this.createTable(1);
      }
    },
    createTableForReserved() {
      Object.assign(this.customer, { name: this.reserved.name });
      this.dinein.passwordRequire
        ? this.unlockTable(this.reserved.size)
        : this.createTable(this.reserved.size);

      Object.assign(this.reserved, { status: 2 });
      this.$socket.emit("[RESV] UPDATE", this.reserved);
    },
    unlockTable(guest) {
      !isNumber(guest) && (guest = 1);
      this.$denyAccess(true)
        .then(op => {
          if (op._id === this.op._id) {
            this.dinein.guestCount
              ? this.$p("counter")
              : this.createTable(guest);
          } else {
            this.$dialog({
              type: "question",
              title: "dialog.switchOperator",
              msg: ["dialog.switchCurrentOperator", this.op.name, op.name]
            })
              .then(() => {
                let language = op.language || "usEN";
                moment.locale(language === "usEN" ? "en" : "zh-cn");
                this.$setLanguage(language);
                this.setApp({ language, mode: "create" });
                this.setOp(op);
                this.createTable(guest);
              })
              .catch(() => {
                this.$q();
              });
          }
        })
        .catch(() => {
          this.$denyAccess();
        });
    },
    place(reservation) {
      this.reserved = reservation;
    },
    access() {
      new Promise((resolve, reject) => {
        this.componentData = { resolve, reject };
        this.component = "unlock";
      })
        .then(op => {
          op._id === this.op._id ? this.createTable(1) : this.switchUser(op);
        })
        .catch(() => {
          this.$q();
        });
    },
    switchUser(op) {
      this.$dialog({
        type: "question",
        title: "dialog.switchOperator",
        msg: ["dialog.switchCurrentOperator", this.op.name, op.name]
      })
        .then(() => {
          let language = op.language || "usEN";
          moment.locale(language === "usEN" ? "en" : "zh-cn");
          this.$setLanguage(language);
          this.setApp({ language, mode: "create" });
          this.setOp(op);
          this.createTable(1);
        })
        .catch(() => {
          this.$q();
        });
    },
    createTable(guest) {
      this.setTicket({ type: "DINE_IN" });
      this.setTableInfo({
        status: 2,
        session: ObjectId(),
        guest: guest || 1,
        server: this.op.name,
        time: +new Date()
      });
      this.resetMenu();
      this.setApp({ mode: "create" });
      this.$socket.emit("[TABLE] SETUP", this.currentTable);
      this.$router.push({ path: "/main/menu" });
    },
    tableOption(table) {
      if (this.op.role === "Manager" || this.op.role === "Admin") {
        this.$dialog({
          type: "alert",
          title: "dialog.forceClearTable",
          msg: ["dialog.forceClearTableTip", table.server, table.name],
          buttons: [
            { text: "button.cancel", fn: "reject" },
            { text: "button.clear", fn: "resolve" }
          ]
        })
          .then(() => {
            this.$socket.emit("[TABLE] RESET", { _id: table._id });
            this.resetMenu();
            this.$q();
          })
          .catch(() => {
            this.$q();
          });
      }
    },
    switchTable(table) {
      table
        ? table !== this.queue[0] ? this.queue.push(table) : (this.queue = [])
        : (this.queue = []);
    },
    addToQueue(table) {
      if (table.status === 1) {
        this.queue.push(table);
        this.switchTableConfirm();
      } else {
        this.$dialog({
          title: "dialog.tableSwitchFailed",
          msg: "dialog.tableSwitchFailedTip",
          buttons: [{ text: "button.confirm", fn: "resolve" }]
        }).then(() => {
          this.$q();
        });
      }
    },
    list() {
      this.$p("list");
    },
    switchTableConfirm() {
      this.$dialog({
        title: "dialog.tableSwitchConfirm",
        msg: [
          "dialog.tableSwitchConfirmTip",
          this.queue[0].name,
          this.queue[1].name
        ],
        buttons: [
          { text: "button.cancel", fn: "reject" },
          { text: "button.switchTable", fn: "resolve" }
        ]
      })
        .then(() => {
          let t1 = this.queue[0];
          let t2 = Object.assign({}, this.queue[1], {
            session: t1.session,
            guest: t1.guest,
            invoice: t1.invoice,
            status: t1.status,
            server: t1.server,
            time: t1.time
          });
          t1 = Object.assign({}, t1, {
            session: null,
            guest: 0,
            invoice: [],
            status: 1,
            server: null,
            time: null
          });
          this.$socket.emit("[TABLE] SWAP", [t1, t2]);
          this.queue = [];
          this.$q();
        })
        .catch(() => {
          this.queue.pop();
          this.$q();
        });
    },
    reservation() {
      this.$p("reservation");
    },
    ...mapActions([
      "setOp",
      "setApp",
      "resetMenu",
      "setTicket",
      "setViewOrder",
      "setCurrentTable",
      "setTableInfo"
    ])
  },
  computed: {
    viewSection() {
      return this.tables[this.view] ? this.tables[this.view].item : [];
    },
    ...mapGetters([
      "op",
      "sync",
      "store",
      "dinein",
      "tables",
      "language",
      "history",
      "customer",
      "currentTable"
    ])
  }
};
</script>

<style scoped>
.dineIn {
  display: flex;
  flex-direction: row;
  height: 771px;
  width: 1024px;
  padding-top: 63px;
  background: url(../../assets/image/floor.png) #ebeff1;
}

.blueprint {
  width: 740px;
  display: flex;
}

aside {
  display: flex;
  flex-direction: column;
  padding: 5px;
  height: 733px;
}

.functions {
  display: flex;
  flex-direction: column;
}

.sections {
  display: flex;
  flex-direction: column;
  text-align: center;
  flex: 1;
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

.side {
  width: 285px;
}

.grid {
  padding: 6px 3px 0;
}

.icon {
  font-size: 4em;
  width: 64px;
  height: 64px;
}

.prePay {
  box-shadow: 0 1px 3px #009688;
}

.table.prePay .icon {
  color: #009688;
  text-shadow: 0 2px 1px rgba(0, 0, 0, 0.5);
}

.prePay .icon:after {
  font-family: fontAwesome;
  content: "\f298";
  font-size: 16px;
  position: absolute;
  top: 3px;
  right: 3px;
  color: #009688;
}

.occupy {
  box-shadow: 0 1px 3px #ff9800;
}

.table.occupy .icon {
  color: #ff5722;
  text-shadow: 0 2px 1px rgba(0, 0, 0, 0.5);
}

.occupy .icon:after {
  font-family: fontAwesome;
  content: "\f0c0";
  font-size: 16px;
  position: absolute;
  top: 3px;
  right: 3px;
  color: #ff5722;
}

.paid .icon:after {
  font-family: fontAwesome;
  content: "\f1b8";
  font-size: 16px;
  position: absolute;
  bottom: 15px;
  right: 5px;
  color: #4caf50;
}

span.staff {
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
</style>
