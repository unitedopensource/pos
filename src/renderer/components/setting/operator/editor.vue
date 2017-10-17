<template>
    <div class="popupMask center dark" @click.self="init.reject">
        <div class="editor">
            <header>
                <h2>Edit Clock Out</h2>
                <h4></h4>
            </header>
            <div class="inner">
                <div class="input">
                    <label>{{$t('text.clockOut')}}</label>
                    <input v-model="origin" :disabled="true">
                </div>
                <div class="input">
                    <label>{{$t('text.newTime')}}</label>
                    <input v-model="time" placeholder="MM/DD/YY HH:mm:ss">
                </div>
            </div>
            <footer>
                <button class="btn" @click="confirm" :disabled="!valid">{{$t('button.confirm')}}</button>
            </footer>
        </div>
    </div>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
    props: ['init'],
    data() {
        return {
            origin: undefined,
            time: ''
        }
    },
    created() {
        this.origin = this.init.log.clockOut ? moment(this.init.log.clockOut).format("MM/DD/YY HH:mm:ss") : '';
    },
    methods: {
        confirm() {
            let clockOut = +moment(this.time, 'MM/DD/YY HH:mm:ss')
            let timecard = {
                _id: this.init.log._id,
                clockOut,
                editor: this.op.name,
                edit: +new Date
            }
            this.$socket.emit("[TIMECARD] UPDATE", timecard, () => {
                this.$emit('refresh');
                this.init.resolve();
            })
        }
    },
    computed: {
        valid() {
            return moment(this.time, 'MM/DD/YY HH:mm:ss', true).isValid()
        },
        ...mapGetters(['op'])
    }
}
</script>