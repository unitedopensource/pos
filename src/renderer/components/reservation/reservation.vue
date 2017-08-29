<template>
    <div class="reservation">
        <div class="frame">
            <div class="hourly" v-for="(value,key,index) in hours" :key="index">
                <h3 class="hour">{{key | hour}}</h3>
                <div class="book" v-for="(book,index) in value" :key="index">
                    <span class="queue">{{book.size}}</span>
                    <div class="info">
                        <span class="name">{{book.name}}</span>
                        <span class="phone">{{book.phone}}</span>
                    </div>
                    <div>alert</div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
    data() {
        return {
            currentTimeFrame: moment().format('H'),
            hours: {}
        }
    },
    created() {
        this.initial();
    },
    methods: {
        initial() {
            let hours = {};
            this.reservation.forEach(book => {
                let frame = new Date(book.time).getHours();
                hours.hasOwnProperty(frame) ? hours[frame].push(book) : hours[frame] = [book]
            });
            this.hours = hours
        }
    },
    filters: {
        hour(value) {
            return `${value}:00`
        }
    },
    computed: {
        ...mapGetters(['reservation'])
    }
}
</script>

<style scoped>
.reservation {
    flex: 1;
}
.frame{
    display: flex;
    flex-direction: row;
    height: 100%;
}
h3.hour {
    color: #757575;
    margin-bottom: 10px;
    font-weight: normal;
}

.hourly {
    width: 200px;
    padding: 10px;
}

.book {
    background: #fff;
    margin-bottom: 5px;
    box-shadow: 0 1px 3px rgba(0,0,0,.3);
    display: flex;
}

.info {
    display: flex;
    flex-direction: column;
}

span.queue {
    padding: 15px 5px;
    width: 25px;
    text-align: center;
    font-family: 'Agency FB';
}
</style>