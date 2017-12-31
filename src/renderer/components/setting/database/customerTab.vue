<template>
    <div>
        <ul class="tabs">
            <router-link tag="li" class="tab" :to="{name:'Setting.database.customer'}">{{$t('nav.list')}}</router-link>
            <router-link tag="li" class="tab" :to="{name:'Setting.database.customer.analyze'}">{{$t('nav.analyze')}}</router-link>
        </ul>
        <transition name="slide" mode="out-in">
            <router-view class="tab-content" :customers="customers"></router-view>
        </transition>
    </div>
</template>

<script>
export default {
    data() {
        return {
            customers: [],
            page: 0
        }
    },
    beforeRouteEnter: (to, from, next) => {
        appSocket.emit("[CUSTOMER] LIST", 0, customers => {
            next(vm => {
                vm.customers = customers
            })
        })
    }

}
</script>