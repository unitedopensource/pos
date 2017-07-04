<template>
    <div>
        <section class="card">
            <header>{{text('STATION')}}
                <span class="tip"></span>
            </header>
            <article>
                <smart-input v-model="workStation.alies" reg="^[a-zA-Z0-9_. ]{2,10}$" label="NAME"></smart-input>
                <smart-input v-model="workStation.mac" label="MAC" :disable="true"></smart-input>
                <smart-switch v-model="workStation.receiveOnlineOrder" label="ONLINE_ORDER"></smart-switch>
            </article>
        </section>
        <section class="card">
            <header>{{text('TERM')}}
                <span class="tip">{{text('STATION.TERM.TIP')}}</span>
            </header>
            <article>
                <smart-switch v-model="workStation.terminal.enable" label="ENABLE"></smart-switch>
                <smart-input v-model="workStation.terminal.model" reg="^[a-zA-Z0-9_. ]{2,10}$" type="option" :options="devices" label="MODEL"></smart-input>
                <smart-input v-model="workStation.terminal.address" reg="^[0-9. ]{3,}$" label="ADDRESS"></smart-input>
                <smart-input v-model="workStation.terminal.port" reg="^[a-zA-Z0-9_. ]{2,10}$" label="PORT"></smart-input>
            </article>
        </section>
        <section class="card">
            <header>{{text('POLE_DISPLAY')}}
                <span class="tip">{{text('STATION.POLEDISPLAY.TIP')}}</span>
            </header>
            <article>
                <smart-switch v-model="workStation.pole.enable" label="ENABLE"></smart-switch>
                <smart-option v-model="workStation.pole.port" label="PORT" :options="ports"></smart-option>
            </article>
        </section>
        <section class="card">
            <header>{{text('WEIGHT_SCALE')}}</header>
            <article>
                <smart-switch v-model="workStation.scale.enable" label="ENABLE"></smart-switch>
                <smart-option v-model="workStation.scale.port" label="PORT" :options="ports"></smart-option>
            </article>
        </section>
        <section class="card">
            <header>{{text('SECURITY')}}</header>
            <article>
                <smart-range v-model="workStation.timeout" label="TIMEOUT" min="0" max="600" step="30"></smart-range>
            </article>
        </section>
        <section class="card">
            <header>{{text('UI')}}</header>
            <article class="grid">
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
import editor from './uiEditor'
export default {
    components: { smartInput, smartRange, smartSwitch, smartOption, editor },
    created() {
        this.workStation = Object.assign({}, {
            pole: {
                enable: false,
                port: 'COM4'
            },
            scale: {
                enable: false,
                port: 'COM2'
            }
        }, this.station);
    },
    data() {
        return {
            change: false,
            component: null,
            componentData: null,
            workStation: null,
            devices: ['S80', 'S300'],
            ports: ['COM1', 'COM2', 'COM3', 'COM4', 'COM5', 'COM6', 'COM7', 'COM8', 'COM9']
        }
    },
    methods: {
        edit(ui, index) {
            new Promise((resolve, reject) => {
                this.componentData = { resolve, reject, ui };
                this.component = "editor";
            }).then(result => {
                console.log(result)
                this.workStation.interface.splice(index, 1, result);
                this.$exitComponent();
            }).catch(() => {
                this.$exitComponent();
            })
        }
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
        ...mapGetters(['store', 'station'])
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
    padding: 25px 20px;
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