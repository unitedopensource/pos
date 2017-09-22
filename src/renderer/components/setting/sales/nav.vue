<template>
    <section class="route">
        <ul class="nav">
            <div class="wrap">
                <router-link tag="li" :to="{name:'Setting.sales'}">
                    <i class="fa fa-industry"></i>
                    <span class="text">{{$t('nav.sales')}}</span>
                </router-link>
                <router-link tag="li" :to="{name:'Setting.coupon'}">
                    <i class="fa fa-tags"></i>
                    <span class="text">{{$t('nav.coupon')}}</span>
                </router-link>
            </div>
            <router-link tag="li" :to="{name:'Setting.index'}">
                <i class="fa fa-arrow-circle-left"></i>
                <span class="text">{{$t('nav.back')}}</span>
            </router-link>
        </ul>
        <section class="content">
            <transition name="switch">
                <router-view class="page"></router-view>
            </transition>
        </section>
    </section>
</template>

<script>
export default {

}
</script>
