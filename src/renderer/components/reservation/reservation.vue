<template>
    <div class="reservation">
        <div class="frame">
            <div class="hourly" v-for="(value,key,index) in hours" :key="index">
                <h3 class="hour">{{key | hour}}</h3>
                <div class="book" v-for="(book,index) in value" :key="index" @click="getOption(book,$event)">
                    <span class="queue">
                        <span class="symbol">#</span>{{book.queue}}</span>
                    <div class="info">
                        <span class="name">{{book.name}}</span>
                        <span class="phone">{{book.phone | phone}}</span>
                    </div>
                    <div class="size">
                        <i class="fa fa-users"></i>
                        <span>{{book.size}}</span>
                    </div>
                </div>
            </div>
        </div>
        <div :is="component" :init="componentData"></div>
    </div>
</template>

<script>
import { mapGetters } from 'vuex'
import contextMenu from './menu'
export default {
    components: { contextMenu },
    data() {
        return {
            currentTimeFrame: moment().format('H'),
            componentData: null,
            component: null,
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
        },
        getOption(book, e) {
            this.$p("contextMenu", { left: e.pageX, top: e.pageY - 20 })
        }
    },
    filters: {
        phone(number) {
            return number.replace(/^\D?(\d{3})\D?\D?(\d{3})\D?(\d{4})/, "($1) $2-$3")
        },
        hour(value) {
            return `${value}:00`
        }
    },
    computed: {
        ...mapGetters(['reservation'])
    },
    sockets:{
        NEW_RESERVATION(){
            this.initial()
        }
    }
}
</script>

<style scoped>
.reservation {
    flex: 1;
    overflow:hidden;
}

.frame {
    display: flex;
    flex-direction: row;
    height: 100%;
    width: 3000px;
}

h3.hour {
    color: #757575;
    margin-bottom: 10px;
    font-weight: normal;
}

.hourly {
    width: 240px;
    padding: 10px;
}

.book {
    background: #fff;
    margin-bottom: 5px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, .3);
    display: flex;
    transition: transform 0.1s ease-out;
}

.book:active {
    transform: scale(0.97);
}

.info {
    display: flex;
    flex-direction: column;
    flex: 1;
    padding: 0 5px;
    justify-content: center;
}

.size {
    display: flex;
    flex-direction: column;
    padding: 0 5px;
    justify-content: center;
    align-items: center;
    width: 40px;
    background: #009688;
    color: #fff;
}

.size i {
    color: #0c6b62;
}

.name {
    text-transform: capitalize;
}

.symbol {
    font-size: 14px;
    color: #757575;
}

.queue {
    padding: 10px 5px;
    min-width: 35px;
    text-align: center;
    font-family: 'Agency FB';
    font-weight: bold;
    font-size: 1.25em;
    background: #ECEFF1;
}
</style>