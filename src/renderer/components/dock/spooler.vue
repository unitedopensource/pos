<template>
    <div class="popupMask" @click.self="exit">
        <div class="spooler">
            <header>
                <nav>
                    <div>
                        <input type="radio" name="tab" v-model="tab" id="info" value="message">
                        <label for="info">{{$t('text.message')}}</label>
                    </div>
                    <div>
                        <input type="radio" name="tab" v-model="tab" id="queue" value="queue">
                        <label for="queue">{{$t('text.queue')}}</label>
                    </div>
                </nav>
                <i class="fa fa-bell"></i>
                <i class="fa fa-bars"></i>
            </header>
            <ul>
                <li v-for="(invoice,index) in spooler" :key="index">
                    <span class="timer">{{invoice.delay | moment('hh:mm')}}</span>
                    <div class="f1">
                        <span class="invoice">{{invoice.number}}</span>
                        <span>{{$t('type.'+invoice.type)}}</span>
                        <span>{{invoice.course}}</span>
                    </div>
                    <span class="items" :title="invoice.content | tooltip(language)">{{$t('text.queueItem',invoice.content.length)}}</span>
                    <i class="fa fa-print print" @click="print(index)"></i>
                </li>
            </ul>
        </div>
    </div>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
    props: ['init'],
    data() {
        return {
            tab: 'queue'
        }
    },
    methods: {
        exit() {
            this.$emit("exit")
        },
        print(index) {
            this.$emit("print", index)
        }
    },
    filters: {
        tooltip(data, lang) {
            return data.map(item => (item.qty + ' ' + item[lang])).join("\n")
        }
    },
    computed: {
        ...mapGetters(['spooler', 'language'])
    }
}
</script>

<style scoped>
.spooler {
    min-width: 302px;
    font-size: 16px;
    position: absolute;
    right: 10px;
    top: 10px;
    overflow: hidden;
    background: rgba(250, 250, 250, 0.43);
    max-height: 705px;
    color: #424242;
    border-radius: 2px;
    box-shadow: 0 1px 6px rgba(0, 0, 0, 0.5);
}

header {
    display: flex;
    background: #4FC3F7;
    color: #fff;
    line-height: initial;
    padding: 10px;
}

nav {
    display: flex;
    align-items: center;
    text-shadow: 0 1px 1px rgba(0, 0, 0, 0.4);
    flex: 1;
}

input {
    display: none;
}

header i {
    color: #bdebff;
    padding: 0 5px;
    cursor: pointer;
}

label {
    border-bottom: 2px solid transparent;
    padding-bottom: 9px;
    margin-right: 10px;
    cursor: pointer;
    transition: all 0.3s ease;
}

input:checked+label {
    border-bottom: 2px solid #E1F5FE;
}

ul {
    padding: 7px;
}

li {
    padding: 5px;
    margin-bottom: 0px;
    background: #fff;
    border-bottom: 1px solid #ddd;
    display: flex;
    align-items: center;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
}

.timer {
    background: #03A9F4;
    color: #fff;
    padding: 0px 3px;
    border-radius: 4px;
    width: 30px;
    display: inline-block;
    font-family: 'Agency FB';
    text-align: center;
    height: 20px;
    line-height: 20px;
    text-shadow: 0 1px 1px #333;
}

.f1 {
    margin-left: 10px;
}

li.i {
    float: right;
    padding: 2px 5px;
}

.items {
    font-size: 11px;
    color: #FF9800;
    white-space: pre;
}

i.print {
    padding: 0 5px;
}
</style>