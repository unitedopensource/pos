<template>
    <section class="route">
        <ul class="nav">
            <div class="wrap">
                <router-link tag="li" :to="{name:'Setting.sales'}">
                    <i class="fa fa-industry"></i>
                    <span class="text">{{$t('nav.sales')}}</span>
                </router-link>
                <router-link tag="li" :to="{name:'Setting.chart'}">
                    <i class="fa fa-table"></i>
                    <span class="text">{{$t('nav.chart')}}</span>
                </router-link>
            </div>
            <router-link tag="li" :to="{name:'Setting.index'}">
                <i class="fa fa-arrow-circle-left"></i>
                <span class="text">{{$t('nav.back')}}</span>
            </router-link>
        </ul>
        <transition name="switch">
            <router-view class="page"></router-view>
        </transition>
    </section>
</template>

<script>
export default {

}
</script>
