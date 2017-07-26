<template>
    <div class="container">
        <aside>
            <div class="back" @click="back">
                <i class="fa fa-chevron-left"></i>{{text('BACK')}}</div>
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
                index
            </div>
            <div v-else class="content">
                <section class="card">
                    <header>{{text('CONFIG')}}
                        <span class="tip"></span>
                    </header>
                    <article>
                        <smart-input v-model="op.name" label="NAME"></smart-input>
                        <smart-option v-model="op.role" label="ROLE" :options="roles"></smart-option>
                        <smart-input v-model="op.pin" label="PASSWORD" type="password"></smart-input>
                        <smart-option v-model="op.language" label="LANGUAGE" :options="languages"></smart-option>
                        <smart-switch v-model="op.timeCard" label="TIMECARD"></smart-switch>
                        <smart-input v-model="op.employeeCard" label="EMPLOYEE_CARD" type="password"></smart-input>
                    </article>
                </section>
                <section class="card list">
                    <header>{{text('PERMISSION')}}
                        <span class="tip">{{text('OPERATOR.PERMISSION.TIP')}}</span>
                    </header>
                    <div class="header">
                        <span class="name">{{text('ALIES')}}</span>
                        <span class="f1">{{text('APPLY')}}</span>
                    </div>
                    <article>
                        <div class="datalist">
                            <span class="name">{{text('ACCESS')}}</span>
                            <span class="f1">
                                <checkbox v-model="op.access" label="setting" :multiple="true"></checkbox>
                                <checkbox v-model="op.access" label="cashdrawer" :multiple="true"></checkbox>
                                <checkbox v-model="op.access" label="report" :multiple="true"></checkbox>
                            </span>
                        </div>
                        <div class="datalist">
                            <span class="name">{{text('MODIFY')}}</span>
                            <span class="f1">
                                <checkbox v-model="op.modify" label="price" :multiple="true"></checkbox>
                                <checkbox v-model="op.modify" label="order" :multiple="true"></checkbox>
                                <checkbox v-model="op.modify" label="driver" :multiple="true"></checkbox>
                                <checkbox v-model="op.modify" label="transaction" :multiple="true"></checkbox>
                                <checkbox v-model="op.modify" label="discount" :multiple="true"></checkbox>
                            </span>
                        </div>
                        <div class="datalist">
                            <span class="name">{{text('VIEW')}}</span>
                            <span class="f1">
                                <checkbox v-model="op.view" label="summary" :multiple="true"></checkbox>
                            </span>
                        </div>
                    </article>
                </section>
                <section class="card list">
                    <header>{{text('ACTIVITY')}}
                        <span class="tip">{{text('OPERATOR.TIMECARD.TIP')}}</span>
                    </header>
                    <div class="header">
                        <span class="approve">{{text('REVIEW')}}</span>
                        <span class="time">{{text('CLOCK_IN')}}</span>
                        <span class="time">{{text('CLOCK_OUT')}}</span>
                        <span class="calc">{{text('WORK_HOUR')}}</span>
                    </div>
                    <article>
                        <div class="datalist" v-for="(log,index) in activities" :key="index">
                            <span class="approve">{{log.valid}}</span>
                            <span class="time">{{log.clockIn | moment('M/D/YY HH:mm:ss')}}</span>
                            <span class="time">{{log.clockOut | moment('M/D/YY HH:mm:ss')}}</span>
                            <span class="calc">{{workHour(log.clockIn,log.clockOut)}}</span>
                        </div>
                        <div class="more" @click="more">
                            <i class="fa fa-plus"></i>
                        </div>
                    </article>
                </section>
            </div>
            <footer class="update" v-if="change">
                <i class="fa fa-info-circle"></i>
                <span>{{txt}}</span>
                <span v-show="!send">
                    <span @click="save" class="save">{{text('SAVE')}}</span>
                    <span @click="cancel" class="cancel">{{text('CANCEL')}}</span>
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
            roles: ['Manager', 'Cashier', 'Waitstaff', 'Bartender'],
            languages: [{ label: "PRIMARY", value: "zhCN" }, { label: "SECONDARY", value: "usEN" }],
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
                this.$dialog({ title: 'OP_DELETE_FAILED', msg: "TIP_DELETE_FAILED", buttons: [{ title: 'CONFIRM', fn: 'resolve' }] }).then(() => { this.$exitComponent() });
                return;
            }
            this.$dialog({ title: "OP_DELETE_CONFIRM", msg: "TIP_OP_DELETE" }).then(() => {
                op._id ?
                    this.$socket.emit("[CMS] REMOVE_USER", op._id) :
                    this.operators.splice(index, 1);
                this.op = null;
                this.$exitComponent();
            }).catch(() => {
                this.$exitComponent();
            })
        },
        save() {
            if (this.checkUniquePin()) {
                this.$dialog({ title: 'SAVE_FAILED', msg: 'SETTING.OPERATOR.PIN_DUPLICATE', buttons: [{ text: 'CONFIRM', fn: 'resolve' }] }).then(() => { this.$exitComponent() });
                return;
            }
            this.send = true;
            this.txt = this.text('SETTING_UPDATED');
            this.$socket.emit("[CMS] UPDATE_USER", this.op);
            setTimeout(() => { this.cancel() }, 1000);
        },
        checkUniquePin() {
            let pin = this.op.pin;
            if (!pin) {
                this.$dialog({ title: 'SAVE_FAILED', msg: 'SETTING.OPERATOR.NO_PIN', buttons: [{ text: 'CONFIRM', fn: 'resolve' }] }).then(() => { this.$exitComponent() });
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
                language: 'PRIMARY',
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
    font-style: italic;
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
    overflow: auto;
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
}
</style>