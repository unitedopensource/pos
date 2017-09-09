<template>
    <transition name="pop">
        <div class="caller" v-show="this.$route.name === 'Dashboard'" @click="go">
            <header>
                <span class="f1">{{$t('dock.incomingCall')}}</span>
                <span class="time">{{customer.extra.lastDate | fromNow}}</span>
            </header>
            <div class="wrap">
                <i class="fa fa-3x fa-phone icon"></i>
                <div class="info">
                    <div class="phone">{{customer.phone | tel}}</div>
                    <div class="address">
                        <span>{{customer.address}}</span>
                        <span>{{customer.city}}</span>
                    </div>
                </div>
            </div>
            <div class="tags">
                <span class="tag" v-for="(tag,index) in customer.extra.tag" :key="index">{{$t('tag.'+tag)}}</span>
            </div>
        </div>
    </transition>
</template>

<script>
import { mapActions } from 'vuex'
export default {
    props: ['init'],
    data() {
        return {
            customer: {}
        }
    },
    created() {
        this.customer = this.init.customer;
    },
    methods: {
        go() {
            this.setCustomer(this.customer);
            this.setTicket({ type: 'DELIVERY' });
            this.$router.push({ name: 'Information' });
            this.init.resolve()
        },
        ...mapActions(['setCustomer', 'setTicket'])
    }
}
</script>

<style scoped>
.caller {
    width: 290px;
    position: fixed;
    top: 65px;
    left: 100px;
    background: #fff;
    color: #555;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

header {
    background: #29B6F6;
    color: aliceblue;
    font-size: 18px;
    padding: 2px 10px;
    display: flex;
    text-shadow: 0 1px 1px #555;
}

.wrap {
    position: relative;
    padding: 5px 10px;
    display: flex;
}


@keyframes pop {
    0% {
        transform: scale(0);
        opacity: 0
    }
    70% {
        transform: scale(1.1);
        opacity: 1
    }
    100% {
        transform: scale(1);
        opacity: 1
    }
}

.pop-enter-active {
    animation: pop .3s ease;
}

.pop-leave-active {
    animation: pop .3s ease reverse;
}

.time {
    font-weight: lighter;
    font-size: 14px;
}

.phone {
    font-family: "Agency FB";
    font-weight: bold;
    font-size: 22px;
    line-height: 22px;
    color: #616161;
    margin: 2px 0;
}

.address {
    font-size: 16px;
    display: flex;
    flex-direction: column;
}

.address span {
    height: 16px;
    line-height: 16px;
    color: #b9b9b9;
    font-size: 18px;
    text-align: left;
}

.info {
    flex: 1;
    display: flex;
    margin-left: 10px;
    flex-direction: column;
    align-items: flex-start;
}

.tags {
    background: #f1f1f1;
    padding: 0 5px;
    font-size: 16px;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    line-height: initial;
}

.tag {
    font-size: 14px;
    background: #FF9800;
    color: #fff;
    text-shadow: 0 1px 1px #333;
    padding: 5px;
    margin: 2px;
    border-radius: 4px;
}

.icon {
    color: #009688;
    text-shadow: 0 1px 1px #333;
    width: 60px;
    text-align: center;
}
</style>