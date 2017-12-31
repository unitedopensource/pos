<template>
    <div>
        <ul class="tabs">
            <router-link tag="li" class="tab" :to="{name:'Setting.database.address'}">{{$t('nav.list')}}</router-link>
            <template v-if="address">
                <router-link tag="li" class="tab" :to="{name:'Setting.database.address.detail',params:{address}}">{{$t('nav.detail')}}</router-link>
            </template>
        </ul>
        <transition name="slide" mode="out-in">
            <router-view class="tab-content" :addresses="addresses" @update="setPage" @set="setAddress" @reset="address = null"></router-view>
        </transition>
    </div>
</template>

<script>
export default {
    data() {
        return {
            addresses: [],
            address: null,
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
        setAddress(address) {
            this.address = address;
            this.$router.push({ name: 'Setting.database.address.detail', params: { address } })
        },
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