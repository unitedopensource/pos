<template>
    <div class="container">
        <aside>
            <div class="back" @click="back">
                <i class="fa fa-chevron-left"></i>{{$t('button.back')}}</div>
            <div v-for="(operator,index) in operators" :key="index" class="op" @click="getProfile(operator,index,$event)">
                <h3>{{operator.name}}</h3>
                <span class="role">{{operator.role}}</span>
                <i class="fa fa-times" @click="remove(operator,index)"></i>
            </div>
            <div class="add" @click="add">
                <i class="fa fa-plus"></i>
            </div>
        </aside>
        <main class="form">
            <div class="content" v-if="!op">

            </div>
            <div v-else class="content">
                <section class="card">
                    <header>{{$t('setting.config')}}
                        <span class="tip"></span>
                        <span class="extra">
                            <i class="fa fa-ellipsis-v"></i>{{$t('text.advance')}}</span>
                    </header>
                    <article>
                        <smart-input v-model="op.name" label="text.name"></smart-input>
                        <smart-option v-model="op.role" label="text.role" :options="roles"></smart-option>
                        <smart-input v-model="op.pin" label="text.password" type="password"></smart-input>
                        <smart-option v-model="op.language" label="text.defaultLanguage" :options="languages"></smart-option>
                        <smart-switch v-model="op.timeCard" label="text.timeCard"></smart-switch>
                        <smart-input v-model="op.employeeCard" label="text.employeeCard" type="password"></smart-input>

                    </article>
                </section>
                <section class="card list">
                    <header>{{$t('setting.permission')}}
                        <span class="tip">{{$t('setting.permissionTip')}}</span>
                    </header>
                    <div class="header">
                        <span class="name">{{$t('text.name')}}</span>
                        <span class="f1">{{$t('text.apply')}}</span>
                    </div>
                    <article>
                        <div class="datalist">
                            <span class="name">{{$t('setting.access')}}</span>
                            <div class="f1">
                                <checkbox v-model="op.access" val="setting" label="text.setting" :multiple="true"></checkbox>
                                <checkbox v-model="op.access" val="cashdrawer" label="text.cashDrawer" :multiple="true"></checkbox>
                                <checkbox v-model="op.access" val="report" label="text.report" :multiple="true"></checkbox>
                                <checkbox v-model="op.access" val="terminal" label="text.terminal" :multiple="true"></checkbox>
                            </div>
                        </div>
                        <div class="datalist">
                            <span class="name">{{$t('setting.modify')}}</span>
                            <div class="f1">
                                <checkbox v-model="op.modify" val="price" label="text.price" :multiple="true"></checkbox>
                                <checkbox v-model="op.modify" val="order" label="text.order" :multiple="true"></checkbox>
                                <checkbox v-model="op.modify" val="driver" label="text.driver" :multiple="true"></checkbox>
                                <checkbox v-model="op.modify" val="transaction" label="text.transaction" :multiple="true"></checkbox>
                                <checkbox v-model="op.modify" val="discount" label="text.discount" :multiple="true"></checkbox>
                            </div>
                        </div>
                        <div class="datalist">
                            <span class="name">{{$t('setting.view')}}</span>
                            <div class="f1">
                                <checkbox v-model="op.view" val="summary" label="text.viewSummary" :multiple="true"></checkbox>
                                <checkbox v-model="op.view" val="invoices" label="text.viewInvoices" :multiple="true"></checkbox>
                                <checkbox v-model="op.view" val="tables" label="text.viewTables" :multiple="true"></checkbox>
                            </div>
                        </div>
                    </article>
                </section>
                <section class="card list">
                    <header>{{$t('setting.timeCardActivity')}}
                        <span class="tip">{{text('setting.timeCardActivityTip')}}</span>
                    </header>
                    <div class="header">
                        <span class="approve">{{$t('text.approve')}}</span>
                        <span class="time">{{$t('text.clockInTime')}}</span>
                        <span class="time">{{$t('text.clockOutTime')}}</span>
                        <span class="calc">{{$t('text.workHour')}}</span>
                    </div>
                    <article>
                        <div class="datalist" v-for="(log,index) in activities" :key="index">
                            <span class="approve">{{log.valid}}</span>
                            <span class="time">{{log.clockIn | moment('M/D/YY HH:mm:ss')}}</span>
                            <span class="time">{{log.clockOut | moment('M/D/YY HH:mm:ss')}}</span>
                            <span class="calc">{{workHour(log.clockIn,log.clockOut)}}</span>
                        </div>
                        <div class="more" @click="more">
                            <i class="fa fa-caret-down"></i>
                            <span>{{$t('button.viewMore')}}</span>
                        </div>
                    </article>
                </section>
            </div>
            <footer class="update" v-if="change">
                <i class="fa fa-info-circle"></i>
                <span>{{txt}}</span>
                <span v-show="!send">
                    <span @click="save" class="save">{{$t('button.save')}}</span>
                    <span @click="cancel" class="cancel">{{$t('button.save')}}</span>
                </span>
            </footer>
        </main>
        <div :is="component" :init="componentData"></div>
    </div>
</template>

