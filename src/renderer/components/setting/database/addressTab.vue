<template>
    <div>
        <ul class="tabs">
            <router-link tag="li" class="tab" :to="{name:'Setting.database.address'}">{{$t('nav.list')}}</router-link>
            <router-link tag="li" class="tab" :to="{name:'Setting.database.address.detail'}">{{$t('nav.detail')}}</router-link>
        </ul>
        <transition name="slide" mode="out-in">
            <router-view class="tab-content" :addresses="addresses" @update="setPage"></router-view>
        </transition>
    </div>
</template>

<script>
export default {
    data() {
        return {
            addresses: [],
            page: 0
        }
    },
    beforeRouteEnter: (to, from, next) => {
        appSocket.emit("[ADDRESS] LIST", 0, addresses => {
            next(vm => {
                vm.addresses = addresses
            })
        })
    },
    methods: {
        setPage(page) {
            this.page = page;
        }
    },
    watch: {
        page(n) {
            this.$socket.emit("[ADDRESS] LIST", n, addresses => {
                this.addresses = addresses;
            })
        }
    }
}
</script>