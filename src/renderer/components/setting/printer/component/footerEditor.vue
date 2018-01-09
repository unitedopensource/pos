<template>
    <div class="popupMask dark center" @click.self="init.reject">
        <div class="editor">
            <header>
                <h5>{{$t('title.edit')}}</h5>
                <h3>{{$t('title.footer')}}</h3>
            </header>
            <div class="wrap">
                <inputer type="textarea" v-model.trim="footer" title="text.content" :center="true"></inputer>
                <switches title="print.ticketNumber" v-model="number"></switches>
                <switches title="print.tableName" v-model="table"></switches>
                <switches title="print.jobTime" v-model="time"></switches>
            </div>
            <footer>
                <button class="btn" @click="confirm">{{$t('button.confirm')}}</button>
            </footer>
        </div>
    </div>
</template>

<script>
import inputer from "../../common/inputer";
import switches from "../../common/switches";

export default {
    props: ["init"],
    components: { inputer, switches },
    data() {
        return {
            footer: this.init.footer,
            number: false,
            table: false,
            time: false
        };
    },
    methods: {
        confirm() {
            const config = {
                number: this.number,
                table: this.table,
                time: this.time,
                footer: this.footer.split(String.fromCharCode(10))
            }
            this.init.resolve(config);
        }
    }
};
</script>