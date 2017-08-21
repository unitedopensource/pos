<template>
    <div class="creditCard">
        <i class="fa" :class="[icon]"></i>
        <h3>{{msg}}</h3>
        <footer>
            <div class="btn" @click="exit">{{text('CANCEL')}}</div>
        </footer>
    </div>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
    props: ['init'],
    data() {
        return {
            msg: "",
            config: null,
            icon: "info",
            timeout: null,
            transacting: false,
            terminal: null,
            device: null,
            url: null
        }
    },
    created() {
        this.station.terminal.enable ?
            this.initTerminal() :
            this.init.reject({ type: 'info', title: 'PYMT_F', msg: 'STA_TERM_NA', buttons: [{ text: 'CANCEL', fn: 'reject' }, { text: 'CONTINUE', fn: 'resolve' }] })
    },
    methods: {
        initTerminal() {
            let terminal = this.station.terminal;
            this.msg = this.text('TERM_INIT', terminal.model);
            this.terminal = this.getFile(terminal.model);
            this.terminal.initial(terminal.address, terminal.port, terminal.sn).then(response => response.text()).then((device) => {
                this.device = this.terminal.check(device);
                if (this.device.code !== "000000") {
                    this.terminalError(this.text("TERM_INIT_F", this.device.model || terminal.model));
                    return;
                }
                clearTimeout(this.timeout);
                setTimeout(() => {
                    let { creditCard } = this.init.card;
                    this.msg = (creditCard.number && creditCard.date) ?
                        this.text('TERM_COMM', this.device.model || terminal.model) :
                        this.text("TERM_MANUAL", this.device.model || terminal.model);
                }, 2000)
                this.transacting = true;
                this.terminal.charge(this.init.card).then(response => response.text()).then(data => {
                    let result = this.terminal.explainTransaction(data);
                    result.code === "000000" ? this.init.resolve(result) : this.terminalError(this.text(result.msg));
                })
            });
            this.timeout = setTimeout(() => {
                this.init.reject({ type: "warning", title: "TERM_TIMEOUT", msg: this.text("TIP_TERM_TIMEOUT", terminal.address), buttons: [{ text: 'CONFIRM', fn: 'reject' }] })
            }, 6000)
        },
        terminalError(msg) {
            this.icon = "error";
            this.msg = msg;
            setTimeout(() => { this.init.reject(false) }, 1500);
        },
        getFile(device) {
            switch (device) {
                case 'SP30':
                case 'S80':
                case 'S300':
                    return require('./parser/pax.js')
                case 'NX2200':
                    return require('./parser/exadigm.js')
                default:
                    return require('./parser/pax.js')
            }
        },
        exit() {
            if (this.transacting) {
                this.msg = this.text('TERM_ABORT');
                this.terminal.abort();
                this.transacting = false;
                setTimeout(() => { this.init.reject(false) }, 800);
            } else { this.init.reject(false) }
        }
    },
    computed: {
        ...mapGetters(['station'])
    }
}
</script>

<style scoped>
.creditCard {
    background: #EFF3F6;
    width: 400px;
    min-height: 170px;
    border-radius: 4px;
    text-align: center;
    color: #3c3c3c;
    box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 3px 1px -2px rgba(0, 0, 0, 0.12), 0 1px 5px 0 rgba(0, 0, 0, 0.2);
}

i {
    font-size: 6em;
    text-shadow: 0 1px 1px rgba(0, 0, 0, 0.3);
    margin: 15px 0;
}

footer {
    background: #eee;
    margin-top: 15px;
}

.btn {
    margin: 10px;
    width: 90%;
}
</style>
