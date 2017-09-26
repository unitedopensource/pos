<template>
    <div>
        <section class="card list">
            <header>{{$t('title.timecard')}}</header>
            <div class="header">
                <span class="week">{{$t('text.date')}}</span>
                <span class="time">{{$t('text.clockInTime')}}</span>
                <span class="time">{{$t('text.clockOutTime')}}</span>
                <span class="hour">{{$t('text.workHour')}}</span>
                <span class="approve">{{$t('text.approve')}}</span>
            </div>
            <article>
                <div class="list" v-for="(log,index) in logs" :key="index">
                    <span class="week">{{log.clockIn | moment('ddd')}}</span>
                    <span class="time">{{log.clockIn | moment('M/D/YY HH:mm:ss')}}</span>
                    <span class="time">{{log.clockOut | moment('M/D/YY HH:mm:ss')}}</span>
                    <span class="hour">{{calc(log.clockIn,log.clockOut)}}</span>
                    <div class="approve" v-if="approval">
                        <button class="btn">{{$t('button.valid')}}</button>
                        <button class="btn">{{$t('button.invalid')}}</button>
                        <button class="btn">{{$t('button.edit')}}</button>
                    </div>
                    <div class="approve" v-else>
                        <i class="fa" :class="getIcon(log.valid)"></i>
                    </div>
                </div>
                <div class="more" @click="more">
                    <i class="fa fa-caret-down"></i>
                    <span>{{$t('button.viewMore')}}</span>
                </div>
            </article>
        </section>
    </div>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
    props: ['profile'],
    computed: {
        ...mapGetters(['op'])
    },
    data() {
        return {
            approval: false,
            logs: [],
            page: 0,
        }
    },
    created() {
        this.approval = this.profile.review ? this.profile.review.includes('timecard') : false;
        this.$socket.emit("[TIMECARD] RECORDS", { id: this.profile._id, index: this.page });
    },
    methods: {
        calc(clockIn, clockOut) {
            clockOut = clockOut || +new Date();
            let duration = clockOut - clockIn;
            if (isNumber(duration)) {
                let hh = ('00' + Math.floor((duration % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))).slice(-2);
                let mm = ('00' + Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60))).slice(-2);
                let ss = ('00' + Math.floor((duration % (1000 * 60)) / 1000)).slice(-2);

                return hh + ' ' + this.$t('text.hour') + ' ' + mm + ' ' + this.$t('text.minute') + ' ' + ss + ' ' + this.$t('text.second');
            }

        },
        getIcon(status) {
            return status ? 'fa-check-circle green' : 'fa-times-circle red';
        },
        more() {

        }
    },
    sockets: {
        OPERATOR_TIMECARD(logs) {
            this.logs.push(...logs);
        }
    }
}
</script>

<style scoped>
div.header {
    padding: 10px 0;
    background: #4D6D83;
    color: #fff;
    display: flex;
    border-bottom: 1px solid #455A64;
}

.approve {
    flex: 1;
    padding: 0 10px;
}

.week {
    width: 80px;
    text-align: center;
}

.time {
    padding: 0 10px;
    width: 130px;
}

.hour {
    width: 210px;
    padding: 0 10px;
}

article .list {
    display: flex;
    align-items: center;
    height: 40px;
}

.approve button {
    height: 25px;
    width: auto;
    padding: 0 10px;
    margin-left: 5px;
    cursor: pointer;
    font-size: initial;
    color: #333;
}

article .list:nth-child(even) {
    background: #F5F5F5;
}

i.red {
    color: var(--orange);
}

i.green {
    color: var(--green);
}
</style>