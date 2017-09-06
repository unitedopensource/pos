<template>
    <div>
        <section class="card">
            <header>{{$t('setting.station')}}
                <span class="tip"></span>
            </header>
            <article>
                <smart-input v-model="workStation.alies" reg="^[a-zA-Z0-9_. ]{2,10}$" label="text.name"></smart-input>
                <smart-input v-model="workStation.mac" label="text.mac" :disable="true"></smart-input>
                <smart-switch v-model="workStation.wol" label="text.autoAwake"></smart-switch>
                <smart-switch v-model="workStation.receiveOnlineOrder" label="text.receiveOnlineOrder"></smart-switch>
            </article>
        </section>
        <section class="card">
            <header>{{$t('setting.terminal')}}
                <span class="tip">{{$t('setting.terminalTip')}}</span>
            </header>
            <article>
                <smart-switch v-model="workStation.terminal.enable" label="text.enable"></smart-switch>
                <smart-option v-model="workStation.terminal.model" :options="devices" label="text.model"></smart-option>
                <smart-input v-model="workStation.terminal.address" reg="^[0-9. ]{3,}$" label="text.ipAddress" @dblclick.native="searchTool"></smart-input>
                <smart-input v-model="workStation.terminal.port" reg="^[a-zA-Z0-9_. ]{2,10}$" label="text.port"></smart-input>
                <smart-input v-model="workStation.terminal.sn" label="text.authCode"></smart-input>
            </article>
        </section>
        <section class="card">
            <header>{{$t('setting.poleDisplay')}}
                <span class="tip">{{$t('setting.poleDisplayTip')}}</span>
            </header>
            <article>
                <smart-switch v-model="workStation.pole.enable" label="text.enable"></smart-switch>
                <smart-option v-model="workStation.pole.port" label="text.port" :options="ports"></smart-option>
                <smart-input v-model="workStation.pole.top" label="text.firstLine" :disable="!workStation.pole.enable"></smart-input>
                <smart-input v-model="workStation.pole.btm" label="text.secondLine" :disable="!workStation.pole.enable"></smart-input>
            </article>
        </section>
        <section class="card">
            <header>{{$t('setting.scale')}}</header>
            <article>
                <smart-switch v-model="workStation.scale.enable" label="text.enable"></smart-switch>
                <smart-option v-model="workStation.scale.port" label="text.port" :options="ports"></smart-option>
            </article>
        </section>
        <section class="card">
            <header>{{$t('setting.callerId')}}</header>
            <article>
                <smart-switch v-model="workStation.callid.enable" label="text.enable"></smart-switch>
                <smart-option v-model="workStation.callid.port" label="text.port" :options="ports"></smart-option>
                <smart-option v-model="workStation.callid.command" :options="commands" label="text.command"></smart-option>
            </article>
        </section>
        <section class="card">
            <header>{{$t('setting.security')}}</header>
            <article>
                <smart-range v-model="workStation.timeout" label="text.autoLock" min="0" max="600" step="30"></smart-range>
            </article>
        </section>
        <section class="card">
            <header>{{$t('setting.printer')}}</header>
            <article>
                <smart-switch v-model="workStation.printRedirect" label="text.redirect"></smart-switch>
                <redirector :options="printers" @update="update" :init="workStation.print"></redirector>
            </article>
        </section>
        <section class="card">
            <header>{{text('setting.cashDrawer')}}</header>
            <article>
                <smart-switch v-model="workStation.cashDrawer.enable" label="text.enable"></smart-switch>
                <smart-input v-model="workStation.cashDrawer.name" label="text.name" :disable="!workStation.cashDrawer.enable"></smart-input>
                <smart-option v-model="workStation.cashDrawer.bind" label="text.binding" :options="printers"></smart-option>
                <smart-switch v-model="workStation.cashDrawer.cashFlowCtrl" label="text.cashFlowCtrl"></smart-switch>
                <smart-input v-model="workStation.cashDrawer.initialAmount" label="text.initialAmount" :disable="!workStation.cashDrawer.cashFlowCtrl"></smart-input>
                <!-- <smart-input v-model.number="workStation.cashDrawer.errors" label="errorsAllow" :disable="!workStation.cashDrawer.cashFlowCtrl"></smart-input> -->
            </article>
        </section>
        <section class="card">
            <header>{{$t('text.ui')}}</header>
            <article>
                <smart-switch v-model="workStation.enlargeTitle" label="text.enlargeTitle"></smart-switch>
            </article>
            <article class="grid" :class="{enlarge:workStation.enlargeTitle}">
                <div v-for="(grid,index) in workStation.interface" :key="index" class="block" @click="edit(grid,index)" :class="{disable:!grid.enable}">
                    <i class="fa icon" :class="[grid.icon]"></i>
                    <h1>{{grid.head}}</h1>
                    <h4>{{grid.subhead}}</h4>
                </div>
            </article>
        </section>
        <div :is="component" :init="componentData"></div>
    </div>
