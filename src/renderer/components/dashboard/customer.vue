<template>
    <article>
        <section class="info">
            <div class="general">
                <header>
                    <span class="phone">{{customer.phone | tel}}</span>
                    <div class="date">
                        <div>
                            <span class="text">{{$t('dashboard.firstTime')}}</span>
                            <span class="value">{{customer.extra.firstDate | moment('MM/DD/YYYY')}}</span>
                        </div>
                        <div>
                            <span class="text">{{$t('dashboard.lastTime')}}</span>
                            <span class="value">{{customer.extra.lastDate | moment('MM/DD')}}
                                <span class="days">({{customer.extra.lastDate | fromNow}})</span>
                            </span>
                        </div>
                    </div>
                </header>
                <div class="data">
                    <div class="column" v-show="customer.name">
                        <span class="text">{{$t('dashboard.name')}}</span>
                        <span class="value">{{customer.name}}</span>
                    </div>
                    <div class="column f1">
                        <span class="text">{{$t('dashboard.address')}}</span>
                        <span class="value">{{customer.address}}</span>
                    </div>
                    <div class="column">
                        <span class="text">{{$t('dashboard.city')}}</span>
                        <span class="value">{{customer.city}}</span>
                    </div>
                    <div class="column">
                        <span class="text">{{$t('dashboard.distance')}}</span>
                        <span class="value">{{customer.distance}}</span>
                    </div>
                    <div class="column">
                        <span class="text">{{$('dashboard.duration')}}</span>
                        <span class="value">{{customer.duration}}</span>
                    </div>
                </div>
                <div class="tags">
                    <span class="text">{{$t('dashboard.tag')}}</span>
                    <div class="wrap">
                        <span class="tag" v-for="(tag,index) in tags" @click="add(tag)" :class="has(tag)" :key="index">{{text(tag)}}</span>
                    </div>
                </div>
            </div>
            <div class="extra">

            </div>
        </section>
        <section class="map">
            <img :src="url">
        </section>
    </article>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
export default {
    created() {
        this.getPolyline();
    },
    mounted() {
        if (this.customer.extra.hasOwnProperty('tag')) {
            this.applied = this.customer.extra.tag;
        } else {
            this.applied = this.customer.extra.tag = [];
        }
    },
    data() {
        return {
            tags: ['GOOD_CUST', 'BAD_CUST', 'FAR_AWAY', 'LOUSY_CUST', 'FRAUD', 'NO_SERVICE', 'IMPOLITE', 'WHITE', 'BLACK', 'MEXICAN', 'ASIAN', 'BAR', 'HOTEL'],
            applied: [],
            url: null,
            polyline: null,
            route: null,
            origin: null,
            destination: null
        }
    },
    methods: {
        add(tag) {
            let index = this.customer.extra.tag.indexOf(tag);
            index === -1 ? this.customer.extra.tag.push(tag) : this.customer.extra.tag.splice(index, 1);
        },
        has(tag) {
            return this.applied.indexOf(tag) === -1 ? "" : "yes";
        },
        getPolyline() {
            let { mapAPI, zipCode } = this.store;
            this.origin = `${this.store.address.split(' ').join('+')},${this.store.city.split(' ').join('+')}+${this.store.state}+${zipCode}`;
            this.destination = this.$options.filters.formatAddress(this.customer.address).split(' ').join('+');
            let url = `https://maps.googleapis.com/maps/api/directions/json?origin=${this.origin}&destination=${this.destination},${this.customer.city.split(' ').join('+')}+${this.store.state}+${zipCode}&mode=driving&key=${mapAPI}&language=en&units=imperial`;
            this.$socket.emit("[INQUIRY] GOOGLE_POLYLINE", url);
        }
    },
    computed: {
        ...mapGetters(['customer', 'store'])
    },
    filters: {
        formatAddress(address) {
            let reg = /\d+(\s+\w+){1,}\s+(?:st(?:\.|reet)?|dr(?:\.|ive)?|pl(?:\.|ace)?|ave(?:\.|nue)?|rd|road|lane|drive|way|court|plaza|square|run|parkway|point|pike|square|driveway|trace|park|terrace|blvd)/i;
            let match = address.match(reg);
            return match ? match[0] : address;
        }
    },
    sockets: {
        GOOGLE_MAP_POLYLINE(respond) {
            if (respond.statusCode === 200) {
                this.route = JSON.parse(respond.body);
                this.polyline = this.route.routes[0].overview_polyline.points;
                this.url = `https://maps.googleapis.com/maps/api/staticmap?scale=1&size=600x250&maptype=roadmap&format=png&path=enc:${this.polyline}`;
            }
        }
    }
}
</script>

<style scoped>
section.info {
    background: #fff;
    margin: 15px auto 0;
    width: 620px;
    box-shadow: var(--shadow);
}

img {
    border: 10px solid #fff;
    width: 600px;
    margin: 15px auto;
    display: block;
    box-shadow: 0 2px 2px rgba(0, 0, 0, .2), inset 0 1px 0 rgba(255, 255, 255, .3);
}

.phone {
    font-size: 24px;
    font-weight: bold;
    display: block;
    color: #455A64;
    margin-bottom: 10px;
}

.data {
    display: flex;
    padding-bottom: 5px;
    border-bottom: 1px dashed #ddd;
}

.column {
    display: flex;
    flex-direction: column;
    margin: 0 5px;
}

.general {
    padding: 15px;
    position: relative;
}

.text {
    color: gray;
    font-size: 14px;
}

.value {
    color: #3c3c3c;
}

.date {
    display: flex;
    position: absolute;
    top: 10px;
    right: 10px;
    flex-direction: row;
}

.date>div {
    display: flex;
    flex-direction: column;
    padding: 0 15px;
    border-left: 2px solid #9E9E9E;
}

.days {
    color: #009688;
    font-size: 0.8em;
}

.wrap {
    display: flex;
    flex-wrap: wrap;
}

.tags {
    margin-top: 5px;
}

.tag {
    padding: 3px 10px 5px;
    background: #CFD8DC;
    border: 1px solid #B0BEC5;
    color: #9E9E9E;
    opacity: 0.5;
    border-radius: 4px;
    margin: 3px;
}

.tag.yes {
    background: #FFC107;
    border: 1px solid #cea62e;
    color: #fff;
    opacity: 1;
    text-shadow: 0 1px 1px #333;
}
</style>