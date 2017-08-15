<template>
    <div class="popupMask center dark" @click.self="init.reject">
        <div class="window">
            <header class="title">
                <span>{{text('TIMER')}}</span>
            </header>
            <div class="inner">
                <section class="date">
                    <div class="wrap">
                        <div class="day" v-for="(day,i) in days" :key="i">
                            <span class="week">{{day | moment('ddd')}}</span>
                            <span class="value">{{day | moment('D')}}</span>
                        </div>
                    </div>
                    <div class="leftDate"></div>
                    <div class="rightDate"></div>
                </section>
                <section class="clock">
    
                </section>
            </div>
            <footer>
                <div class="btn" @click="init.reject">{{text('CANCEL')}}</div>
                <div class="btn" @click="confirm">{{text('CONFIRM')}}</div>
            </footer>
        </div>
    </div>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
    props: ['init'],
    components: {},
    data() {
        return {
            days: []
        }
    },
    created() {
        this.initial()
    },
    methods: {
        initial() {
            let today = moment().startOf('days');
            for (let i = -4; i < 0; i++) {
                let date = today.clone().subtract(i, 'days')
                this.days.push(date)
            }
            for (let i = 0; i < 5; i++) {
                let date = today.clone().add(i, 'days')
                this.days.push(date)
            }
        },
        confirm() {

        }
    },
    computed: {
        ...mapGetters(['op', 'language'])
    }
}
</script>

<style scoped>
.inner {
    width: 540px;
}

.date .wrap {
    display: flex;
}

.date .day {
    width: 55px;
    padding: 5px;
    display: flex;
    flex-direction: column;
    text-align: center;
}

.day>span {
    width: 50px;
}
</style>