<script>
import dialoger from '../../common/dialoger'
import smartOption from '../common/smartOption'
import smartSwitch from '../common/smartSwitch'
import smartInput from '../common/smartInput'
import checkbox from '../common/checkbox'
export default {
    components: { dialoger, checkbox, smartInput, smartOption, smartSwitch },
    created() {
        this.$socket.emit("INQUIRY_ALL_OPS");
    },
    data() {
        return {
            operators: [],
            component: null,
            componentData: null,
            activities: [],
            roles: ['Manager', 'Cashier', 'Waitstaff', 'Bartender', 'ThirdParty'],
            languages: [
                { label: this.$t("text.primary") + ' us-en', value: "usEN" },
                { label: this.$t("text.secondary") + ' zh-cn', value: "zhCN" }],
            compare: null,
            change: false,
            send: false,
            index: null,
            txt: "",
            op: null
        }
    },
    methods: {
        getProfile(profile, index, e) {
            let dom = document.querySelector(".active");
            dom && dom.classList.remove("active");
            e.currentTarget.classList.add("active");
            this.activities = [];
            this.op = profile;
            this.index = index;
            this.compare = JSON.stringify(profile);
            this.$socket.emit("INQUIRY_OP_ACTIVITY", { id: this.op._id, index: 0 });
        },
        back() {
            this.$router.push({ name: "Setting.index" })
        },
        trigger() {
            this.txt = this.text("TIP_SAVE_CONFIG");
            this.change = true;
            this.send = false;
        },
        more() {
            this.$socket.emit("INQUIRY_OP_ACTIVITY", { id: this.op._id, index: this.activities.length });
        },
        remove(op, index) {
            if (this.operators.length === 1) {
                this.$dialog({
                    title: 'dialog.deleteOperatorFailed', msg: "deleteOperatorFailedTip",
                    buttons: [{ title: 'button.confirm', fn: 'resolve' }]
                }).then(() => { this.$q() });
                return;
            }
            this.$dialog({
                title: "dialog.deleteOperatorConfirm", msg: this.$t('dialog.deleteOperatorConfirmTip', op.name)
            }).then(() => {
                op._id ?
                    this.$socket.emit("[CMS] REMOVE_USER", op._id) :
                    this.operators.splice(index, 1);
                this.op = null;
                this.$q();
            }).catch(() => { this.$q() })
        },
        save() {
            if (this.checkUniquePin()) {
                this.$dialog({
                    title: 'dialog.saveOperatorFailed', msg: 'dialog.operatorPinDuplicate',
                    buttons: [{ text: 'button.confirm', fn: 'resolve' }]
                }).then(() => { this.$q() });
                return;
            }
            this.send = true;
            this.txt = this.$t('text.settingUpdated');
            this.$socket.emit("[CMS] UPDATE_USER", this.op);
            setTimeout(() => { this.cancel() }, 1000);
        },
        checkUniquePin() {
            let pin = this.op.pin;
            if (!pin) {
                this.$dialog({
                    title: 'dialog.saveOperatorFailed', msg: 'dialog.operatorNoPin',
                    buttons: [{ text: 'button.confirm', fn: 'resolve' }]
                }).then(() => { this.$q() });
                return true
            };
            let operators = this.operators.filter((op, index) => (index !== this.index && op.pin)).map(op => op.pin);
            return operators.includes(pin)
        },
        cancel() {
            this.change = false;
            this.send = false;
        },
        add() {
            this.operators.push({
                name: 'New Operator',
                role: 'Waitstaff',
                pin: '',
                language: 'usEN',
                timeCard: false,
                access: [],
                modify: [],
                assign: [],
                view: []
            });
        },
        workHour(clockIn, clockOut) {
            if (!clockOut) return;
            let diff = clockOut - clockIn;
            return `${("0" + Math.floor(diff / 36e5)).slice(-2) + "  Hr."} ${("0" + Math.floor(diff / 6e4 % 60)).slice(-2) + "  Min."}`
        }
    },
    watch: {
        'op': {
            handler(n) {
                JSON.stringify(n) !== this.compare ? this.trigger() : this.cancel();
            }, deep: true
        }
    },
    sockets: {
        OP_LIST(data) {
            this.operators = data;
        },
        OP_ACTIVITY(data) {
            this.activities.push(...data);
        }
    }
}
</script>

<style scoped>
.back {
    padding: 25px 10px;
    font-weight: bold;
    cursor: pointer;
    background: #009688;
    color: #fff;
    text-shadow: 0 1px 1px #000;
}

aside {
    height: 100%;
    background: #fff;
    width: 200px;
}

.form {
    flex: 1;
    height: 738px;
    display: flex;
    flex-direction: column;
}

.op {
    display: flex;
    flex-direction: column;
    text-indent: 1em;
    border-bottom: 1px solid #eee;
    padding: 5px;
    color: #888;
    cursor: pointer;
    position: relative;
    border-left: 2px solid transparent;
}

.op i {
    position: absolute;
    right: 0;
    top: 0;
    padding: 17px;
    text-indent: 0;
    color: red;
    display: none;
}

.active.op i {
    display: block;
}

.op.active {
    border-left: 2px solid #2196F3;
    background: #F5F5F5;
    color: #333;
}

.add {
    text-align: center;
    padding: 15px 0;
    border: 2px dashed #E0E0E0;
    color: #BDBDBD;
    background: #ffffff;
    cursor: pointer;
}

.role {
    color: #FF9800;
    font-weight: lighter;
}

.list .header {
    padding: 10px 0;
    background: #4D6D83;
    color: #fff;
    display: flex;
    border-bottom: 1px solid #455A64;
}

.name {
    width: 150px;
    padding: 0 10px;
}

.content {
    overflow-y: scroll;
    flex: 1;
}

.time {
    width: 130px;
    padding: 0 10px;
}

.approve {
    width: 100px;
    text-align: center;
}

.more {
    text-align: center;
    padding: 10px;
    border: 2px dashed #eee;
    color: #ddd;
    cursor: pointer;
}

.f1 {
    display: flex;
    flex-wrap: wrap;
}

.datalist .name {
    text-align: center;
}

.extra {
    font-size: initial;
    font-weight: initial;
    float: right;
    cursor: pointer;
}

.extra i {
    margin-right: 5px;
}
</style>