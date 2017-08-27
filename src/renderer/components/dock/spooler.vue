<template>
    <div class="popupMask" @click.self="exit">
        <div class="spooler">
            <ul>
                <li v-for="(invoice,index) in spooler" :key="index">
                    <span class="timer">{{invoice.delay | moment('hh:mm')}}</span>
                    <div class="f1">
                        <span class="invoice">{{invoice.number}}</span>
                        <span>{{$t('type.'+invoice.type)}}</span>
                        <span>{{$t(invoice.course)}}</span>
                    </div>
    
                    <span class="items" :title="invoice.content | tooltip(language)">{{$t('ITEM_PENDING',invoice.content.length)}}</span>
                    <i class="fa fa-print" @click="print(index)"></i>
                </li>
            </ul>
        </div>
    </div>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
    props: ['init'],
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
    min-width: 303px;
    font-size: 16px;
    position: absolute;
    right: 0px;
    top: 0px;
    background: rgba(0, 0, 0, 0.3);
    height: 728px;
    color: #424242;
    padding: 5px;
}

li {
    padding: 2px 10px;
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
}

.f1 {
    margin-left: 10px;
}

i {
    float: right;
    padding: 2px 5px;
}

.items {
    font-size: 11px;
    color: #FF9800;
    white-space: pre;
}
</style>