</template>

<script>
import { mapGetters } from 'vuex'
import smartInput from '../common/smartInput'
import smartRange from '../common/smartRange'
import smartSwitch from '../common/smartSwitch'
import smartOption from '../common/smartOption'
import redirector from '../common/redirector'
import search from './search'
import editor from './uiEditor'
export default {
    components: { smartInput, smartRange, smartSwitch, smartOption, redirector, editor, search },
    created() {
        this.workStation = JSON.parse(JSON.stringify(this.station));
        this.printers = Object.keys(this.config.printer);
    },
    data() {
        return {
            change: false,
            component: null,
            componentData: null,
            workStation: null,
            devices: ['SP30', 'S80', 'S300', 'NX2200'],
            ports: ['COM1', 'COM2', 'COM3', 'COM4', 'COM5', 'COM6', 'COM7', 'COM8', 'COM9'],
            commands: ['AT#CID=1', 'AT+VCID=1', 'AT%CCID=1'],
            printers: []
        }
    },
    methods: {
        edit(ui, index) {
            new Promise((resolve, reject) => {
                this.componentData = { resolve, reject, ui };
                this.component = "editor";
            }).then(result => {
                this.workStation.interface.splice(index, 1, result);
                this.$q()
            }).catch(() => { this.$q() })
        },
        searchTool() {
            new Promise((resolve, reject) => {
                this.componentData = { resolve, reject };
                this.component = "search";
            }).then(ip => {
                this.workStation.terminal.address = ip;
                this.$q()
            }).catch(() => { this.$q() })
        },
        update(data) {
            this.workStation.print = data;
        },
    },
    watch: {
        workStation: {
            handler(n) {
                let keys = Object.keys(n);
                this.change = keys.some(key => {
                    return typeof n[key] === 'string' ?
                        n[key] !== this.station[key] :
                        JSON.stringify(n[key]) !== JSON.stringify(this.station[key]);
                })
                if (this.change) {
                    let stations = Object.keys(this.store.station);
                    let index = stations.findIndex(key => this.store.station[key].mac === n.mac);
                    let name = stations[index];
                    let store = JSON.parse(JSON.stringify(this.store));
                    store.station[name] = n;
                    this.$emit("change", store)
                } else {
                    this.$emit("unchange");
                }
            }, deep: true
        }
    },
    computed: {
        ...mapGetters(['config', 'store', 'station'])
    }

}
</script>

<style scoped>
.grid {
    display: flex;
    flex-wrap: wrap;
}

.block {
    width: 150px;
    padding: 35px 20px 15px;
    border-right: 1px solid #ccc;
    border-bottom: 1px solid #ccc;
    color: #333;
    position: relative;
    cursor: pointer;
}

.block:nth-child(4n) {
    border-right: none;
}

.icon {
    position: absolute;
    right: 0;
    top: 0px;
    padding: 10px 15px;
}

.enlarge h1{
    font-size: 2em;
    font-weight: normal;
}

.block h4 {
    font-weight: normal;
    color: gray;
}

.disable {
    color: #F5F5F5;
}

.disable h4 {
    color: #F5F5F5;
}
</style>