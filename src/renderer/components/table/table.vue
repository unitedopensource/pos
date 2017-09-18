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
                    <div class="btn">
                        <i class="fa fa-user-o"></i>
                        <span class="text">{{$t('button.reservation')}}</span>
                    </div>
                    <div class="btn">
                        <i class="fa fa-list-alt"></i>
                        <span class="text">{{$t('button.viewList')}}</span>
                    </div>
                </div>
            </aside>
            <div class="tables">
                <div class="table" v-for="(table,index) in viewSection" @click="selectTable(table,$event)" @contextmenu="tableOption(table,$event)" :key="index" :class="{occupy:table.status === 2,prePay:table.status === 3,paid:table.status === 4}">
                    <span :class="[table.shape]" class="icon"></span>
                    <span class="name">{{table.name}}</span>
                </div>
            </div>
        </div>
        <div class="side">
            <div class="wrap">
                <order-list layout="display" :display="true"></order-list>
                <grid class="grid"></grid>
            </div>
        </div>
        <div :is="component" :init="componentData"></div>
    </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import orderList from '../common/orderList'
import dialoger from '../common/dialoger'
import unlock from '../common/unlock'
import setup from './setup'
import grid from './grid'
export default {
    components: { grid, setup, unlock, dialoger, orderList },
    data() {
        return {
            componentData: null,
            component: null,
            view: 0
        }
    },
    created() {
        this.checkSync()
    },
    methods: {
        checkSync() {
            this.$socket.emit("[SYNC] POS", time => {
                time !== this.sync && console.log("SYNC REQUIRED");
                time !== this.sync && this.$socket.emit("[SYNC] TABLE_LIST")
            })
        },
        switchSection(index) {
            this.view = index;
        },
        selectTable(table, e) {
            if (!table._id) return;
            this.setCurrentTable(table);
            switch (table.status) {
                case 0:
                    break;
                case 2:
                case 3:
                case 4:
                    if (table.current.invoice.length) {
                        let invoice = this.history.find(ticket => ticket._id === table.current.invoice[0])
                        invoice ? this.setViewOrder(JSON.parse(JSON.stringify(invoice))) :
                            this.$dialog({
                                title: 'dialog.invoiceNotFound', msg: 'dialog.resetTableStatus',
                                buttons: [{ text: 'button.cancel', fn: 'reject' }, { text: 'button.confirm', fn: 'resolve' }]
                            }).then(() => {
                                this.$socket.emit("[UPDATE] TABLE_SETTLED", { table: table._id, status: 1 })
                                this.$q()
                            }).catch(() => {
                                this.$q()
                            })
                    } else {
                        this.resetMenu()
                    }
                    break;
                default:
                    this.store.table.passwordRequire ? this.access() :
                        this.store.table.guestCount ? this.$p("setup") :
                            this.createTable(1)
            }
        },
        access() {
            new Promise((resolve, reject) => {
                this.componentData = { resolve, reject };
                this.component = 'unlock'
            }).then((op) => {
                op._id === this.op._id ?
                    this.createTable(1) :
                    this.switchUser(op);
            }).catch(() => { this.$q() })
        },
        switchUser(op) {
            this.$dialog({
                type: 'question', title: 'dialog.switchOperator', msg: ['dialog.switchCurrentOperator', this.op.name, op.name]
            }).then(() => {
                let language = op.language || "usEN";
                moment.locale(language === 'usEN' ? 'en' : 'zh-cn');
                this.$setLanguage(language);
                this.setApp({ language, mode: 'create' });
                this.setOp(op);
                this.createTable(1);
            }).catch(() => { this.$q() })
        },
        createTable(guest) {
            this.setTicket({ type: 'DINE_IN' })
            this.setTableInfo({
                status:2,
                session:ObjectId(),
                guest,
                server:this.op.name,
                time:+new Date
            })
            this.resetMenu();
            this.setApp({ mode: 'create' });
            this.$socket.emit("[TABLE] SETUP", this.currentTable);
            this.$router.push({ path: '/main/menu' });
        },
        tableOption(table) {
            if (this.op.role === 'Manager' || this.op.role === 'Admin') {
                this.$dialog({
                    type: "alert", title: "dialog.forceClearTable", msg: ["dialog.forceClearTableTip", table.current.server, table.name],
                    buttons: [{ text: 'button.cancel', fn: 'reject' }, { text: 'button.clear', fn: 'resolve' }]
                }).then(() => {
                    let _table = Object.assign({}, table, {
                        status: 1,
                        current: {
                            color: "",
                            group: "",
                            guest: 1,
                            invoice: [],
                            server: "",
                            time: ""
                        }
                    });
                    this.$socket.emit("TABLE_MODIFIED", _table);
                    this.resetMenu();
                    this.$q();
                }).catch(() => { this.$q() })
            }
        },
        ...mapActions(['setOp', 'setApp', 'resetMenu', 'setTicket', 'setViewOrder', 'setCurrentTable', 'setTableInfo'])
    },
    computed: {
        viewSection() {
            return this.tables[this.view].item;
        },
        ...mapGetters(['op', 'sync', 'store', 'tables', 'language', 'history', 'currentTable'])
    }
}
</script>

<style scoped>
.dineIn {
    display: flex;
    flex-direction: row;
    height: 771px;
    width: 1024px;
    padding-top: 63px;
    background: url(../../assets/image/table.png) #ebeff1;
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
    background: linear-gradient(135deg, rgb(245, 247, 250) 0%, rgb(195, 207, 226) 110%);
    margin: 4px;
    text-shadow: 0 1px 1px #fff;
    box-shadow: 0 1px 3px #607D8B;
}

.side {
    width: 285px;
}

.grid {
    padding: 6px 3px 0;
}

.icon {
    font-size: 4em;
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
    content: '\f02f';
    font-size: 16px;
    position: absolute;
    bottom: 15px;
    right: 5px;
    color: #009688;
}

.occupy {
    box-shadow: 0 1px 3px #FF9800;
}

.table.occupy .icon {
    color: #FF5722;
    text-shadow: 0 2px 1px rgba(0, 0, 0, 0.5);
}

.occupy .icon:after {
    font-family: fontAwesome;
    content: '\f0c0';
    font-size: 16px;
    position: absolute;
    bottom: 15px;
    right: 5px;
    color: #FF5722;
}

.paid .icon:after {
    font-family: fontAwesome;
    content: '\f1b8';
    font-size: 16px;
    position: absolute;
    bottom: 15px;
    right: 5px;
    color: #4CAF50;
}
</style>
