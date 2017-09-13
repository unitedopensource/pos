<template>
    <div class="popupMask center dark" @click.self="init.reject">
        <div class="editor">
            <header>{{$t('title.scanner')}}</header>
            <div class="wrap">
                <div class="search">
                    <i class="fa fa-search"></i>
                    <input type="text" v-model.number="port" @keydown.enter="search">
                    <i class="fa fa-times" @click="reset"></i>
                </div>
            </div>
            <ul class="results">
                <li v-for="(ip,index) in results" :key="index">
                    <input type="radio" name="ip" v-model="target" :id="'ip'+index" :value="ip">
                    <label :for="'ip'+index">{{ip}}</label>
                </li>
            </ul>
            <footer>
                <div class="btn" @click="scan" v-if="results.length === 0">{{$t('button.scan')}}</div>
                <div class="btn" @click="confirm" v-else>{{$t('button.confirm')}}</div>
            </footer>
        </div>
    </div>
</template>

<script>
import Pax from '../../payment/parser/pax'
export default {
    props: ['init'],
    data() {
        return {
            port: 10009,
            results: [],
            target: null
        }
    },
    methods: {
        scan() {
            this.$socket.emit("SCAN", this.port, (ip) => {
                this.results = ip
            })
        },
        confirm() {
            Pax.initial(this.target, this.port).then(r => r.text()).then((device) => {
                let terminal = Pax.check(device);
                terminal.code === '000000' &&
                    this.init.resolve({
                        address: this.target,
                        port: this.port,
                        model: terminal.model,
                        sn: terminal.sn
                    })
            })
        },
        reset() {
            this.port = 10009;
            this.results = [];
            this.target = null;
        }
    }
}
</script>

<style scoped>
.search {
    padding: 5px;
    background: #fff;
    border-bottom: 1px solid #eee;
    display: flex;
    font-size: 1.25em;
    color: #333;
}

input[type='text'] {
    flex: 1;
    width: auto;
    border: none;
    outline: none;
    padding: 5px 10px;
}

input[type='radio'] {
    display: none;
}

label {
    padding: 15px;
    background: #fff;
    margin: 3px 5px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
    cursor: pointer;
}

li {
    display: flex;
    flex-direction: column;
}

li input:checked+label {
    background: #009688;
    color: #fff;
}
</style>
