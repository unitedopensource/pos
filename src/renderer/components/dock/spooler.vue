<template>
    <div class="popupMask" @click.self="exit">
        <div class="spooler">
            <ul>
                <li v-for="(invoice,index) in spooler">
                    <span class="timer">{{invoice.delay | moment('hh:mm')}}</span>
                    <span class="invoice">{{invoice.number}}</span>
                    <span>{{text(invoice.type)}}</span>
                    <span>{{text(invoice.course)}}</span>
                    <span class="items" :title="invoice.content | tooltip(language)">{{text('ITEM_PENDING',invoice.content.length)}}</span>
                    <i class="fa fa-print" @click="print(index)"></i>
                </li>
            </ul>
        </div>
    </div>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
    methods: {
        exit() {
            this.$emit("exit")
        },
        print(index) {
            this.$emit("print", index)
        }
    },
    filters:{
        tooltip(data,lang){
            return data.map(item=>(item.qty + ' ' + item[lang])).join("\n")
        }
    },
    computed: {
        ...mapGetters(['spooler','language'])
    }
}
</script>

<style scoped>
.spooler {
    min-width: 280px;
    font-size: 16px;
    position: absolute;
    right: 0;
    top: 0px;
    background: #f4f8fb;
    color: #424242;
    border: 2px solid #607d8b;
    box-shadow: -1px 4px 7px rgba(0, 0, 0, 0.4);
}

li {
    padding: 5px 10px;
    background: #fff;
    border-bottom: 1px solid #ddd;
}

.timer {
    background: #03A9F4;
    color: #fff;
    padding: 1px 3px;
    border-radius: 4px;
    width: 30px;
    display: inline-block;
    font-family: 'Agency FB';
    text-align: center;
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