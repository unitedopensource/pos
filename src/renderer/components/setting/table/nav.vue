<template>
<section class="route">
        <ul class="nav">
            <div class="wrap">
                <router-link tag="li" :to="{name:'Setting.table'}">
                    <i class="fa fa-square"></i>
                    <span class="text">{{$t('nav.seat')}}</span>
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
    <!-- <section class="route">
        <nav class="route">
            <header @click="back">
                <i class="fa fa-chevron-left"></i>{{$t('button.back')}}</header>
            <router-link :to="{name:'Setting.table'}" tag="div" append>{{$t('text.table')}}</router-link>
        </nav>
        <div class="content">
            <router-view class="inner"></router-view>
        </div>
    </section> -->
</template>

<script>
export default {
    methods: {
        back() {
            this.$router.push({ name: 'Setting.index' })
        }
    }
}
</script>

<style></style>