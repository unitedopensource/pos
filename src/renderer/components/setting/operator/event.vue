<template>
    <div>
        <section class="card list">
            <header>{{$t('setting.timeCardActivity')}}
                <span class="tip">{{text('setting.timeCardActivityTip')}}</span>
            </header>
            <div class="header">
                <span class="approve">{{$t('text.approve')}}</span>
                <span class="time">{{$t('text.clockInTime')}}</span>
                <span class="time">{{$t('text.clockOutTime')}}</span>
                <span class="calc">{{$t('text.workHour')}}</span>
            </div>
            <article>
                <div class="datalist" v-for="(log,index) in activities" :key="index">
                    <span class="approve">{{log.valid}}</span>
                    <span class="time">{{log.clockIn | moment('M/D/YY HH:mm:ss')}}</span>
                    <span class="time">{{log.clockOut | moment('M/D/YY HH:mm:ss')}}</span>
                    <span class="calc">{{workHour(log.clockIn,log.clockOut)}}</span>
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
export default {
    props: ['profile'],
    data() {
        return {
            activities: []
        }
    },
    methods:{
        more(){
            
        }
    }
}
</script>